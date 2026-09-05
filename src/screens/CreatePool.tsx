import { useState } from 'react'
import { ortaq, usingMock, type PoolIcon } from '../lib/ortaq'
import { toUnits } from '../lib/format'
import { POOL_ICON_KEYS, PoolGlyph, CopyIcon } from '../components/Icons'
import {
  Back,
  Field,
  Label,
  PrimaryButton,
  Screen,
  Textarea,
  TextButton,
  Title,
  TopGlow,
} from '../components/ui'

/** Оставляем цифры и одну точку: суммы в SOL дробные. */
const numeric = (v: string) => v.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1')

/** Значение для input[type=datetime-local] — он не понимает ISO с зоной. */
function localInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * Поле срока — datetime-local, а не date из макета: на демо сбор живёт минуту,
 * иначе возврат по истечении срока нечем показать. День как единица это убивает.
 */
const DEFAULT_DEADLINE = () =>
  localInput(new Date(Date.now() + (usingMock ? 60_000 : 7 * 86_400_000)))

export function CreatePool({
  onBack,
  onCreated,
}: {
  onBack: () => void
  onCreated: (address: string) => void
}) {
  const [icon, setIcon] = useState<PoolIcon>('target')
  const [title, setTitle] = useState('')
  const [goal, setGoal] = useState('')
  const [deadline, setDeadline] = useState(DEFAULT_DEADLINE)
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)

  const goalNumber = Number(goal) || 0
  const ready = Boolean(title.trim()) && goalNumber > 0 && Boolean(deadline)

  async function create() {
    setBusy(true)
    try {
      const seconds = Math.round((new Date(deadline).getTime() - Date.now()) / 1000)
      const address = await ortaq.createPool({
        title: title.trim(),
        description: description.trim(),
        icon,
        goal: toUnits(goalNumber),
        durationSec: Math.max(30, seconds),
        recipient: 'Вы',
      })
      try {
        await navigator.clipboard.writeText(
          `${location.origin}${location.pathname}?pool=${address}`,
        )
      } catch {
        /* буфер недоступен — ссылка всё равно окажется в адресной строке */
      }
      onCreated(address)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <TopGlow />
      <Screen>
        <Back onClick={onBack} />
        <Title>Новый сбор</Title>

        <div className="mt-5">
          <Label>Значок</Label>
          <div className="grid grid-cols-6 gap-2">
            {POOL_ICON_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => setIcon(key)}
                className={`flex aspect-square items-center justify-center rounded-2xl ${
                  icon === key
                    ? 'bg-violet-deep text-white'
                    : 'border border-white/[0.08] bg-white/[0.06] text-white/60'
                }`}
              >
                <PoolGlyph name={key} className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <Label>Название</Label>
          <Field
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Поездка в Алматы…"
          />
        </div>

        <div className="mt-4">
          <Label>Цель сбора (SOL)</Label>
          <Field
            value={goal}
            inputMode="decimal"
            onChange={(e) => setGoal(numeric(e.target.value))}
            placeholder="1.5"
          />
        </div>

        <div className="mt-4">
          <Label>Срок</Label>
          <Field
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <Label>Описание (необязательно)</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Расскажите друзьям, на что собираете…"
          />
        </div>

        <div className="mt-auto pt-8">
          <PrimaryButton disabled={!ready || busy} onClick={create}>
            <span className="flex items-center justify-center gap-2">
              <CopyIcon className="h-4 w-4" />
              Создать и скопировать ссылку
            </span>
          </PrimaryButton>
          <TextButton onClick={onBack}>Отмена</TextButton>
        </div>
      </Screen>
    </>
  )
}
