import { formatAgo, formatAmount, TOKEN_SYMBOL } from '../lib/format'
import type { Contribution, Pool } from '../lib/ortaq'
import { CheckIcon, CrossIcon } from '../components/Icons'
import { Back, Screen, Title, TopGlow } from '../components/ui'

/**
 * Уведомления собираются из состояния сборов, а не из отдельной ленты:
 * своего хранилища событий у приложения нет и не планируется.
 */
export function notificationsFor(pools: Pool[], people: Record<string, Contribution[]> = {}) {
  return pools
    .filter((p) => p.status !== 'open')
    .map((p) => ({
      id: p.address,
      ok: p.status === 'released',
      title: p.status === 'released' ? 'Цель собрана! 🎉' : 'Сбор закрылся',
      detail:
        p.status === 'released'
          ? `«${p.title}» успешно завершён. Все деньги переведены получателю.`
          : `«${p.title}» закрыт. ${formatAmount(p.collected)} ${TOKEN_SYMBOL} вернулись на кошельки участников.`,
      // Времени закрытия в модели нет. Для сорванного сбора это срок,
      // для успешного — последний взнос: именно он закрыл цель.
      at:
        p.status === 'released'
          ? Math.max(0, ...(people[p.address] ?? []).map((c) => c.at))
          : p.deadline,
    }))
    .sort((a, b) => b.at - a.at)
}

export function Notifications({
  pools,
  people,
  onBack,
}: {
  pools: Pool[]
  people: Record<string, Contribution[]>
  onBack: () => void
}) {
  const items = notificationsFor(pools, people)

  return (
    <>
      <TopGlow />
      <Screen>
        <Back onClick={onBack} />
        <Title>Уведомления</Title>

        <div className="mt-5 flex flex-col gap-3">
          {items.length === 0 && (
            <p className="py-10 text-center text-[14px] text-white/30">Пока ничего не произошло</p>
          )}
          {items.map((n) => (
            <div
              key={n.id}
              className={`relative rounded-3xl border bg-card p-4 ${
                n.ok ? 'border-white/[0.06]' : 'border-violet/20'
              }`}
            >
              <div className="flex gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border ${
                    n.ok
                      ? 'border-mint-deep/20 bg-mint-deep/15 text-mint'
                      : 'border-rose-deep/20 bg-rose-deep/15 text-rose'
                  }`}
                >
                  {n.ok ? <CheckIcon className="h-4 w-4" /> : <CrossIcon className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold">{n.title}</p>
                  <p className="mt-0.5 text-[12px] leading-normal text-white/45">{n.detail}</p>
                  <p className="mt-2 text-[10px] text-white/25">{formatAgo(n.at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Screen>
    </>
  )
}
