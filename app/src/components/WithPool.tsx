import { useEffect, useState, type ReactNode } from 'react'
import { ortaq, type Pool } from '../lib/ortaq'
import { Screen } from './ui'

/** Загружает сбор по адресу — чтобы экраны взноса не тащили это каждый сам. */
export function WithPool({
  address,
  children,
}: {
  address: string
  children: (pool: Pool) => ReactNode
}) {
  const [pool, setPool] = useState<Pool | null>(null)

  useEffect(() => {
    let alive = true
    ortaq.getPool(address).then(
      (p) => alive && setPool(p),
      () => {},
    )
    return () => {
      alive = false
    }
  }, [address])

  if (!pool)
    return (
      <Screen>
        <p className="text-white/40">Загрузка…</p>
      </Screen>
    )
  return <>{children(pool)}</>
}
