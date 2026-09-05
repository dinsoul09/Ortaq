import {
  NETWORK_FEE,
  OrtaqError,
  type Contribution,
  type CreatePoolParams,
  type OrtaqClient,
  type Pool,
} from './types'

const LATENCY = 450
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const now = () => Math.floor(Date.now() / 1000)
const days = (n: number) => n * 86_400
const hours = (n: number) => n * 3_600
const sol = (n: number) => Math.round(n * 1e9) // SOL -> лампорты

interface Row {
  pool: Pool
  contributions: Contribution[]
}

const db = new Map<string, Row>()

/**
 * Баланс демо-кошелька в лампортах. Живёт рядом со сборами намеренно:
 * взнос обязан уменьшать его в тот же момент, иначе на экране два
 * несвязанных мира. В цепочке это будет настоящий баланс SOL.
 */
let balance = sol(4)

/** Сколько этот кошелёк внёс в каждый сбор — столько и вернётся, если сбор сорвётся. */
const spent = new Map<string, number>()

/** Данные из макета: четыре сбора во всех трёх состояниях. */
function seed() {
  if (db.size) return
  const t = now()

  add(
    {
      address: 'dacha',
      title: 'Аренда дачи на выходных',
      description: 'Снимаем дачу на 3 дня. Нужно покрыть аренду и продукты.',
      icon: 'home',
      organizer: 'Вы',
      recipient: 'Айгерим',
      goal: sol(2),
      collected: sol(1.4),
      deadline: t + days(9),
      status: 'open',
    },
    [
      ['Алина К.', 0.35, t - hours(2)],
      ['Дима Р.', 0.5, t - hours(5)],
      ['Саша М.', 0.2, t - days(1)],
      ['Катя В.', 0.35, t - days(1)],
    ],
  )

  add(
    {
      address: 'podarok',
      title: 'Подарок Максу на ДР',
      description: 'Собираем на крутой подарок Максу. Всем скинуться по чуть-чуть.',
      icon: 'gift',
      organizer: 'Ира Л.',
      recipient: 'Макс',
      goal: sol(1),
      collected: sol(1),
      deadline: t + days(3),
      status: 'released',
    },
    [
      ['Ира Л.', 0.2, t - days(2)],
      ['Паша Н.', 0.35, t - days(3)],
      ['Юля С.', 0.2, t - days(3)],
      ['Антон П.', 0.25, t - days(4)],
    ],
  )

  add(
    {
      address: 'gory',
      title: 'Поход в горы',
      description: 'Снаряжение и трансфер до старта маршрута.',
      icon: 'mountain',
      organizer: 'Саша М.',
      recipient: 'Саша М.',
      goal: sol(5),
      collected: sol(1),
      deadline: t + days(26),
      status: 'open',
    },
    [
      ['Саша М.', 0.7, t - days(2)],
      ['Нурлан Т.', 0.3, t - days(3)],
    ],
  )

  add(
    {
      address: 'dubai',
      title: 'Поездка в Дубай',
      description: 'Хотели слетать на выходные, но не успели собрать.',
      icon: 'plane',
      organizer: 'Рома Б.',
      recipient: 'Рома Б.',
      goal: sol(12),
      collected: sol(1.8),
      deadline: t - days(16),
      status: 'refunded',
    },
    [
      ['Рома Б.', 0.9, t - days(30)],
      ['Лена Ф.', 0.9, t - days(30)],
    ],
    true,
  )
}

function add(pool: Pool, people: [string, number, number][], refunded = false) {
  db.set(pool.address, {
    pool,
    contributions: people.map(([name, amount, at], i) => ({
      contributor: pool.address + '-' + i,
      name,
      amount: sol(amount),
      refunded,
      at,
    })),
  })
}
seed()

function read(address: string): Row {
  const row = db.get(address)
  if (!row) throw new OrtaqError('PoolClosed', 'Сбор не найден')
  // статус пересчитывается лениво — так же будет вести себя цепочка
  if (row.pool.status === 'open' && row.pool.deadline <= now() && row.pool.collected < row.pool.goal)
    close(row)
  return row
}

/**
 * Возврат. collected НЕ обнуляется: это исторический итог сбора, по нему
 * видно, сколько собрали и сколько не хватило. Факт возврата живёт
 * в самих взносах — поле refunded.
 */
function close(row: Row) {
  row.pool.status = 'refunded'
  row.contributions.forEach((c) => (c.refunded = true))
  // Возврат без организатора: деньги этого кошелька возвращаются на баланс сами.
  balance += spent.get(row.pool.address) ?? 0
  spent.delete(row.pool.address)
}

export const mockClient: OrtaqClient = {
  async getBalance() {
    await sleep(80)
    return balance
  },

  async createPool(p: CreatePoolParams) {
    await sleep(LATENCY)
    const address = 'pool-' + Math.random().toString(36).slice(2, 8)
    db.set(address, {
      pool: {
        address,
        title: p.title,
        description: p.description,
        icon: p.icon,
        organizer: 'Вы',
        recipient: p.recipient,
        goal: p.goal,
        collected: 0,
        deadline: now() + p.durationSec,
        status: 'open',
      },
      contributions: [],
    })
    return address
  },

  async listPools() {
    await sleep(120)
    return [...db.keys()].map((a) => ({ ...read(a).pool }))
  },

  async getPool(address) {
    await sleep(120)
    return { ...read(address).pool }
  },

  async listContributions(address) {
    await sleep(120)
    return read(address).contributions.map((c) => ({ ...c }))
  },

  async contribute(address, amount, name) {
    await sleep(LATENCY)
    const row = read(address)
    if (row.pool.status !== 'open') throw new OrtaqError('PoolClosed', 'Сбор уже закрыт')
    if (row.pool.deadline <= now()) throw new OrtaqError('DeadlinePassed', 'Срок истёк')
    const existing = row.contributions.find((c) => c.name === name)
    if (existing) {
      existing.amount += amount
      existing.at = now()
    } else {
      row.contributions.push({
        contributor: 'u' + row.contributions.length,
        name,
        amount,
        refunded: false,
        at: now(),
      })
    }
    row.pool.collected += amount
    // Комиссия уходит сети и не возвращается при срыве сбора — поэтому
    // с баланса списывается вместе со взносом, а в spent не попадает.
    balance -= amount + NETWORK_FEE
    spent.set(address, (spent.get(address) ?? 0) + amount)
  },

  async release(address) {
    await sleep(LATENCY)
    const row = read(address)
    if (row.pool.status !== 'open') throw new OrtaqError('PoolClosed', 'Сбор уже закрыт')
    // Это тот самый отказ, который показывается со сцены.
    if (row.pool.collected < row.pool.goal)
      throw new OrtaqError('GoalNotReached', 'Цель не собрана')
    row.pool.status = 'released'
  },

  async refund(address) {
    await sleep(LATENCY)
    const row = read(address)
    if (row.pool.deadline > now()) throw new OrtaqError('DeadlineNotPassed', 'Срок ещё не вышел')
    if (row.pool.status === 'released') throw new OrtaqError('PoolClosed', 'Деньги уже у получателя')
    close(row)
  },

  async deletePool(address) {
    await sleep(LATENCY)
    const row = read(address)
    // Пока сбор идёт, в нём лежат чужие деньги — удалять нечего и нельзя.
    if (row.pool.status === 'open') throw new OrtaqError('PoolStillOpen', 'Сбор ещё идёт')
    db.delete(address)
    spent.delete(address)
  },
}
