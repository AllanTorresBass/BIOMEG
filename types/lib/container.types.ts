import type { ServiceContainer } from '@/types/contracts/services.contracts'

export type Registry = { -readonly [Name in keyof ServiceContainer]?: ServiceContainer[Name] }
