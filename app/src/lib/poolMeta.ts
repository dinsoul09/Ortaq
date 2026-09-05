import type { PoolIcon } from './ortaq'

/**
 * Название, описание и значок сбора. В программе их нет намеренно: строки
 * на цепочке стоят ренты, а правилу сбора они не нужны.
 *
 * Отсюда следует проблема: на чужом телефоне сбор открылся бы безымянным —
 * в цепочке лежит только адрес. Поэтому меты две штуки:
 *   - локальный кэш по адресу сбора,
 *   - копия в самой ссылке, которой делятся.
 * Открыл ссылку — мета осела в кэше, дальше сбор подписан и без ссылки.
 */
const KEY = 'ortaq.poolMeta'

export interface PoolMeta {
  title: string
  description: string
  icon: PoolIcon
}

type Store = Record<string, PoolMeta>

function read(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Store
  } catch {
    return {}
  }
}

export function getMeta(address: string): PoolMeta | null {
  return read()[address] ?? null
}

export function saveMeta(address: string, meta: PoolMeta): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...read(), [address]: meta }))
  } catch {
    /* приватный режим — мета переживёт только эту сессию */
  }
}

/** Ссылка на сбор с названием внутри, чтобы он не был безымянным у других. */
export function poolLink(address: string, meta?: PoolMeta | null): string {
  const url = new URL(location.origin + location.pathname)
  url.searchParams.set('pool', address)
  if (meta) url.searchParams.set('m', JSON.stringify(meta))
  return url.toString()
}

/** Достаёт мету из адресной строки и кладёт в кэш. Возвращает адрес сбора. */
export function adoptFromUrl(): string | null {
  const params = new URLSearchParams(location.search)
  const address = params.get('pool')
  const raw = params.get('m')
  if (address && raw) {
    try {
      saveMeta(address, JSON.parse(raw) as PoolMeta)
    } catch {
      /* мусор в ссылке — сбор просто останется без названия */
    }
    // Убираем мету из адресной строки: она нужна один раз.
    history.replaceState(null, '', `${location.pathname}?pool=${address}`)
  }
  return address
}
