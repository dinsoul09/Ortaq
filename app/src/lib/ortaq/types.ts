/**
 * Базовая комиссия Solana — 5000 лампортов. Платится сверх взноса и уходит
 * сети, а не в сбор. Живёт здесь, потому что это факт сети, а не оформление.
 */
export const NETWORK_FEE = 5_000

export type PoolStatus = 'open' | 'released' | 'refunded'

/**
 * Значок сбора. Словарь живёт здесь, а не в компонентах: это часть данных
 * сбора, рисование — дело Icons.tsx.
 */
export type PoolIcon =
  | 'home' | 'gift' | 'mountain' | 'plane' | 'target'
  | 'game' | 'music' | 'food' | 'film' | 'bag'

export interface Pool {
  address: string
  title: string
  /** необязательное пояснение от организатора */
  description: string
  icon: PoolIcon
  organizer: string
  recipient: string
  /** в минимальных единицах токена */
  goal: number
  collected: number
  /** unix seconds */
  deadline: number
  status: PoolStatus
}

export interface Contribution {
  contributor: string
  name: string
  amount: number
  refunded: boolean
  /** unix seconds, время взноса */
  at: number
}

export interface CreatePoolParams {
  title: string
  description: string
  icon: PoolIcon
  goal: number
  durationSec: number
  recipient: string
}

/**
 * Единственная граница между экранами и сетью.
 * Компоненты работают только с этим интерфейсом.
 */
export interface OrtaqClient {
  /** Баланс участника в токене сбора, в минимальных единицах. */
  getBalance(): Promise<number>
  createPool(params: CreatePoolParams): Promise<string>
  /** сборы, доступные этому участнику — для главного экрана со списком */
  listPools(): Promise<Pool[]>
  getPool(address: string): Promise<Pool>
  listContributions(address: string): Promise<Contribution[]>
  contribute(address: string, amount: number, name: string): Promise<void>
  /** бросает OrtaqError с кодом 'GoalNotReached', если цель не достигнута */
  release(address: string): Promise<void>
  refund(address: string): Promise<void>
  /** Убрать закрытый сбор из списка. Открытый удалить нельзя. */
  deletePool(address: string): Promise<void>
}

export type OrtaqErrorCode =
  | 'GoalNotReached'
  | 'DeadlinePassed'
  | 'DeadlineNotPassed'
  | 'PoolClosed'
  | 'AlreadyRefunded'
  | 'NothingToRefund'
  | 'PoolStillOpen'

export class OrtaqError extends Error {
  constructor(public code: OrtaqErrorCode, message: string) {
    super(message)
    this.name = 'OrtaqError'
  }
}

/** Человеческие тексты — их видит зал, поэтому без технического жаргона. */
export const ERROR_TEXT: Record<OrtaqErrorCode, string> = {
  GoalNotReached:
    'Цель не собрана. Деньги может забрать только получатель и только после закрытия сбора.',
  DeadlinePassed: 'Срок сбора истёк, внести деньги уже нельзя.',
  DeadlineNotPassed: 'Срок ещё не вышел — возврат станет доступен после его окончания.',
  PoolClosed: 'Сбор уже закрыт.',
  AlreadyRefunded: 'Взнос уже возвращён.',
  NothingToRefund: 'В этом сборе нет вашего взноса.',
  PoolStillOpen: 'Сбор ещё идёт — удалить его нельзя.',
}
