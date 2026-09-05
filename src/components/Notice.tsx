import { ERROR_TEXT, type OrtaqErrorCode } from '../lib/ortaq'

export type NoticeCode = OrtaqErrorCode | 'Unknown'

/** Красная шапка листа — короткая, её читают первой. */
const EYEBROW: Record<NoticeCode, string> = {
  GoalNotReached: 'Сбор закрыт',
  DeadlinePassed: 'Срок вышел',
  DeadlineNotPassed: 'Срок ещё идёт',
  PoolClosed: 'Сбор закрыт',
  AlreadyRefunded: 'Уже возвращено',
  NothingToRefund: 'Нечего возвращать',
  PoolStillOpen: 'Сбор идёт',
  Unknown: 'Не получилось',
}

/** Вторая строка — почему это правило, а не поломка. */
const DETAIL: Record<NoticeCode, string> = {
  GoalNotReached:
    'Это правило нельзя обойти — ни организатору, ни кому-либо другому. Каждый участник получит свой взнос обратно.',
  DeadlinePassed: 'Срок задаётся при создании сбора и после этого не двигается.',
  DeadlineNotPassed: 'Пока идёт срок, взносы лежат в сборе и не принадлежат никому.',
  PoolClosed: 'Деньги уже ушли по правилу сбора — забрать их повторно нельзя.',
  AlreadyRefunded: 'Возврат уже прошёл, деньги у вас.',
  NothingToRefund: 'Возврат получают только те, кто вносил деньги в этот сбор.',
  PoolStillOpen: 'Пока идёт срок, в сборе лежат деньги участников. Удалить его можно только после закрытия.',
  Unknown: 'Сеть не ответила. Состояние сбора не изменилось — попробуйте ещё раз.',
}

const TITLE: Record<NoticeCode, string> = { ...ERROR_TEXT, Unknown: 'Что-то пошло не так.' }

/**
 * Отказ. Тот самый кадр демо: лист снизу, красная шапка, крупная причина.
 * Должен читаться с трёх метров и не исчезать сам.
 */
export function Notice({ code, onClose }: { code: NoticeCode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/[0.78] p-3"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-rose-deep/40 bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-rose-deep/15 px-7 py-5">
          <span className="text-[13px] font-bold tracking-[1.2px] text-rose uppercase">
            {EYEBROW[code]}
          </span>
        </div>
        <div className="p-6">
          <p className="text-[24px] leading-tight font-bold">{TITLE[code]}</p>
          <p className="mt-3 text-[15px] leading-normal text-white/50">{DETAIL[code]}</p>
          <button
            className="grad-brand mt-6 w-full rounded-2xl py-4 text-[16px] font-semibold text-white"
            onClick={onClose}
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  )
}
