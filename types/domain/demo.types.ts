import type { CedulaType } from '@/lib/utils/format'

export type StaffRole = 'RECEPCION' | 'AUXILIAR' | 'BIOANALISTA' | 'ADMINISTRACION'

export interface DemoStaffUser {
  id: string
  displayName: string
  role: StaffRole
}

export interface DemoClient {
  id: string
  fullName: string
  cedulaType: CedulaType
  cedulaDigits: string
  birthDate: string
  sex: 'F' | 'M' | null
  verified: boolean
  active: boolean
  deletedAt: string | null
  version: number
}

export interface DemoCompany {
  id: string
  name: string
  active: boolean
  requiresTitular: boolean
}

export interface DemoPhysician {
  id: string
  name: string
}

/** Catalog structure is Unknown (gap G1). These sections and rows are invented. */
export interface DemoResultLine {
  id: string
  section: string
  subsection: string | null
  name: string
  /** Stored as text. Numeric results use a dot decimal and no grouping. */
  value: string
  unit: string | null
  /** Stored as text exactly as printed. */
  reference: string
  calculated: boolean
}

export type PriceColumn = 'PARTICULAR' | 'ALIADOS' | 'HOSPITALIZADO' | 'EMERGENCIA' | 'ESTATAL'

export interface DemoPrice {
  /** null is a blank price. "0.00" is a stored zero. */
  usd: string | null
  bs: string | null
}

export interface DemoPriceRow {
  id: string
  name: string
  status: 'DISPONIBLE' | 'NO_DISP'
  prices: Record<PriceColumn, DemoPrice>
}

export interface DemoLabSettings {
  rif: string
  rateBs: string
  rateDate: string
  qrEnabled: boolean
  saturdayPriceEnabled: boolean
  discountLimit: number
  ivaRate: string | null
  igtfRate: string | null
  valueCheckEnabled: boolean
}

export interface DemoSeed {
  staff: DemoStaffUser[]
  clients: DemoClient[]
  companies: DemoCompany[]
  physicians: DemoPhysician[]
  resultLines: DemoResultLine[]
  priceRows: DemoPriceRow[]
  settings: DemoLabSettings
}
