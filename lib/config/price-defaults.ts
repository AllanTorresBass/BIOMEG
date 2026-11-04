import type { CostType, PriceColumn } from '@/types/orders/draft.types'

/**
 * Saved pairs of tipo de costo and price column. The application ships with none, so the operator
 * always chooses the column. A maintenance table may later fill this in. Once a pair is saved,
 * choosing another column needs a confirm and a motivo at reception (R-026).
 */
export const SAVED_PRICE_PAIRS: Partial<Record<CostType, PriceColumn>> = {}

export const COST_TYPES: readonly CostType[] = ['RUTINA', 'SEGURO_EMPRESA', 'EMERGENCIA', 'HOSPITALIZADO']

export const PRICE_COLUMNS: readonly PriceColumn[] = ['PARTICULAR', 'ALIADOS', 'HOSPITALIZADO', 'EMERGENCIA', 'ESTATAL']

export const COST_TYPE_LABELS: Record<CostType, string> = {
  RUTINA: 'Rutina',
  SEGURO_EMPRESA: 'Seguro/Empresa',
  EMERGENCIA: 'Emergencia',
  HOSPITALIZADO: 'Hospitalizado',
}

export const PRICE_COLUMN_LABELS: Record<PriceColumn, string> = {
  PARTICULAR: 'Particular',
  ALIADOS: 'Aliados',
  HOSPITALIZADO: 'Hospitalizado',
  EMERGENCIA: 'Emergencia',
  ESTATAL: 'Estatal',
}
