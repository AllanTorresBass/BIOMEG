import type { ClientCardData } from '@/types/clients/card.types'
import type { ClientLifecycleProps } from '@/types/clients/lifecycle-panel.types'

export type ClientSection = 'ficha' | 'contacto' | 'acciones'

export interface ClientRecordProps {
  card: ClientCardData
  lifecycle: ClientLifecycleProps | null
  canEdit: boolean
  canOpenOrder: boolean
  justSaved: boolean
}
