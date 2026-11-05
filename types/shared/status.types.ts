export type StatusKey =
  | 'ALTO'
  | 'BAJO'
  | 'INCOMPLETO'
  | 'SIN_TASA'
  | 'BLOQUEADO'
  | 'INACTIVO'
  | 'NO_DISP'
  | 'LIBERADO'
  | 'ACTIVO'
  | 'DISPONIBLE'
  | 'ABIERTA'
  | 'ANULADA'
  | 'EN_CORRECCION'
  | 'EN_REVISION'
  | 'PENDIENTE'
  | 'SIN_VERIFICAR'
  | 'SIN_IMPRIMIR'
  | 'IMPRESO'

export type StatusTone = 'high' | 'low' | 'incomplete' | 'blocked' | 'released' | 'neutral'

export interface StatusDefinition {
  label: string
  portalLabel?: string
  tone: StatusTone
  icon: 'up' | 'down' | null
}

export interface StatusChipProps {
  status: StatusKey
  surface?: 'staff' | 'portal'
}
