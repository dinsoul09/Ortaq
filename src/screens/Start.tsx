import { useState } from 'react'
import { setIdentity, type Identity } from '../lib/wallet'

export function Start({ onReady }: { onReady: (i: Identity) => void }) {
  const [name, setName] = useState('')
  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Ortaq</h1>
        <p className="mt-2 text-mute">Общая касса без казначея</p>
      </div>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Как вас зовут?"
        className="w-full rounded-xl border border-line bg-card px-4 py-4 text-lg outline-none focus:border-brand"
      />
      <button
        disabled={!name.trim()}
        onClick={() => onReady(setIdentity(name))}
        className="w-full rounded-xl bg-brand py-4 text-lg font-semibold text-ink disabled:opacity-40"
      >
        Продолжить
      </button>
    </div>
  )
}
