/**
 * Раздача тестового токена сбора.
 *
 * Без него демо не поедет: чтобы участник мог внести деньги, у него на
 * устройстве должен лежать SPL-токен и открытый под него ATA. Программа
 * токен-аккаунты не создаёт — это делает клиент или вот этот скрипт.
 *
 *   ANCHOR_WALLET=~/.config/solana/id.json \
 *   ts-node scripts/mint-test-token.ts <адрес> [<адрес> ...]
 *
 * Первый запуск создаёт mint и печатает его — положите в VITE_TOKEN_MINT.
 * Повторные: MINT=<адрес> ts-node scripts/mint-test-token.ts <адрес>
 */
import { readFileSync } from 'fs'
import { homedir } from 'os'
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from '@solana/spl-token'

/** 6 знаков — как договорились с программой. */
const DECIMALS = 6
/** Сколько выдаём каждому: с запасом на несколько взносов. */
const AMOUNT = 100

function loadWallet(): Keypair {
  const path = (process.env.ANCHOR_WALLET ?? '~/.config/solana/id.json').replace('~', homedir())
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(path, 'utf8'))))
}

async function main() {
  const targets = process.argv.slice(2)
  if (targets.length === 0) {
    console.error('Укажите адреса получателей: ts-node scripts/mint-test-token.ts <адрес> ...')
    process.exit(1)
  }

  const rpc = process.env.ANCHOR_PROVIDER_URL ?? clusterApiUrl('devnet')
  const connection = new Connection(rpc, 'confirmed')
  const payer = loadWallet()

  const mint = process.env.MINT
    ? new PublicKey(process.env.MINT)
    : await createMint(connection, payer, payer.publicKey, null, DECIMALS)

  console.log('mint:', mint.toBase58())
  console.log('положите его в VITE_TOKEN_MINT')

  for (const target of targets) {
    const owner = new PublicKey(target)
    const ata = await getOrCreateAssociatedTokenAccount(connection, payer, mint, owner)
    await mintTo(connection, payer, mint, ata.address, payer, AMOUNT * 10 ** DECIMALS)
    console.log(`  ${target} -> ${AMOUNT} токенов, ATA ${ata.address.toBase58()}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
