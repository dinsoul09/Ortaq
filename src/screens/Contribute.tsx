import { useState } from 'react'
import { NETWORK_FEE, ortaq, OrtaqError, type Pool } from '../lib/ortaq'
import { formatAmount, toUnits } from '../lib/format'
import { PoolGlyph } from '../components/Icons'
import { Notice, type NoticeCode } from '../components/Notice'
import { Back, Card, Label, PrimaryButton, Screen, TextButton, TopGlow } from '../components/ui'

/** Быстрые суммы, в SOL. */
const QUICK = [0.05, 0.1, 0.25, 0.5]

/** Оставляем цифры и одну точку: суммы в SOL дробные. */
const numeric = (v: string) => v.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')

export function Contribute({
  pool,
  me,
  balance,
  onBack,
  onSent,
}: {
  pool: Pool
  me: string
  balance: number | null
  onBack: () => void
  onSent: (amount: number) => void
}) {
  const [value, setValue] = useState('0.1')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<NoticeCode | null>(null)

  const amount = Math.max(0, Number(value) || 0)
  const units = toUnits(amount)
  const total = units + NETWORK_FEE
  const enough = balance === null || total <= balance

  async function send() {
    setBusy(true)
    try {
      await ortaq.contribute(pool.address, units, me)
      onSent(units)
    } catch (e) {
      setNotice(e instanceof OrtaqError ? e.code : 'Unknown')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <TopGlow />
      <Screen>
        <Back onClick={onBack}>Назад</Back>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet/15 text-violet-soft">
            <PoolGlyph name={pool.icon} className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] text-white/40">Сбор</p>
            <p className="truncate text-[16px] font-semibold">{pool.title}</p>
          </div>
        </div>

        <Card className="mt-5">
          <Label>Сумма взноса</Label>
          <div className="flex items-baseline gap-1">
            <input
              autoFocus
              value={value}
              inputMode="numeric"
              onChange={(e) => setValue(numeric(e.target.value))}
              className="w-full min-w-0 bg-transparent text-[34px] font-bold tabular-nums outline-none"
            />
            <span className="pb-1 text-[20px] font-semibold text-violet-soft">SOL</span>
          </div>
          <p className="mt-2 text-[12px] text-white/35">
            Доступно: {balance === null ? '—' : formatAmount(balance)} SOL
          </p>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => setValue(String(q))}
                className={`rounded-xl py-2 text-[12px] font-semibold ${
                  amount === q ? 'bg-violet-deep text-white' : 'bg-white/[0.06] text-white/40'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </Card>

        <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
          <div className="flex items-center justify-between text-[12px] text-white/40">
            <span>Комиссия сети Solana</span>
            <span className="font-mono">~{formatAmount(NETWORK_FEE)} SOL</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[14px] font-semibold">
            <span>Всего списывается</span>
            <span>{formatAmount(total)} SOL</span>
          </div>
        </div>

        <div className="mt-auto pt-8">
          {!enough && (
            <p className="mb-3 text-center text-[13px] text-rose">
              На балансе меньше, чем вы вводите.
            </p>
          )}
          <PrimaryButton disabled={busy || units <= 0 || !enough} onClick={send}>
            {busy ? 'Подтвердите в Phantom…' : 'Подтвердить в Phantom'}
          </PrimaryButton>
          <TextButton onClick={onBack}>Отмена</TextButton>
        </div>

        {notice && <Notice code={notice} onClose={() => setNotice(null)} />}
      </Screen>
    </>
  )
}
