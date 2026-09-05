import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  createMint,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  mintTo,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("pool_tmp", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const idl = require("../target/idl/ortaq.json");
  const program = new anchor.Program(idl, provider) as Program<any>;
  const conn = provider.connection;
  const payer = (provider.wallet as any).payer as anchor.web3.Keypair;

  let mint: anchor.web3.PublicKey;
  const users: anchor.web3.Keypair[] = [];
  const userAtas: anchor.web3.PublicKey[] = [];
  const recipient = anchor.web3.Keypair.generate();
  let recipientAta: anchor.web3.PublicKey;

  const poolPda = (id: number) =>
    anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("pool"),
        provider.wallet.publicKey.toBuffer(),
        new anchor.BN(id).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    )[0];

  const vaultPda = (pool: anchor.web3.PublicKey) =>
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), pool.toBuffer()],
      program.programId
    )[0];

  const contribPda = (
    pool: anchor.web3.PublicKey,
    user: anchor.web3.PublicKey
  ) =>
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("contrib"), pool.toBuffer(), user.toBuffer()],
      program.programId
    )[0];

  // уникальный префикс, чтобы прогоны не конфликтовали между собой на devnet
  const RUN = Math.floor(Math.random() * 100000);

  before(async () => {
    console.log("payer:", provider.wallet.publicKey.toBase58());

    mint = await createMint(conn, payer, provider.wallet.publicKey, null, 6);
    await sleep(3000);
    console.log("mint:", mint.toBase58());

    const tx = new anchor.web3.Transaction();

    for (let i = 0; i < 3; i++) {
      const kp = anchor.web3.Keypair.generate();
      users.push(kp);
      const ata = getAssociatedTokenAddressSync(mint, kp.publicKey);
      userAtas.push(ata);

      tx.add(
        anchor.web3.SystemProgram.transfer({
          fromPubkey: provider.wallet.publicKey,
          toPubkey: kp.publicKey,
          lamports: 0.05 * anchor.web3.LAMPORTS_PER_SOL,
        }),
        createAssociatedTokenAccountIdempotentInstruction(
          provider.wallet.publicKey, ata, kp.publicKey, mint
        )
      );
    }

    recipientAta = getAssociatedTokenAddressSync(mint, recipient.publicKey);
    tx.add(
      createAssociatedTokenAccountIdempotentInstruction(
        provider.wallet.publicKey, recipientAta, recipient.publicKey, mint
      )
    );

    const sig = await provider.sendAndConfirm(tx);
    await conn.confirmTransaction(sig, "finalized");
    await sleep(2000);

    for (let i = 0; i < 3; i++) {
      await mintTo(conn, payer, mint, userAtas[i], payer, 1_000_000_000);
    }

    console.log("recipient:", recipient.publicKey.toBase58());
  });

  it("успешный сбор: цель достигнута, деньги ушли получателю", async () => {
    const id = RUN * 10 + 1;
    const pool = poolPda(id);
    const vault = vaultPda(pool);

    await program.methods
      .createPool(
        new anchor.BN(id),
        new anchor.BN(300_000_000),
        new anchor.BN(3600)
      )
      .accountsPartial({
        organizer: provider.wallet.publicKey,
        recipient: recipient.publicKey,
        mint,
        pool,
        vault,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    for (let i = 0; i < 3; i++) {
      await program.methods
        .contribute(new anchor.BN(100_000_000))
        .accountsPartial({
          contributor: users[i].publicKey,
          pool,
          vault,
          contributorToken: userAtas[i],
          contribution: contribPda(pool, users[i].publicKey),
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([users[i]])
        .rpc();
    }

    const state = await program.account.pool.fetch(pool);
    assert.equal(state.raised.toNumber(), 300_000_000, "собрано не сошлось");
    assert.equal(state.contributorCount, 3, "счётчик участников не сошёлся");

    const before = Number((await getAccount(conn, recipientAta)).amount);

    // release вызывает организатор, но мог бы кто угодно
    await program.methods
      .release()
      .accountsPartial({
        caller: provider.wallet.publicKey,
        pool,
        vault,
        recipientToken: recipientAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const after = Number((await getAccount(conn, recipientAta)).amount);
    assert.equal(after - before, 300_000_000, "получатель не получил деньги");

    const closed = await program.account.pool.fetch(pool);
    assert.equal(closed.status, 1, "статус не сменился на «выплачен»");

    const vaultAcc = await getAccount(conn, vault);
    assert.equal(Number(vaultAcc.amount), 0, "в хранилище осталась пыль");
  });

  it("организатор НЕ может забрать деньги при недостигнутой цели", async () => {
    const id = RUN * 10 + 2;
    const pool = poolPda(id);
    const vault = vaultPda(pool);

    // срок 8 секунд — перемотка времени не нужна
    await program.methods
      .createPool(
        new anchor.BN(id),
        new anchor.BN(500_000_000),
        new anchor.BN(8)
      )
      .accountsPartial({
        organizer: provider.wallet.publicKey,
        recipient: recipient.publicKey,
        mint,
        pool,
        vault,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    await program.methods
      .contribute(new anchor.BN(100_000_000))
      .accountsPartial({
        contributor: users[0].publicKey,
        pool,
        vault,
        contributorToken: userAtas[0],
        contribution: contribPda(pool, users[0].publicKey),
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([users[0]])
      .rpc();

    // ГЛАВНАЯ ПРОВЕРКА ДЕМО: забрать нельзя
    let rejected = false;
    try {
      await program.methods
        .release()
        .accountsPartial({
          caller: provider.wallet.publicKey,
          pool,
          vault,
          recipientToken: recipientAta,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
    } catch (e: any) {
      rejected = true;
      assert.include(e.toString(), "GoalNotReached");
    }
    assert.isTrue(rejected, "release прошёл, хотя цель не достигнута!");

    // ждём истечения срока
    await sleep(10000);

    const before = Number((await getAccount(conn, userAtas[0])).amount);

    await program.methods
      .refund()
      .accountsPartial({
        contributor: users[0].publicKey,
        pool,
        vault,
        contributorToken: userAtas[0],
        contribution: contribPda(pool, users[0].publicKey),
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([users[0]])
      .rpc();

    const after = Number((await getAccount(conn, userAtas[0])).amount);
    assert.equal(after - before, 100_000_000, "вернулась не та сумма");

    const vaultAcc = await getAccount(conn, vault);
    assert.equal(Number(vaultAcc.amount), 0, "хранилище не обнулилось");

    // повторный возврат отклонён
    let second = false;
    try {
      await program.methods
        .refund()
        .accountsPartial({
          contributor: users[0].publicKey,
          pool,
          vault,
          contributorToken: userAtas[0],
          contribution: contribPda(pool, users[0].publicKey),
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([users[0]])
        .rpc();
    } catch {
      second = true;
    }
    assert.isTrue(second, "повторный возврат прошёл — это баг");
  });
});