import { useCallback, useEffect, useState } from 'react'
import { ortaq, type Contribution, type Pool } from './lib/ortaq'
import { getName, setName } from './lib/wallet'
import { WithPool } from './components/WithPool'
import { Connect } from './screens/Connect'
import { Name } from './screens/Name'
import { PoolList } from './screens/PoolList'
import { PoolView } from './screens/PoolView'
import { Contribute } from './screens/Contribute'
import { Sent } from './screens/Sent'
import { CreatePool } from './screens/CreatePool'
import { Notifications, notificationsFor } from './screens/Notifications'

const POLL_MS = 2000

type View =
  | { name: 'list' }
  | { name: 'pool'; address: string }
  | { name: 'create' }
  | { name: 'contribute'; address: string }
  | { name: 'sent'; address: string }
  | { name: 'notifications' }
  | { name: 'rename' }

/**
 * Роутинга нет намеренно. Адрес сбора берётся из ?pool= — так три телефона
 * открывают один и тот же сбор по одной ссылке.
 *
 * Вход только через Phantom: имени в макете нет, личностью служит адрес.
 */
export default function App() {
  const [wallet, setWallet] = useState<string | null>(null)
  const [me, setMe] = useState<string>(getName)
  const [view, setView] = useState<View>(() => {
    const deep = new URLSearchParams(location.search).get('pool')
    return deep ? { name: 'pool', address: deep } : { name: 'list' }
  })

  // Список опрашивается здесь: он нужен и главному экрану, и счётчику уведомлений.
  const [pools, setPools] = useState<Pool[]>([])
  const [people, setPeople] = useState<Record<string, Contribution[]>>({})
  const [balance, setBalance] = useState<number | null>(null)

  const load = useCallback(async () => {
    try {
      // Баланс читаем ПОСЛЕ списка: истёкший сбор закрывается лениво, внутри
      // listPools, и там же возвращает деньги. Параллельный запрос успел бы
      // забрать баланс до возврата и показать его на цикл опроса старым.
      const list = await ortaq.listPools()
      const [rows, money] = await Promise.all([
        Promise.all(list.map((p) => ortaq.listContributions(p.address))),
        ortaq.getBalance(),
      ])
      setPools(list)
      setPeople(Object.fromEntries(list.map((p, i) => [p.address, rows[i]])))
      setBalance(money)
    } catch {
      /* сеть моргнула — покажем прошлое состояние, следующий опрос починит */
    }
  }, [])

  useEffect(() => {
    if (!wallet) return
    void load()
    const id = setInterval(load, POLL_MS)
    return () => clearInterval(id)
  }, [wallet, load])

  const openPool = (address: string) => {
    history.replaceState(null, '', `?pool=${address}`)
    setView({ name: 'pool', address })
  }

  const goHome = () => {
    history.replaceState(null, '', location.pathname)
    setView({ name: 'list' })
  }

  if (!wallet) return <Connect onConnected={setWallet} />

  // Имя спрашиваем один раз: без него взнос в списке участников безымянный.
  if (!me) return <Name onSave={(n) => setMe(setName(n))} />

  switch (view.name) {
    case 'rename':
      return (
        <Name
          initial={me}
          onBack={goHome}
          onSave={(n) => {
            setMe(setName(n))
            goHome()
          }}
        />
      )

    case 'create':
      return <CreatePool onBack={goHome} onCreated={openPool} />

    case 'notifications':
      return <Notifications pools={pools} people={people} onBack={goHome} />

    case 'contribute':
      return (
        // key разводит экраны взноса и успеха: без него React переиспользует
        // WithPool, эффект не перезапускается и сбор остаётся дозагрузочным.
        <WithPool key="contribute" address={view.address}>
          {(pool) => (
            <Contribute
              pool={pool}
              me={me}
              balance={balance}
              onBack={() => setView({ name: 'pool', address: pool.address })}
              onSent={() => setView({ name: 'sent', address: pool.address })}
            />
          )}
        </WithPool>
      )

    case 'sent':
      return (
        <WithPool key="sent" address={view.address}>
          {(pool) => <Sent pool={pool} onHome={goHome} />}
        </WithPool>
      )

    case 'pool':
      return (
        <PoolView
          address={view.address}
          me={me}
          onBack={goHome}
          onContribute={() => setView({ name: 'contribute', address: view.address })}
        />
      )

    default:
      return (
        <PoolList
          address={wallet}
          me={me}
          balance={balance}
          pools={pools}
          people={people}
          unread={notificationsFor(pools, people).length}
          onOpen={openPool}
          onCreate={() => setView({ name: 'create' })}
          onNotifications={() => setView({ name: 'notifications' })}
          onRename={() => setView({ name: 'rename' })}
        />
      )
  }
}
