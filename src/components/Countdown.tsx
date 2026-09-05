import { useEffect, useState } from 'react'
import { formatLeft } from '../lib/format'

export function Countdown({ deadline }: { deadline: number }) {
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="tabular-nums">{formatLeft(deadline)}</span>
}
