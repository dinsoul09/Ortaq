/** Токен с двумя знаками после запятой — как тенге. */
export const DECIMALS = 2
const UNIT = 10 ** DECIMALS

export function toUnits(human: number): number {
  return Math.round(human * UNIT)
}

export function formatAmount(units: number): string {
  return (units / UNIT).toLocaleString('ru-RU', { maximumFractionDigits: 0 })
}

export function formatLeft(deadline: number): string {
  const left = deadline - Math.floor(Date.now() / 1000)
  if (left <= 0) return 'срок вышел'
  const d = Math.floor(left / 86400)
  const h = Math.floor((left % 86400) / 3600)
  const m = Math.floor((left % 3600) / 60)
  const s = left % 60
  if (d > 0) return `${d} д ${h} ч`
  if (h > 0) return `${h} ч ${m} мин`
  if (m > 0) return `${m}:${String(s).padStart(2, '0')}`
  return `${s} сек`
}
