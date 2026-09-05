/**
 * Крупное сообщение об отказе — тот самый кадр демо.
 * Должно читаться с трёх метров и не исчезать само.
 */
export function Notice({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
      onClick={onClose}
    >
      <div className="w-full max-w-sm rounded-2xl border-2 border-alarm bg-card p-7 text-center">
        <div className="mb-4 text-5xl">✋</div>
        <p className="text-xl leading-snug font-semibold text-white">{text}</p>
        <button
          className="mt-6 w-full rounded-xl border border-line py-3 text-mute"
          onClick={onClose}
        >
          Понятно
        </button>
      </div>
    </div>
  )
}
