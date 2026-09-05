export function Progress({ collected, goal }: { collected: number; goal: number }) {
  const pct = goal > 0 ? Math.min(100, Math.round((collected / goal) * 100)) : 0
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-line">
      <div
        className="h-full rounded-full bg-brand transition-all duration-700 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
