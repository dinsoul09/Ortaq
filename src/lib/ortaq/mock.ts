import {
  OrtaqError,
  type Contribution,
  type CreatePoolParams,
  type OrtaqClient,
  type Pool,
} from './types'

const LATENCY = 450
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const now = () => Math.floor(Date.now() / 1000)

interface Row {
  pool: Pool
  contributions: Contribution[]
}

const db = new Map<string, Row>()

function seed() {
  if (db.size) return
  const address = 'demo'
  db.set(address, {
    pool: {
      address,
      title: 'Подарок Айгерим на день рождения',
      organizer: 'Карим',
      recipient: 'Айгерим',
      goal: 30_000,
      collected: 12_000,
      deadline: now() + 600,
      status: 'open',
    },
    contributions: [
      { contributor: 'k1', name: 'Карим', amount: 7_000, refunded: false },
      { contributor: 'a1', name: 'Алексей', amount: 5_000, refunded: false },
    ],
  })
}
seed()

function read(address: string): Row {
  const row = db.get(address)
  if (!row) throw new OrtaqError('PoolClosed', 'Сбор не найден')
  // статус пересчитывается лениво — так же будет вести себя цепочка
  if (row.pool.status === 'open' && row.pool.deadline <= now() && row.pool.collected < row.pool.goal) {
    row.pool.status = 'refunded'
    row.contributions.forEach((c) => (c.refunded = true))
    row.pool.collected = 0
  }
  return row
}

export const mockClient: OrtaqClient = {
  async createPool(p: CreatePoolParams) {
    await sleep(LATENCY)
    const address = 'pool-' + Math.random().toString(36).slice(2, 8)
    db.set(address, {
      pool: {
        address,
        title: p.title,
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
    if (existing) existing.amount += amount
    else row.contributions.push({ contributor: 'u' + row.contributions.length, name, amount, refunded: false })
    row.pool.collected += amount
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
    row.pool.status = 'refunded'
    row.contributions.forEach((c) => (c.refunded = true))
    row.pool.collected = 0
  },
}
