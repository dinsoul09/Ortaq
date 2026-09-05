/** Инициалы участника. Цвет по имени — один человек выглядит одинаково везде. */
const PALETTE = ['#8b5cf6', '#7c3aed', '#a78bfa', '#5b21b6', '#6d28d9']

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

export function tint(name: string): string {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)!) >>> 0
  return PALETTE[h % PALETTE.length]
}

export function Avatar({
  name,
  size = 36,
  dimmed = false,
}: {
  name: string
  size?: number
  dimmed?: boolean
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${dimmed ? 'opacity-40' : ''}`}
      style={{ background: tint(name), width: size, height: size, fontSize: size * 0.33 }}
    >
      {initials(name)}
    </div>
  )
}

/** Стопка аватаров в карточке списка — перекрываются, с обводкой под цвет карточки. */
export function AvatarStack({ names, total }: { names: string[]; total: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {names.slice(0, 3).map((n) => (
          <div
            key={n}
            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-card text-[9px] font-bold text-white"
            style={{ background: tint(n) }}
          >
            {initials(n)}
          </div>
        ))}
      </div>
      <span className="text-[12px] text-white/35">{total}</span>
    </div>
  )
}
