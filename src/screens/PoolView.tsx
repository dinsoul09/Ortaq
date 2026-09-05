import { useCallback, useEffect, useState } from 'react'
import { ortaq, OrtaqError, ERROR_TEXT, type Contribution, type Pool } from '../lib/ortaq'
import { formatAmount, toUnits } from '../lib/format'
import { Progress } from '../components/Progress'
import { Countdown } from '../components/Countdown'
import { ContributorRow } from '../components/ContributorRow'
import { Notice } from '../components/Notice'
import type { Identity } from '../lib/wallet'

const POLL_MS = 2000
const STEP = 5000 // взнос по умолчанию, в тенге

/**
 * ГЛАВНЫЙ ЭКРАН. Это и есть выступление.
 *
 * Три кадра, ради которых он существует:
 *  1. взнос с одного телефона виден на двух других за ~2 секунды
 *  2. организатор жмёт «Забрать деньги» до цели -> крупный отказ
 *  3. срок вышел без цели -> деньги вернулись сами
 */
export function PoolView({ address, me }: { address: string; me: Identity }) {
  const [pool, setPool] = useState<Pool | null>(null)
  const [rows, setRows] = useState<Contribution[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([ortaq.getPool(address), ortaq.listContributions(address)])
      setPool(p)
      setRows(c)
    } catch {
      /* сеть моргнула — покажем прошлое состояние, следующий опрос починит */
    }
  }, [address])

  useEffect(() => {
    void load()
    const id = setInterval(load, POLL_MS)
    return () => clearInterval(id)
  }, [load])

  async function run(fn: () => Promise<void>) {
    setBusy(true)
    try {
      await fn()
      await load()
    } catch (e) {
      if (e instanceof OrtaqError) setNotice(ERROR_TEXT[e.code])
      else setNotice('Что-то пошло не так. Попробуйте ещё раз.')
    } finally {
      setBusy(false)
    }
  }

  if (!pool) return <div className="p-6 text-mute">Загрузка…</div>

  const isOrganizer = pool.organizer === me.name || pool.organizer === 'Вы'
  const done = pool.status !== 'open'

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-6 p-5 pb-10">
      <header>
        <p className="text-sm text-mute">Общий сбор</p>
        <h1 className="mt-1 text-2xl leading-tight font-bold">{pool.title}</h1>
      </header>

      <section className="rounded-2xl border border-line bg-card p-5">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <span className="text-3xl font-bold tabular-nums">{formatAmount(pool.collected)}</span>
            <span className="text-mute"> из {formatAmount(pool.goal)} ₸</span>
          </div>
          <span className="text-sm text-mute">
            {pool.status === 'open' ? <Countdown deadline={pool.deadline} /> : null}
          </span>
        </div>

        <Progress collected={pool.collected} goal={pool.goal} />

        {pool.status === 'released' && (
          <p className="mt-4 text-brand">Собрали. Деньги у получателя — {pool.recipient}.</p>
        )}
        {pool.status === 'refunded' && (
          <p className="mt-4 text-alarm">Не собрали в срок. Взносы вернулись участникам.</p>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-card px-5 py-2">
        <p className="border-b border-line py-3 text-sm text-mute">
          Сдали {rows.length} {rows.length === 1 ? 'человек' : 'человека'}
        </p>
        {rows.length === 0 ? (
          <p className="py-4 text-mute">Пока никто не сдал</p>
        ) : (
          rows.map((c) => <ContributorRow key={c.contributor} c={c} />)
        )}
      </section>

      <div className="mt-auto flex flex-col gap-3">
        <button
          disabled={busy || done}
          onClick={() => run(() => ortaq.contribute(address, toUnits(STEP), me.name))}
          className="w-full rounded-xl bg-brand py-4 text-lg font-semibold text-ink disabled:opacity-40"
        >
          Внести {formatAmount(toUnits(STEP))} ₸
        </button>

        {/* Кнопка организатора видна и активна ВСЕГДА.
            Заблокированную кнопку зал не заметит — а отказ заметит. */}
        {isOrganizer && !done && (
          <button
            disabled={busy}
            onClick={() => run(() => ortaq.release(address))}
            className="w-full rounded-xl border border-line py-4 text-lg text-mute disabled:opacity-40"
          >
            Забрать деньги
          </button>
        )}
      </div>

      {notice && <Notice text={notice} onClose={() => setNotice(null)} />}
    </div>
  )
}
