import type { PoolStatus } from '../lib/ortaq'

/** Ярлык состояния сбора — в списке и в шапке сбора. */
export function StatusPill({ status }: { status: PoolStatus }) {
  if (status === 'released')
    return (
      <span className="rounded-full bg-violet/20 px-2 py-0.5 text-[11px] text-violet-soft">
        ✓ Завершён
      </span>
    )
  if (status === 'refunded')
    return (
      <span className="rounded-full bg-rose-deep/15 px-2 py-0.5 text-[11px] text-rose">
        ✕ Закрыт
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-deep/15 px-2 py-0.5 text-[11px] text-mint">
      <span className="h-1.5 w-1.5 rounded-full bg-mint" />
      Активный
    </span>
  )
}
