import { useState } from 'react'
import { ortaq } from '../lib/ortaq'
import { toUnits } from '../lib/format'

/** Режется первым, если не успеваем: сбор можно создать заранее скриптом. */
export function CreatePool({ onCreated }: { onCreated: (address: string) => void }) {
  const [title, setTitle] = useState('')
  const [goal, setGoal] = useState('30000')
  const [minutes, setMinutes] = useState('1')
  const [recipient, setRecipient] = useState('Айгерим')
  const [busy, setBusy] = useState(false)

  async function create() {
    setBusy(true)
    try {
      const address = await ortaq.createPool({
        title: title.trim() || 'Общий сбор',
        goal: toUnits(Number(goal) || 0),
        durationSec: Math.max(30, Number(minutes) * 60),
        recipient,
      })
      onCreated(address)
    } finally {
      setBusy(false)
    }
  }

  const field = 'w-full rounded-xl border border-line bg-card px-4 py-4 text-lg outline-none focus:border-brand'

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-4 p-5">
      <h1 className="mt-2 text-2xl font-bold">Новый сбор</h1>
      <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="На что собираем" />
      <input className={field} value={goal} onChange={(e) => setGoal(e.target.value)} inputMode="numeric" placeholder="Сколько нужно, ₸" />
      <input className={field} value={minutes} onChange={(e) => setMinutes(e.target.value)} inputMode="numeric" placeholder="Срок, минут" />
      <input className={field} value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Кому уйдут деньги" />
      <button
        disabled={busy}
        onClick={create}
        className="mt-2 w-full rounded-xl bg-brand py-4 text-lg font-semibold text-ink disabled:opacity-40"
      >
        Создать сбор
      </button>
      <p className="text-sm text-mute">
        Получатель фиксируется при создании и потом не меняется — даже вами.
      </p>
    </div>
  )
}
