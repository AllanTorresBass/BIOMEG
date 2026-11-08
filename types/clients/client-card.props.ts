import type { ClientCardData } from '@/types/clients/card.types'

export type ClientFormPanel = 'ficha' | 'contacto'

export interface ClientCardProps {
  data: ClientCardData
  canEdit: boolean
  canOpenOrder: boolean
  justSaved: boolean
  /** Which part of the ficha is on screen. The other fields stay mounted so Guardar still has them. */
  panel?: ClientFormPanel
  /** The record header already shows the name, so the card does not repeat it. */
  embedded?: boolean
  onFieldPanel?: (panel: ClientFormPanel) => void
}

export type Values = Pick<
  ClientCardData,
  'fullName' | 'cedulaType' | 'cedulaNumber' | 'birthDate' | 'sex' | 'phone' | 'email' | 'consentWhatsapp' | 'consentEmail'
>
