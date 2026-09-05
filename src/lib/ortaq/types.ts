export type PoolStatus = 'open' | 'released' | 'refunded'

export interface Pool {
  address: string
  title: string
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
}

export interface CreatePoolParams {
  title: string
  goal: number
  durationSec: number
  recipient: string
}

/**
 * Единственная граница между экранами и сетью.
 * Компоненты работают только с этим интерфейсом.
 */
export interface OrtaqClient {
  createPool(params: CreatePoolParams): Promise<string>
  getPool(address: string): Promise<Pool>
  listContributions(address: string): Promise<Contribution[]>
  contribute(address: string, amount: number, name: string): Promise<void>
  /** бросает OrtaqError с кодом 'GoalNotReached', если цель не достигнута */
  release(address: string): Promise<void>
  refund(address: string): Promise<void>
}

export type OrtaqErrorCode =
  | 'GoalNotReached'
  | 'DeadlinePassed'
  | 'DeadlineNotPassed'
  | 'PoolClosed'
  | 'AlreadyRefunded'
  | 'NothingToRefund'

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
}
