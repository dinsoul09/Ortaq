/** Общие детали макета: контейнер экрана, кнопки, поля, карточки. */
import type { ComponentProps, ReactNode } from 'react'
import { ChevronIcon } from './Icons'

export function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex min-h-full max-w-md flex-col px-5 pt-12 pb-6">
      {children}
    </div>
  )
}

/** Фиолетовое свечение сверху — есть на всех внутренних экранах макета. */
export function TopGlow() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56"
      style={{ backgroundImage: 'linear-gradient(rgba(124,58,237,0.12), rgba(0,0,0,0))' }}
    />
  )
}

/** Размытые пятна фона первого экрана. */
export function Ambient() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute h-72 w-72 rounded-full bg-[#7f22fe]/20 blur-[64px]" style={{ left: -96, top: -96 }} />
      <div className="absolute h-56 w-56 rounded-full bg-[#ad46ff]/15 blur-[64px]" style={{ left: 230, top: 281 }} />
      <div className="absolute h-64 w-64 rounded-full bg-[#4f39f6]/10 blur-[64px]" style={{ left: 98, top: 588 }} />
    </div>
  )
}

export function Back({ children = 'Главная', onClick }: { children?: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mb-4 flex items-center gap-1 self-start text-[14px] text-violet-soft/80"
    >
      <ChevronIcon className="h-4 w-4 rotate-180" />
      {children}
    </button>
  )
}

export function Title({ children }: { children: ReactNode }) {
  return <h2 className="text-[24px] font-bold">{children}</h2>
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="mb-2 block text-[12px] tracking-[0.6px] text-white/40 uppercase">
      {children}
    </span>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/[0.06] bg-card p-5 ${className}`}>
      {children}
    </div>
  )
}

const FIELD =
  'w-full rounded-2xl border border-white/[0.08] bg-card px-4 py-3.5 text-[15px] text-white outline-none placeholder:text-white/25 focus:border-violet/60'

export function Field(props: ComponentProps<'input'>) {
  return <input {...props} className={FIELD} />
}

export function Textarea(props: ComponentProps<'textarea'>) {
  return <textarea {...props} className={`${FIELD} min-h-24 resize-none`} />
}

export function PrimaryButton({ children, ...props }: ComponentProps<'button'>) {
  return (
    <button
      {...props}
      className="grad-brand w-full rounded-2xl py-4 text-[16px] font-semibold text-white disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export function GhostButton({ children, ...props }: ComponentProps<'button'>) {
  return (
    <button
      {...props}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] py-3.5 text-[15px] text-white disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export function TextButton({ children, ...props }: ComponentProps<'button'>) {
  return (
    <button {...props} className="w-full py-3 text-[14px] text-white/35">
      {children}
    </button>
  )
}
