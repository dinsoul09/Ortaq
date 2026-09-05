import type { Contribution, Pool } from '../lib/ortaq'
import { formatAmount, formatDate, formatLeft, percent, TOKEN_SYMBOL } from '../lib/format'
import { PoolGlyph } from './Icons'
import { Progress } from './Progress'
import { StatusPill } from './StatusPill'
import { AvatarStack } from './Avatar'

/** Строка списка сборов на главной. */
export function PoolCard({
  pool,
  people,
  onOpen,
}: {
  pool: Pool
  people: Contribution[]
  onOpen: () => void
}) {
  return (
    <button
      onClick={onOpen}
      className="w-full rounded-3xl border border-white/[0.06] bg-card p-4 text-left"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet/15 text-violet-soft">
          <PoolGlyph name={pool.icon} className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold">{pool.title}</p>
          <p className="text-[12px] text-white/35">до {formatDate(pool.deadline)}</p>
        </div>
        <StatusPill status={pool.status} />
      </div>

      <Progress
        collected={pool.collected}
        goal={pool.goal}
        status={pool.status}
        className="mt-3.5"
      />

      <div className="mt-2.5 flex items-center justify-between">
        <p>
          <span className="text-[14px] font-bold text-violet-soft">
            {formatAmount(pool.collected)} {TOKEN_SYMBOL}
          </span>
          <span className="text-[12px] text-white/30"> / {formatAmount(pool.goal)} {TOKEN_SYMBOL}</span>
        </p>
        <AvatarStack names={people.map((p) => p.name)} total={people.length} />
      </div>

      {pool.status === 'open' && (
        <p className="mt-2 text-[12px] text-white/30">
          <span className="font-semibold text-amber">{formatLeft(pool.deadline)}</span>
          {' · собрано '}
          {percent(pool.collected, pool.goal)}%
        </p>
      )}
    </button>
  )
}
