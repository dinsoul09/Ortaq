/**
 * Личность участника в прототипе.
 *
 * Пользователь вводит только имя. Ключ генерируется в браузере и живёт в localStorage —
 * ни сид-фразы, ни адреса, ни слова «кошелёк» в интерфейсе.
 *
 * На защите проговаривается вслух: в прототипе ключ локальный, в продукте — встроенный
 * кошелёк. Честная заглушка, названная заглушкой, вопросов не вызывает.
 *
 * Когда подключится chain.ts — здесь появится настоящий Keypair из @solana/web3.js,
 * а наружу останутся те же две функции.
 */
const KEY = 'ortaq.identity'

export interface Identity {
  id: string
  name: string
}

export function getIdentity(): Identity | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Identity) : null
  } catch {
    return null
  }
}

export function setIdentity(name: string): Identity {
  const identity: Identity = { id: crypto.randomUUID(), name: name.trim() }
  try {
    localStorage.setItem(KEY, JSON.stringify(identity))
  } catch {
    /* приватный режим — переживём, личность будет жить до перезагрузки */
  }
  return identity
}
