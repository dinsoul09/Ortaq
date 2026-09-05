import type { Contribution } from '../lib/ortaq'
import { formatAmount } from '../lib/format'

export function ContributorRow({ c }: { c: Contribution }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-3 last:border-b-0">
      <span className={c.refunded ? 'text-mute line-through' : ''}>{c.name}</span>
      <span className={`tabular-nums ${c.refunded ? 'text-mute line-through' : 'text-white'}`}>
        {formatAmount(c.amount)} ₸
      </span>
    </div>
  )
}
