/**
 * Деньги считаются целыми числами в базовых единицах токена — 6 знаков,
 * как договорились с Алексеем. 10.50 в интерфейсе = 10500000 в программе.
 *
 * Float в денежной арифметике не используется нигде: ввод разбирается
 * построчно, вывод собирается из целых. Иначе 0.1 + 0.2 разъедется
 * между экраном и цепочкой.
 */
export const DECIMALS = 6
const UNIT = 10 ** DECIMALS

/**
 * Символ токена сбора. Один на всё приложение: сменить единицу — одна строка
 * здесь или переменная в .env, а не поиск по экранам.
 */
export const TOKEN_SYMBOL = import.meta.env.VITE_TOKEN_SYMBOL || 'SOL'

/**
 * Человеческая сумма -> базовые единицы. Принимает строку из поля ввода
 * и разбирает её посимвольно, без умножения на float.
 */
export function toUnits(value: string | number): number {
  const [whole = '', frac = ''] = String(value).trim().split('.')
  const w = Number(whole.replace(/\D/g, '') || '0')
  const f = Number((frac.replace(/\D/g, '') + '0'.repeat(DECIMALS)).slice(0, DECIMALS) || '0')
  return w * UNIT + f
}

/**
 * Базовые единицы -> человеческая строка: «2», «1.4», «10.5».
 * Собирается из целых, хвостовые нули срезаются.
 */
export function formatAmount(units: number): string {
  const n = Math.abs(Math.round(units))
  const whole = Math.floor(n / UNIT)
  const frac = String(n % UNIT).padStart(DECIMALS, '0').replace(/0+$/, '')
  return (units < 0 ? '-' : '') + whole + (frac ? '.' + frac : '')
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
