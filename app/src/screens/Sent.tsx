import type { Pool } from '../lib/ortaq'
import { formatAmount, formatDate, percent } from '../lib/format'
import { CheckIcon } from '../components/Icons'
import { Progress } from '../components/Progress'
import { Card, GhostButton, Screen } from '../components/ui'

/** Взнос ушёл. Экран объясняет главное правило: не соберём — вернётся само. */
export function Sent({ pool, onHome }: { pool: Pool; onHome: () => void }) {
  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-mint-deep/10" />
          <div className="absolute inset-3 rounded-full bg-mint-deep/15" />
          <div className="absolute inset-6 flex items-center justify-center rounded-full border border-mint-deep/40 bg-mint-deep/20 text-mint">
            <CheckIcon className="h-9 w-9" />
          </div>
        </div>

        <h2 className="mt-7 text-[24px] font-bold">Взнос отправлен!</h2>
        <p className="mt-3 text-[14px] leading-normal text-white/45">
          Ваши деньги добавлены в сбор «{pool.title}». Ждём остальных.
        </p>

        <Card className="mt-7 w-full text-left">
          <div className="flex items-center justify-between text-[12px] text-white/40">
            <span>Прогресс</span>
            <span>{percent(pool.collected, pool.goal)}%</span>
          </div>
          <Progress
            collected={pool.collected}
            goal={pool.goal}
            status={pool.status}
            className="mt-2.5"
          />
          <div className="mt-2.5 flex items-baseline justify-between">
            <span className="text-[14px] font-semibold text-violet-soft">
              {formatAmount(pool.collected)} SOL
            </span>
            <span className="text-[12px] text-white/35">/ {formatAmount(pool.goal)} SOL</span>
          </div>
          <p className="mt-2 text-[12px] text-amber">Срок: {formatDate(pool.deadline)}</p>
        </Card>

        <p className="mt-5 text-[12px] leading-normal text-white/25">
          Если до срока сумма не соберётся — деньги вернутся на ваш кошелёк Phantom
          автоматически.
        </p>

        <div className="mt-8 w-full">
          <GhostButton onClick={onHome}>Главная</GhostButton>
        </div>
      </div>
    </Screen>
  )
}
