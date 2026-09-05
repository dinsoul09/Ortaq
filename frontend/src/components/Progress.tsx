import type { PoolStatus } from '../lib/ortaq'

/** Полоса сбора. Цвет несёт состояние: идёт — фиолетовый, собрали — зелёный, сорвалось — красный. */
export function Progress({
  collected,
  goal,
  status,
  className = '',
}: {
  collected: number
  goal: number
  status: PoolStatus
  className?: string
}) {
  const pct = goal > 0 ? Math.min(100, Math.round((collected / goal) * 100)) : 0
  const grad =
    status === 'released' ? 'grad-mint' : status === 'refunded' ? 'grad-rose' : 'grad-violet'
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05] ${className}`}>
      <div
        className={`${grad} h-full rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
