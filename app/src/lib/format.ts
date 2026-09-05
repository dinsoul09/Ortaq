/** Всё считается в SOL. Минимальная единица — лампорт, 9 знаков. */
export const DECIMALS = 9
const UNIT = 10 ** DECIMALS

/** SOL -> лампорты. Все суммы внутри приложения хранятся в лампортах. */
export function toUnits(sol: number): number {
  return Math.round(sol * UNIT)
}

/**
 * Лампорты -> человеческий SOL: «2», «1.4», «0.000005».
 * Точка, а не запятая — так пишут суммы в SOL везде.
 * Девять знаков, потому что комиссия сети — 0.000005 SOL: округление
 * до четырёх превращало её в ноль. Хвостовые нули срезает Number().
 */
export function formatAmount(units: number): string {
  return String(Number((units / UNIT).toFixed(DECIMALS)))
}

const now = () => Math.floor(Date.now() / 1000)

/** Русские окончания: 1 день, 2 дня, 5 дней. */
function plural(n: number, one: string, few: string, many: string): string {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return many
  const mod10 = n % 10
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сент', 'окт', 'ноя', 'дек']

/** «14 сент 2026» */
export function formatDate(unix: number): string {
  const d = new Date(unix * 1000)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** Сколько осталось до срока: «Ещё 9 дней», «Ещё 4:31», «срок вышел». */
export function formatLeft(deadline: number): string {
  const left = deadline - now()
  if (left <= 0) return 'срок вышел'
  // Дни округляем вверх: пока идёт девятый день, читается «ещё 9 дней», а не 8.
  const d = Math.ceil(left / 86400)
  const h = Math.floor(left / 3600)
  const m = Math.floor((left % 3600) / 60)
  const s = left % 60
  if (left >= 86400) return `Ещё ${d} ${plural(d, 'день', 'дня', 'дней')}`
  if (h > 0) return `Ещё ${h} ${plural(h, 'час', 'часа', 'часов')}`
  return `Ещё ${m}:${String(s).padStart(2, '0')}`
}

/** Когда был взнос: «2 часа назад», «вчера», «3 дня назад». */
export function formatAgo(unix: number): string {
  const ago = Math.max(0, now() - unix)
  const m = Math.floor(ago / 60)
  if (m < 1) return 'только что'
  if (m < 60) return `${m} ${plural(m, 'минуту', 'минуты', 'минут')} назад`
  const h = Math.floor(ago / 3600)
  if (h < 24) return `${h} ${plural(h, 'час', 'часа', 'часов')} назад`
  const d = Math.floor(ago / 86400)
  if (d === 1) return 'вчера'
  if (d < 7) return `${d} ${plural(d, 'день', 'дня', 'дней')} назад`
  const w = Math.floor(d / 7)
  if (w < 5) return `${w} ${plural(w, 'неделю', 'недели', 'недель')} назад`
  const mo = Math.floor(d / 30)
  return `${mo} ${plural(mo, 'месяц', 'месяца', 'месяцев')} назад`
}

export function percent(collected: number, goal: number): number {
  return goal > 0 ? Math.min(100, Math.round((collected / goal) * 100)) : 0
}
