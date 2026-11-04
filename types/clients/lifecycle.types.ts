/** What the screen still has to collect before the server will run the action. */
export type LifecycleNeed = 'CONFIRM' | 'STEP_UP' | 'MOTIVO'

export interface LifecycleResult {
  ok: boolean
  message: string
  need: LifecycleNeed | null
}

export interface LifecycleInput {
  clientId: string
  confirmed?: boolean
  motivo?: string
}
