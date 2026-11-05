import 'server-only'
import { strings } from '@/lib/strings'
import type { DemoResultLine, DemoSeed, PriceColumn } from '@/types/domain/demo.types'

/** Every record here is invented. No real person, cédula, or result appears. */

function line(
  id: string,
  section: string,
  subsection: string | null,
  name: string,
  value: string,
  unit: string | null,
  reference: string,
  calculated = false,
): DemoResultLine {
  return { id, section, subsection, name, value, unit, reference, calculated }
}

const HEM = 'HEMATOLOGIA COMPLETA'
const LIP = 'PERFIL LIPIDICO'

const resultLines: DemoResultLine[] = [
  line('rl-01', HEM, 'SERIE ROJA', 'HEMATIES', '4.52', 'millones/µL', '3,80 - 5,80'),
  line('rl-02', HEM, 'SERIE ROJA', 'HEMOGLOBINA', '12.7', 'g/dL', 'HOMBRE: 12,0 - 16,0 / MUJER: 11,0 - 15,0'),
  line('rl-03', HEM, 'SERIE ROJA', 'V.C.M.', '88.4', 'fL', '80,0 - 100,0', true),
  line('rl-04', HEM, 'SERIE ROJA', 'H.C.M.', '29.1', 'pg', '27,0 - 32,0', true),
  line('rl-05', HEM, 'SERIE ROJA', 'C.H.C.M.', '33.0', 'g/dL', '32,0 - 36,0', true),
  line('rl-06', HEM, 'SERIE ROJA', 'R.D.W.', '13.2', '%', '11,5 - 14,5', true),
  line('rl-07', HEM, 'SERIE BLANCA', 'LEUCOCITOS', '13100', '/µL', '4.500 - 11.000'),
  line('rl-08', HEM, 'SERIE PLAQUETARIA', 'PLAQUETAS', '250000', '/µL', '150.000 - 450.000'),
  line('rl-09', 'QUIMICA SANGUINEA', null, 'GLUCOSA', '92', 'mg/dL', '70 -105 mg/dL'),
  line('rl-10', LIP, null, 'COLESTEROL TOTAL', '185', 'mg/dL', 'Hasta 200 mg/dL'),
  line('rl-11', LIP, null, 'TRIGLICERIDOS', '140', 'mg/dL', '< 150 mg/dL'),
  line('rl-12', LIP, null, 'LDL-COLESTEROL', '108', 'mg/dL', 'Favorable menor de 4.5', true),
  line('rl-13', 'ANÁLISIS FÍSICO', null, 'COLOR', 'AMARILLO', null, '.'),
  line('rl-14', 'ANÁLISIS FÍSICO', null, 'ASPECTO', 'NORMAL', null, 'NORMAL'),
  line('rl-15', 'ANÁLISIS QUÍMICO', null, 'PROTEINAS', 'NEGATIVO', null, 'NEGATIVO'),
  line('rl-16', 'ANÁLISIS QUÍMICO', null, 'GLUCOSA', 'POSITIVO (+++)', null, 'NEGATIVO'),
  line('rl-17', 'ANÁLISIS MICROSCÓPICO', null, 'LEUCOCITOS', '1-3 XC', null, '0 - 5 XC'),
  line('rl-18', 'ANÁLISIS MICROSCÓPICO', null, 'BACTERIAS', 'ESCASAS', null, '.'),
]

function prices(
  entries: Record<PriceColumn, [usd: string | null, bs: string | null]>,
): Record<PriceColumn, { usd: string | null; bs: string | null }> {
  const out = {} as Record<PriceColumn, { usd: string | null; bs: string | null }>
  for (const column of Object.keys(entries) as PriceColumn[]) {
    const [usd, bs] = entries[column]
    out[column] = { usd, bs }
  }
  return out
}

function buildSeed(): DemoSeed {
  return {
  staff: [
    { id: 'u-recepcion', displayName: 'Recepción Demo', role: 'RECEPCION' },
    { id: 'u-auxiliar', displayName: 'Auxiliar Demo', role: 'AUXILIAR' },
    { id: 'u-bioanalista', displayName: 'Lcda. Demo', role: 'BIOANALISTA' },
    { id: 'u-administracion', displayName: 'Administración Demo', role: 'ADMINISTRACION' },
  ],
  clients: [
    { id: 'c-1', phone: '04140000001', fullName: 'Paciente Demo Uno', cedulaType: 'V', cedulaDigits: '12000001', birthDate: '1985-03-14', sex: 'F', verified: true, active: true, deletedAt: null, version: 1 },
    { id: 'c-2', fullName: 'Paciente Demo Dos', cedulaType: 'V', cedulaDigits: '12000002', birthDate: '1990-11-02', sex: 'M', verified: false, active: true, deletedAt: null, version: 1 },
    { id: 'c-3', fullName: 'Paciente Demo Tres', cedulaType: 'E', cedulaDigits: '82000003', birthDate: '2025-02-20', sex: 'F', verified: true, active: true, deletedAt: null, version: 1 },
    { id: 'c-4', fullName: 'Paciente Demo Cuatro', cedulaType: 'V', cedulaDigits: '12000004', birthDate: '1962-07-30', sex: 'M', verified: true, active: false, deletedAt: null, version: 2 },
    { id: 'c-5', fullName: 'Paciente Demo Cinco', cedulaType: 'V', cedulaDigits: '12000005', birthDate: '1978-01-09', sex: 'F', verified: true, active: true, deletedAt: '2026-10-01T15:00:00.000Z', version: 3 },
    { id: 'c-6', fullName: 'Paciente Demo Seis', cedulaType: 'V', cedulaDigits: '12000006', birthDate: '2001-05-25', sex: null, verified: true, active: true, deletedAt: null, version: 1 },
  ],
  companies: [
    { id: 'e-1', name: 'Empresa Demo, C.A.', active: true, requiresTitular: true },
    { id: 'e-2', name: 'Seguro Demo, C.A.', active: true, requiresTitular: false },
    { id: 'e-3', name: 'Convenio Inactivo Demo', active: false, requiresTitular: false },
  ],
  physicians: [
    { id: 'm-1', name: 'Dr. Demo Uno' },
    { id: 'm-2', name: 'Dra. Demo Dos' },
  ],
  resultLines,
  priceRows: [
    {
      id: 'p-1',
      name: 'HEMATOLOGIA COMPLETA',
      status: 'DISPONIBLE',
      prices: prices({
        PARTICULAR: ['8.00', '7114.08'],
        ALIADOS: ['6.50', '5780.19'],
        HOSPITALIZADO: ['9.00', '8003.34'],
        EMERGENCIA: ['10.00', '8892.60'],
        ESTATAL: [null, null],
      }),
    },
    {
      id: 'p-2',
      name: 'GLUCEMIA',
      status: 'DISPONIBLE',
      prices: prices({
        PARTICULAR: ['3.00', '2667.78'],
        ALIADOS: ['2.50', '2223.15'],
        HOSPITALIZADO: ['3.50', '3112.41'],
        EMERGENCIA: ['4.00', '3557.04'],
        ESTATAL: ['2.00', '1778.52'],
      }),
    },
    {
      id: 'p-3',
      name: 'PERFIL LIPIDICO',
      status: 'DISPONIBLE',
      prices: prices({
        PARTICULAR: ['12.00', '10671.12'],
        ALIADOS: ['10.00', '8892.60'],
        HOSPITALIZADO: ['13.00', '11560.38'],
        EMERGENCIA: ['14.00', '12449.64'],
        ESTATAL: ['0.00', '0.00'],
      }),
    },
    {
      id: 'p-4',
      name: 'EXAMEN DE ORINA',
      status: 'NO_DISP',
      prices: prices({
        PARTICULAR: ['4.00', '3557.04'],
        ALIADOS: ['3.50', '3112.41'],
        HOSPITALIZADO: ['4.50', '4001.67'],
        EMERGENCIA: ['5.00', '4446.30'],
        ESTATAL: ['3.00', '2667.78'],
      }),
    },
  ],
  settings: {
    rif: strings.brand.rifUnconfirmed,
    rateBs: '889.26',
    rateDate: '2026-11-04',
    qrEnabled: true,
    saturdayPriceEnabled: false,
    discountLimit: 0,
    ivaRate: null,
    igtfRate: null,
    portalCodeWorks: false,
  },
  }
}

const globalStore = globalThis as typeof globalThis & { __biomegDemoSeed?: DemoSeed }

/** One object for every server bundle. A rate or price change has to be visible to the next screen. */
export const demoSeed: DemoSeed = (globalStore.__biomegDemoSeed ??= buildSeed())
