import { useEffect, useState } from 'react'
import {
  connectPhantom,
  getPhantom,
  PHANTOM_INSTALL_URL,
  reconnectPhantom,
  WalletError,
  WALLET_ERROR_TEXT,
} from '../lib/wallet'
import { Ambient, PrimaryButton, Screen } from '../components/ui'
import { ClockIcon, Logo, ShieldIcon, UsersIcon, WalletIcon } from '../components/Icons'

const FEATURES = [
  { icon: WalletIcon, label: 'Кошелёк Phantom' },
  { icon: UsersIcon, label: 'Делись с друзьями' },
  { icon: ClockIcon, label: 'Срок сбора' },
  { icon: ShieldIcon, label: 'Автовозврат' },
]

/**
 * Вход. Кошелёк — единственный способ войти: имени в макете нет,
 * личностью служит адрес Phantom.
 */
export function Connect({ onConnected }: { onConnected: (address: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const installed = getPhantom() !== null

  // Тихое восстановление: окно кошелька не всплывает.
  useEffect(() => {
    void reconnectPhantom().then((a) => a && onConnected(a))
  }, [onConnected])

  async function connect() {
    setBusy(true)
    setError(null)
    try {
      onConnected(await connectPhantom())
    } catch (e) {
      setError(e instanceof WalletError ? WALLET_ERROR_TEXT[e.code] : 'Не получилось подключить.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Ambient />
      <Screen>
        <div className="flex flex-col items-center pt-10">
          <Logo />
          <h1 className="mt-5 text-[48px] leading-none font-extrabold tracking-[-1.44px]">Ortaq</h1>
          <p className="mt-3 text-[14px] font-medium tracking-[1.4px] text-white/40 uppercase">
            Собирай вместе с друзьями
          </p>
          <p className="mt-2 text-center text-[13px] text-white/30">
            Общая касса на блокчейне Solana
          </p>
        </div>

        <div className="my-7 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/[0.08]" />
          <span className="text-[12px] tracking-[1.2px] text-white/20 uppercase">Возможности</span>
          <div className="h-px flex-1 bg-white/[0.08]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-3.5"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-violet/20 text-violet-soft">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[12px] font-medium text-white/55">{label}</span>
            </div>
          ))}
        </div>

        {error && <p className="mt-5 text-center text-[13px] text-rose">{error}</p>}

        <div className="mt-auto pt-10">
          {installed ? (
            <button
              disabled={busy}
              onClick={connect}
              className="grad-brand-deep flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-[16px] font-semibold text-white disabled:opacity-50"
            >
              <WalletIcon className="h-5 w-5" />
              {busy ? 'Подключаем…' : 'Подключить Phantom'}
            </button>
          ) : (
            <a href={PHANTOM_INSTALL_URL} target="_blank" rel="noreferrer" className="block">
              <PrimaryButton>Установить Phantom</PrimaryButton>
            </a>
          )}
          <p className="mt-3 text-center text-[11px] text-white/20">
            {installed
              ? 'Ключи всегда у вас · сеть Solana'
              : 'Phantom не найден в этом браузере'}
          </p>
        </div>
      </Screen>
    </>
  )
}
