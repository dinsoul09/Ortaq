import { useState } from 'react'
import { getIdentity, type Identity } from './lib/wallet'
import { Start } from './screens/Start'
import { CreatePool } from './screens/CreatePool'
import { PoolView } from './screens/PoolView'

/**
 * Роутинга нет намеренно. Адрес сбора берётся из ?pool= — так три телефона
 * открывают один и тот же сбор по одной ссылке.
 */
export default function App() {
  const [me, setMe] = useState<Identity | null>(getIdentity)
  const initial = new URLSearchParams(location.search).get('pool')
  const [pool, setPool] = useState<string | null>(initial)

  if (!me) return <Start onReady={setMe} />

  if (!pool)
    return (
      <CreatePool
        onCreated={(address) => {
          history.replaceState(null, '', `?pool=${address}`)
          setPool(address)
        }}
      />
    )

  return <PoolView address={pool} me={me} />
}
