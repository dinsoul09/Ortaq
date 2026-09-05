/** Иконки из макета. Все линейные, stroke 1.8, viewBox 24 — кроме логотипа. */
import type { ReactNode } from 'react'
import type { PoolIcon } from '../lib/ortaq'

function Line({ children, className = 'h-5 w-5' }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  )
}

/** Логотип: три пересекающихся круга — друзья в общем сборе. */
export function Logo({ size = 88 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" aria-hidden>
      <rect width="72" height="72" rx="20" fill="url(#ortaqLogo)" />
      <circle cx="27" cy="36" r="13" fill="white" fillOpacity="0.18" />
      <circle cx="45" cy="36" r="13" fill="white" fillOpacity="0.18" />
      <circle cx="36" cy="24" r="13" fill="white" fillOpacity="0.22" />
      <circle cx="36" cy="32" r="7" fill="white" fillOpacity="0.35" />
      <circle cx="36" cy="32" r="3" fill="white" fillOpacity="0.8" />
      <defs>
        <linearGradient id="ortaqLogo" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" />
          <stop offset="1" stopColor="#4c1d95" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ------------------------------------------------- значки категорий сбора */

export const POOL_ICONS: Record<PoolIcon, ReactNode> = {
  home: (
    <>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13M3 12v7a1 1 0 001 1h16a1 1 0 001-1v-7" />
      <path d="M8 8a2 2 0 01-2-2c0-2 2-4 6-4s6 2 6 4a2 2 0 01-2 2" />
    </>
  ),
  mountain: (
    <>
      <path d="M3 20l6-10 3 5 3-3 6 8H3z" />
      <path d="M14 6l2 2" />
    </>
  ),
  plane: <path d="M21 3L3 10.5l7 3L13 21l3-7 5-11z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </>
  ),
  game: (
    <>
      <rect x="2" y="7" width="20" height="11" rx="3" />
      <path d="M7 11v4M9 13H5M17 12h.01M15 14h.01" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  food: <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />,
  film: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M8 4v16M16 4v16M2 9h4M2 15h4M18 9h4M18 15h4" />
    </>
  ),
  bag: (
    <>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <path d="M3 6h18M16 10a4 4 0 01-8 0" />
    </>
  ),
}

export const POOL_ICON_KEYS = Object.keys(POOL_ICONS) as PoolIcon[]

export function PoolGlyph({ name, className }: { name: PoolIcon; className?: string }) {
  return <Line className={className}>{POOL_ICONS[name] ?? POOL_ICONS.target}</Line>
}

/* --------------------------------------------------------- иконки интерфейса */

export const WalletIcon = (p: { className?: string }) => (
  <Line {...p}>
    <rect x="2" y="6" width="20" height="14" rx="2" />
    <path d="M2 10h20M17 15h.01" />
  </Line>
)

export const UsersIcon = (p: { className?: string }) => (
  <Line {...p}>
    <circle cx="8" cy="8" r="3" />
    <circle cx="16" cy="8" r="3" />
    <path d="M2 20c0-3.3 2.7-6 6-6M22 20c0-3.3-2.7-6-6-6" />
  </Line>
)

export const ClockIcon = (p: { className?: string }) => (
  <Line {...p}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l3 3M9 2h6" />
  </Line>
)

export const ShieldIcon = (p: { className?: string }) => (
  <Line {...p}>
    <path d="M12 2L4 5.5V12c0 5 3.5 8.8 8 10 4.5-1.2 8-5 8-10V5.5L12 2z" />
    <path d="M8.5 12l2.5 2.5L15.5 10" />
  </Line>
)

export const BellIcon = (p: { className?: string }) => (
  <Line {...p}>
    <path d="M18 9a6 6 0 10-12 0c0 6-2 7-2 7h16s-2-1-2-7z" />
    <path d="M13.7 20a2 2 0 01-3.4 0" />
  </Line>
)

export const CopyIcon = (p: { className?: string }) => (
  <Line {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1" />
  </Line>
)

export const ChevronIcon = (p: { className?: string }) => (
  <Line {...p}>
    <path d="M9 5l7 7-7 7" />
  </Line>
)

export const PlusIcon = (p: { className?: string }) => (
  <Line {...p}>
    <path d="M12 5v14M5 12h14" />
  </Line>
)

export const CheckIcon = (p: { className?: string }) => (
  <Line {...p}>
    <path d="M4 12.5l5.5 5.5L20 7" />
  </Line>
)

export const CrossIcon = (p: { className?: string }) => (
  <Line {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Line>
)
