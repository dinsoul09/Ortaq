import { mockClient } from './mock'
import { chainClient } from './chain'
import type { OrtaqClient } from './types'

const useMock = import.meta.env.VITE_USE_MOCK !== 'false'

/** Единственная точка входа в сеть для всего приложения. */
export const ortaq: OrtaqClient = useMock ? mockClient : chainClient

export * from './types'
