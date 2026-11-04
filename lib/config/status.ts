import type { StatusKey, StatusDefinition } from '@/types/shared/status.types'

/** The one table behind every chip. A chip always shows its word, and color is a second channel. */
export const STATUS_TABLE: Record<StatusKey, StatusDefinition> = {
  ALTO: { label: 'ALTO', tone: 'high', icon: 'up' },
  BAJO: { label: 'BAJO', tone: 'low', icon: 'down' },
  INCOMPLETO: { label: 'INCOMPLETO', tone: 'incomplete', icon: null },
  SIN_TASA: { label: 'SIN TASA', tone: 'incomplete', icon: null },
  BLOQUEADO: { label: 'BLOQUEADO', tone: 'blocked', icon: null },
  INACTIVO: { label: 'INACTIVO', tone: 'blocked', icon: null },
  NO_DISP: { label: 'NO DISP.', tone: 'blocked', icon: null },
  LIBERADO: { label: 'LIBERADO', tone: 'released', icon: null },
  ACTIVO: { label: 'ACTIVO', tone: 'released', icon: null },
  DISPONIBLE: { label: 'DISPONIBLE', tone: 'released', icon: null },
  ABIERTA: { label: 'ABIERTA', tone: 'neutral', icon: null },
  EN_CORRECCION: { label: 'EN_CORRECCION', portalLabel: 'En revisión', tone: 'neutral', icon: null },
  EN_REVISION: { label: 'EN REVISIÓN', tone: 'neutral', icon: null },
  PENDIENTE: { label: 'PENDIENTE', tone: 'neutral', icon: null },
  SIN_VERIFICAR: { label: 'SIN VERIFICAR', tone: 'neutral', icon: null },
  SIN_IMPRIMIR: { label: 'SIN IMPRIMIR', tone: 'neutral', icon: null },
  IMPRESO: { label: 'IMPRESO', tone: 'neutral', icon: null },
}

export const STATUS_KEYS = Object.keys(STATUS_TABLE) as StatusKey[]

export function statusLabel(status: StatusKey, surface: 'staff' | 'portal' = 'staff'): string {
  const entry = STATUS_TABLE[status]
  return surface === 'portal' && entry.portalLabel ? entry.portalLabel : entry.label
}
