import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  createMint, getOrCreateAssociatedTokenAccount, mintTo, getAccount,
} from "@solana/spl-token";
import { assert } from "chai";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("ortaq", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Ortaq as Program<any>;
  const conn = provider.connection;
  const payer = (provider.wallet as any).payer;

  let mint: anchor.web3.PublicKey;
  const users: anchor.web3.Keypair[] = [];
  const userAtas: anchor.web3.PublicKey[] = [];
  const recipient = anchor.web3.Keypair.generate();
  let recipientAta: anchor.web3.PublicKey;

  const poolPda = (id: number) =>
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), provider.wallet.publicKey.toBuffer(), new anchor.BN(id).toArrayLike(Buffer, "le", 8)],
      program.programId
    )[0];

  const vaultPda = (pool: anchor.web3.PublicKey) =>
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), pool.toBuffer()], program.programId)[0];

  const contribPda = (pool: anchor.web3.PublicKey, user: anchor.web3.PublicKey) =>
    anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("contrib"), pool.toBuffer(), user.toBuffer()], program.programId)[0];

  before(async () => {
    mint = await createMint(conn, payer, provider.wallet.publicKey, null, 6);

    for (let i = 0; i < 3; i++) {
      const kp = anchor.web3.Keypair.generate();
      users.push(kp);
      const sig = await conn.requestAirdrop(kp.publicKey, 2e9);
      await conn.confirmTransaction(sig);
      const ata = await getOrCreateAssociatedTokenAccount(conn, payer, mint, kp.publicKey);
      userAtas.push(ata.address);
      await mintTo(conn, payer, mint, ata.address, payer, 1_000_000_000);
    }

    const rAta = await getOrCreateAssociatedTokenAccount(conn, payer, mint, recipient.publicKey);
    recipientAta = rAta.address;
  });

  it("успешный сбор: цель достигнута, деньги у получателя", async () => {
    const id = 1;
    const pool = poolPda(id);
    const vault = vaultPda(pool);

    await program.methods
      .createPool(new anchor.BN(id), new anchor.BN(300_000_000), new anchor.BN(3600))
      .accounts({
        organizer: provider.wallet.publicKey,
        recipient: recipient.publicKey,
        mint, pool, vault,
      })
      .rpc();

    for (let i = 0; i < 3; i++) {
      await program.methods
        .contribute(new anchor.BN(100_000_000))
        .accounts({
          contributor: users[i].publicKey,
          pool, vault,
          contributorToken: userAtas[i],
          contribution: contribPda(pool, users[i].publicKey),
        })
        .signers([users[i]])
        .rpc();
    }

    const state = await program.account.pool.fetch(pool);
    assert.equal(state.raised.toNumber(), 300_000_000);
    assert.equal(state.contributorCount, 3);

    await program.methods
      .release()
      .accounts({
        caller: provider.wallet.publicKey,
        pool, vault, recipientToken: recipientAta,
      })
      .rpc();

    const got = await getAccount(conn, recipientAta);
    assert.equal(Number(got.amount), 300_000_000);
    const after = await program.account.pool.fetch(pool);
    assert.equal(after.status, 1);
  });

  it("организатор не может забрать деньги при недостигнутой цели", async () => {
    const id = 2;
    const pool = poolPda(id);
    const vault = vaultPda(pool);

    await program.methods
      .createPool(new anchor.BN(id), new anchor.BN(500_000_000), new anchor.BN(5))
      .accounts({
        organizer: provider.wallet.publicKey,
        recipient: recipient.publicKey,
        mint, pool, vault,
      })
      .rpc();

    await program.methods
      .contribute(new anchor.BN(100_000_000))
      .accounts({
        contributor: users[0].publicKey,
        pool, vault,
        contributorToken: userAtas[0],
        contribution: contribPda(pool, users[0].publicKey),
      })
      .signers([users[0]])
      .rpc();

    let failed = false;
    try {
      await program.methods.release()
        .accounts({ caller: provider.wallet.publicKey, pool, vault, recipientToken: recipientAta })
        .rpc();
    } catch (e: any) {
      failed = true;
      assert.include(e.toString(), "GoalNotReached");
    }
    assert.isTrue(failed, "release не должен был пройти");

    // ждём истечения срока
    await sleep(7000);

    const before = Number((await getAccount(conn, userAtas[0])).amount);

    await program.methods.refund()
      .accounts({
        contributor: users[0].publicKey,
        pool, vault,
        contributorToken: userAtas[0],
        contribution: contribPda(pool, users[0].publicKey),
      })
      .signers([users[0]])
      .rpc();

    const after = Number((await getAccount(conn, userAtas[0])).amount);
    assert.equal(after - before, 100_000_000);

    // повторный возврат отклонён
    let second = false;
    try {
      await program.methods.refund()
        .accounts({
          contributor: users[0].publicKey, pool, vault,
          contributorToken: userAtas[0],
          contribution: contribPda(pool, users[0].publicKey),
        })
        .signers([users[0]]).rpc();
    } catch { second = true; }
    assert.isTrue(second, "повторный возврат должен быть отклонён");
  });
});