import { useCallback, useEffect, useState } from 'react'
import { ortaq, OrtaqError, type Contribution, type Pool } from '../lib/ortaq'
import { formatAmount, formatAgo, formatDate, formatLeft, percent, TOKEN_SYMBOL } from '../lib/format'
import { Avatar } from '../components/Avatar'
import { PoolGlyph, CheckIcon, CopyIcon, CrossIcon } from '../components/Icons'
import { Progress } from '../components/Progress'
import { StatusPill } from '../components/StatusPill'
import { Notice, type NoticeCode } from '../components/Notice'
import { Back, Card, GhostButton, PrimaryButton, Screen, TopGlow } from '../components/ui'

const POLL_MS = 2000

/**
 * ГЛАВНЫЙ ЭКРАН СБОРА. Это и есть выступление.
 *
 * Три кадра, ради которых он существует:
 *  1. взнос с одного телефона виден на двух других за ~2 секунды
 *  2. организатор жмёт «Забрать деньги» до цели -> крупный отказ
 *  3. срок вышел без цели -> деньги вернулись сами
 */
export function PoolView({
  address,
  me,
  onBack,
  onContribute,
}: {
  address: string
  me: string
  onBack: () => void
  onContribute: () => void
}) {
  const [pool, setPool] = useState<Pool | null>(null)
  const [rows, setRows] = useState<Contribution[]>([])
  const [notice, setNotice] = useState<NoticeCode | null>(null)
  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([ortaq.getPool(address), ortaq.listContributions(address)])
      setPool(p)
      setRows(c)
    } catch {
      /* сеть моргнула — покажем прошлое состояние, следующий опрос починит */
    }
  }, [address])

  useEffect(() => {
    void load()
    const id = setInterval(load, POLL_MS)
    return () => clearInterval(id)
  }, [load])

  async function release() {
    setBusy(true)
    try {
      await ortaq.release(address)
      await load()
    } catch (e) {
      setNotice(e instanceof OrtaqError ? e.code : 'Unknown')
    } finally {
      setBusy(false)
    }
  }

  /** Удаление в два касания: на сцене промах по кнопке стоит дорого. */
  async function remove() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 4000)
      return
    }
    setBusy(true)
    try {
      await ortaq.deletePool(address)
      onBack()
    } catch (e) {
      setNotice(e instanceof OrtaqError ? e.code : 'Unknown')
      setConfirmDelete(false)
    } finally {
      setBusy(false)
    }
  }

  async function copyLink() {
    const link = `${location.origin}${location.pathname}?pool=${address}`
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* буфер недоступен — ссылка всё равно в адресной строке */
    }
  }

  if (!pool)
    return (
      <Screen>
        <Back onClick={onBack} />
        <p className="text-white/40">Загрузка…</p>
      </Screen>
    )

  const open = pool.status === 'open'
  const left = Math.max(0, pool.goal - pool.collected)

  return (
    <>
      <TopGlow />
      <Screen>
        <Back onClick={onBack} />

        <div className="flex items-start gap-3.5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-violet/15 text-violet-soft">
            <PoolGlyph name={pool.icon} className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="text-[20px] leading-tight font-bold">{pool.title}</h2>
            <div className="mt-1.5">
              <StatusPill status={pool.status} />
            </div>
          </div>
        </div>

        {pool.description && (
          <p className="mt-4 text-[14px] leading-normal text-white/50">{pool.description}</p>
        )}

        <Card className="mt-5">
          <div className="flex items-start justify-between">
            <div>
              <p>
                <span className="text-[30px] leading-none font-extrabold tabular-nums">
                  {formatAmount(pool.collected)}
                </span>
                <span className="ml-1.5 text-[18px] font-bold text-violet-soft">{TOKEN_SYMBOL}</span>
              </p>
              <p className="mt-1.5 text-[12px] text-white/35">/ {formatAmount(pool.goal)} {TOKEN_SYMBOL}</p>
            </div>
            <div className="text-right">
              <p className="text-[24px] leading-none font-bold text-violet-soft">
                {percent(pool.collected, pool.goal)}%
              </p>
              <p className="mt-1.5 text-[12px] text-white/35">собрано</p>
            </div>
          </div>

          <Progress
            collected={pool.collected}
            goal={pool.goal}
            status={pool.status}
            className="mt-4"
          />

          <div className="mt-3 flex items-center justify-between text-[12px]">
            <span className="text-white/40">Срок: {formatDate(pool.deadline)}</span>
            {open && <span className="font-semibold text-amber">{formatLeft(pool.deadline)}</span>}
          </div>

          {open && left > 0 && (
            <div className="mt-4 rounded-2xl border border-violet/20 bg-violet/10 p-3 text-center">
              <span className="text-[12px] text-white/50">Не хватает: </span>
              <span className="text-[12px] font-semibold text-violet-soft">
                {formatAmount(left)} {TOKEN_SYMBOL}
              </span>
            </div>
          )}
        </Card>

        {pool.status === 'released' && (
          <Banner
            ok
            title="Сбор успешно завершён!"
            detail={`Все деньги переведены получателю — ${pool.recipient}.`}
          />
        )}
        {pool.status === 'refunded' && (
          <Banner
            ok={false}
            title="Сбор не состоялся"
            detail={`${formatAmount(pool.collected)} ${TOKEN_SYMBOL} вернулись на кошельки участников.`}
          />
        )}

        <Card className="mt-3">
          <p className="text-[12px] tracking-[0.6px] text-white/40">
            Участники · {rows.length}
          </p>
          <div className="mt-4 flex flex-col gap-3.5">
            {rows.length === 0 && <p className="text-[14px] text-white/30">Пока никто не сдал</p>}
            {rows.map((c) => (
              <div key={c.contributor} className="flex items-center gap-3">
                <Avatar name={c.name} dimmed={c.refunded} />
                <div className="min-w-0 flex-1">
                  <p className={`text-[14px] font-medium ${c.refunded ? 'text-white/40 line-through' : ''}`}>
                    {c.name}
                  </p>
                  <p className="text-[12px] text-white/35">{formatAgo(c.at)}</p>
                </div>
                <p className={`text-[14px] font-semibold ${c.refunded ? 'text-white/30 line-through' : 'text-violet-soft'}`}>
                  +{formatAmount(c.amount)} {TOKEN_SYMBOL}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-5 flex flex-col gap-2.5">
          {open && <PrimaryButton onClick={onContribute}>Внести деньги</PrimaryButton>}

          <GhostButton onClick={copyLink}>
            <CopyIcon className="h-4 w-4" />
            {copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}
          </GhostButton>

          {/* Видна ВСЕГДА и всегда активна — это главный кадр демо: жмёшь до
              достижения цели и получаешь крупный отказ. Ни прятать, ни
              блокировать нельзя, заблокированную кнопку зал не заметит. */}
          <GhostButton disabled={busy} onClick={release}>
            Забрать деньги
          </GhostButton>

          {/* Закрытый сбор уже ничего не держит — его можно убрать из списка. */}
          {!open && (
            <button
              disabled={busy}
              onClick={remove}
              className={`w-full rounded-2xl border py-3.5 text-[15px] disabled:opacity-40 ${
                confirmDelete
                  ? 'border-rose-deep/50 bg-rose-deep/15 font-semibold text-rose'
                  : 'border-white/10 bg-white/[0.06] text-rose/70'
              }`}
            >
              {confirmDelete ? 'Точно удалить? Нажмите ещё раз' : 'Удалить сбор'}
            </button>
          )}
        </div>

        {notice && <Notice code={notice} onClose={() => setNotice(null)} />}
      </Screen>
    </>
  )
}

function Banner({ ok, title, detail }: { ok: boolean; title: string; detail: string }) {
  return (
    <div
      className={`mt-3 flex items-start gap-3 rounded-2xl border p-4 ${
        ok ? 'border-mint-deep/25 bg-mint-deep/10' : 'border-rose-deep/25 bg-rose-deep/10'
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          ok ? 'bg-mint-deep/20 text-mint' : 'bg-rose-deep/20 text-rose'
        }`}
      >
        {ok ? <CheckIcon className="h-4 w-4" /> : <CrossIcon className="h-4 w-4" />}
      </div>
      <div>
        <p className={`text-[14px] font-semibold ${ok ? 'text-mint' : 'text-rose'}`}>{title}</p>
        <p className="mt-0.5 text-[12px] text-white/45">{detail}</p>
      </div>
    </div>
  )
}
