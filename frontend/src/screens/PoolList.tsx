import { useEffect, useState } from 'react'
import type { Contribution, Pool } from '../lib/ortaq'
import { formatAmount, TOKEN_SYMBOL } from '../lib/format'
import { readWallet, shortAddress, type WalletState } from '../lib/wallet'
import { PoolCard } from '../components/PoolCard'
import { initials } from '../components/Avatar'
import { BellIcon, PlusIcon } from '../components/Icons'
import { Screen, TopGlow } from '../components/ui'

type Tab = 'all' | 'open' | 'closed'
const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'open', label: 'Активные' },
  { id: 'closed', label: 'Закрытые' },
]

/** Главный экран: кошелёк, баланс и список сборов. */
export function PoolList({
  address,
  me,
  balance,
  pools,
  people,
  unread,
  onOpen,
  onCreate,
  onNotifications,
  onRename,
}: {
  address: string
  me: string
  balance: number | null
  pools: Pool[]
  people: Record<string, Contribution[]>
  unread: number
  onOpen: (poolAddress: string) => void
  onCreate: () => void
  onNotifications: () => void
  onRename: () => void
}) {
  const [wallet, setWallet] = useState<WalletState | null>(null)
  const [tab, setTab] = useState<Tab>('all')

  useEffect(() => {
    readWallet(address).then(setWallet, () => setWallet(null))
  }, [address])

  const shown = pools.filter((p) =>
    tab === 'all' ? true : tab === 'open' ? p.status === 'open' : p.status !== 'open',
  )

  return (
    <>
      <TopGlow />
      <Screen>
        <header className="flex items-center justify-between">
          <div>
            <p className="text-[12px] tracking-[1.2px] text-white/40 uppercase">Кошелёк</p>
            <p className="font-mono text-[14px] text-violet-soft/80">{shortAddress(address)}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onNotifications}
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.06] text-white/70"
            >
              <BellIcon className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-deep px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>
            {/* Аватар — единственный вход в смену имени: отдельного экрана настроек нет. */}
            <button
              onClick={onRename}
              className="grad-brand flex h-11 w-11 items-center justify-center rounded-2xl text-[14px] font-bold"
            >
              {initials(me)}
            </button>
          </div>
        </header>

        <div
          className="mt-5 rounded-3xl border border-violet/20 p-4"
          style={{
            backgroundImage:
              'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(76,29,149,0.3))',
          }}
        >
          <p className="text-[12px] text-white/40">Ваш баланс</p>
          <p className="mt-1">
            <span className="text-[28px] leading-none font-bold tabular-nums">
              {balance === null ? '—' : formatAmount(balance)}
            </span>
            <span className="ml-1.5 text-[18px] font-bold text-violet-soft">{TOKEN_SYMBOL}</span>
          </p>
          <p className="mt-1.5 text-[12px] text-white/35">
            {wallet ? `сеть ${wallet.cluster}` : 'сеть недоступна'}
          </p>
        </div>

        <div className="mt-5 flex rounded-2xl bg-white/[0.05] p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-xl py-2 text-[12px] font-semibold ${
                tab === t.id ? 'bg-violet-deep text-white' : 'text-white/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 pb-4">
          {shown.length === 0 ? (
            <p className="py-10 text-center text-[14px] text-white/30">Здесь пока пусто</p>
          ) : (
            shown.map((p) => (
              <PoolCard
                key={p.address}
                pool={p}
                people={people[p.address] ?? []}
                onOpen={() => onOpen(p.address)}
              />
            ))
          )}
        </div>

        <div className="sticky bottom-4 mt-auto flex justify-center pt-4">
          <button
            onClick={onCreate}
            className="grad-brand flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-violet/25"
          >
            <PlusIcon className="h-4 w-4" />
            Новый сбор
          </button>
        </div>
      </Screen>
    </>
  )
}
