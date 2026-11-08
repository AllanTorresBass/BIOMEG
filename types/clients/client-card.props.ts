import type { ClientCardData } from '@/types/clients/card.types'

export interface ClientCardProps {
  data: ClientCardData
  canEdit: boolean
  canOpenOrder: boolean
  justSaved: boolean
}

export type Values = Pick<
  ClientCardData,
  'fullName' | 'cedulaType' | 'cedulaNumber' | 'birthDate' | 'sex' | 'phone' | 'email' | 'consentWhatsapp' | 'consentEmail'
>
