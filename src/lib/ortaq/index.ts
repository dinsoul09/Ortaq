import { mockClient } from './mock'
import { chainClient } from './chain'
import type { OrtaqClient } from './types'

const useMock = import.meta.env.VITE_USE_MOCK !== 'false'

/** true, пока работаем на моке. Экраны используют это только для демо-умолчаний. */
export const usingMock = useMock

/** Единственная точка входа в сеть для всего приложения. */
export const ortaq: OrtaqClient = useMock ? mockClient : chainClient

export * from './types'
