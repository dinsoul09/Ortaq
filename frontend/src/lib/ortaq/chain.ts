import type { OrtaqClient } from './types'

/**
 * Реальная реализация поверх Anchor-программы.
 *
 * Подключается, когда Алексей отдаст:
 *   1. target/idl/ortaq.json  -> положить рядом как idl.json
 *   2. Program ID (devnet)    -> VITE_PROGRAM_ID
 *   3. Mint тестового токена  -> VITE_TOKEN_MINT
 *   4. Формулы seeds для PDA Pool и Contribution
 *   5. Коды ошибок -> смапить на OrtaqErrorCode в types.ts
 *
 * Перед этим доставить:
 *   npm i @coral-xyz/anchor @solana/web3.js @solana/spl-token
 *   npm i -D vite-plugin-node-polyfills   (иначе "Buffer is not defined")
 *
 * Важно: наружу отдаём те же типы, что и mock. Экраны меняться не должны.
 */
const notReady = (): never => {
  throw new Error('chain.ts ещё не подключён — работаем на моке (VITE_USE_MOCK=true)')
}

export const chainClient: OrtaqClient = {
  getBalance: notReady,
  createPool: notReady,
  listPools: notReady,
  getPool: notReady,
  listContributions: notReady,
  contribute: notReady,
  release: notReady,
  refund: notReady,
}
