/**
 * Личность участника.
 *
 * Два режима, оба живут за этим файлом — экраны про Phantom не знают:
 *   - локальная личность: только имя, ключа нет. Годится для мока и для
 *     тех, у кого кошелька нет.
 *   - Phantom: адрес приходит из расширения, приватный ключ нам недоступен.
 *
 * Когда подключится chain.ts, подпись транзакций возьмёт провайдера через
 * getPhantom() — других мест, где приложение знает про кошелёк, быть не должно.
 */
const KEY = 'ortaq.identity'

export interface Identity {
  /** адрес Phantom, либо локальный uuid, если кошелька нет */
  id: string
  name: string
  /** есть только когда подключён кошелёк */
  address?: string
}

export function getIdentity(): Identity | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Identity) : null
  } catch {
    return null
  }
}

function save(identity: Identity): Identity {
  try {
    localStorage.setItem(KEY, JSON.stringify(identity))
  } catch {
    /* приватный режим — переживём, личность будет жить до перезагрузки */
  }
  return identity
}

/** Личность без кошелька: «Продолжить» на первом экране. */
export function setIdentity(name: string): Identity {
  return save({ id: crypto.randomUUID(), name: name.trim() })
}

/** Личность с кошельком: адрес становится идентификатором. */
export function setWalletIdentity(name: string, address: string): Identity {
  return save({ id: address, name: name.trim(), address })
}

export function shortAddress(address: string): string {
  return address.slice(0, 4) + '…' + address.slice(-4)
}

/* ------------------------------------------------------------------ Phantom */

export const PHANTOM_INSTALL_URL = 'https://phantom.app/download'

export type WalletErrorCode = 'NotInstalled' | 'Rejected' | 'Failed'

export class WalletError extends Error {
  constructor(public code: WalletErrorCode, message: string) {
    super(message)
    this.name = 'WalletError'
  }
}

/** Тексты видит зал — без слова «провайдер». */
export const WALLET_ERROR_TEXT: Record<WalletErrorCode, string> = {
  NotInstalled: 'Phantom не найден в этом браузере.',
  Rejected: 'Подключение отклонено в кошельке.',
  Failed: 'Кошелёк не ответил. Попробуйте ещё раз.',
}

interface PhantomProvider {
  isPhantom?: boolean
  publicKey: { toString(): string } | null
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string } }>
  disconnect(): Promise<void>
  on(event: string, handler: (arg: unknown) => void): void
}

declare global {
  interface Window {
    phantom?: { solana?: PhantomProvider }
    solana?: PhantomProvider
  }
}

export function getPhantom(): PhantomProvider | null {
  const p = window.phantom?.solana ?? window.solana
  return p?.isPhantom ? p : null
}

function fail(e: unknown): never {
  // Phantom отдаёт 4001, когда пользователь нажал «Отклонить».
  const code = (e as { code?: number } | null)?.code
  throw new WalletError(code === 4001 ? 'Rejected' : 'Failed', String(e))
}

export async function connectPhantom(): Promise<string> {
  const provider = getPhantom()
  if (!provider) throw new WalletError('NotInstalled', 'Phantom не установлен')
  try {
    const { publicKey } = await provider.connect()
    return publicKey.toString()
  } catch (e) {
    fail(e)
  }
}

/** Тихое восстановление на перезагрузке: окно кошелька не всплывает. */
export async function reconnectPhantom(): Promise<string | null> {
  const provider = getPhantom()
  if (!provider) return null
  try {
    const { publicKey } = await provider.connect({ onlyIfTrusted: true })
    return publicKey.toString()
  } catch {
    return null
  }
}

export async function disconnectPhantom(): Promise<void> {
  try {
    await getPhantom()?.disconnect()
  } catch {
    /* уже отключён — не о чем сообщать */
  }
}

/* ---------------------------------------------------------------------- RPC */

const RPC = import.meta.env.VITE_RPC_URL || 'https://api.devnet.solana.com'

/** Хэш генезиса девнета. По нему видно, что .env.local не уехал на мейннет. */
const DEVNET_GENESIS = 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG'
const MAINNET_GENESIS = '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d'

export type Cluster = 'devnet' | 'mainnet' | 'unknown'

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  const json = (await res.json()) as { result?: T; error?: { message: string } }
  if (json.error) throw new Error(json.error.message)
  return json.result as T
}

export interface WalletState {
  sol: number
  cluster: Cluster
}

/**
 * Баланс и сеть одним заходом. Нужно, чтобы на демо было видно:
 * кошелёк подключён и это действительно devnet, а не мейннет по ошибке.
 */
export async function readWallet(address: string): Promise<WalletState> {
  const [balance, genesis] = await Promise.all([
    rpc<{ value: number }>('getBalance', [address]),
    rpc<string>('getGenesisHash', []),
  ])
  const cluster: Cluster =
    genesis === DEVNET_GENESIS ? 'devnet' : genesis === MAINNET_GENESIS ? 'mainnet' : 'unknown'
  return { sol: balance.value / 1e9, cluster }
}
