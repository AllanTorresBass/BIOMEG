import { notFound, redirect } from 'next/navigation'
import { RegistryPanel } from '@/components/office/Panels'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { getRegistryScreen } from '@/lib/server/queries/back-office'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'
import { REGISTRY_COMMAND, type RegistryKind } from '@/types/office/office.types'

const TITLES: Record<RegistryKind, string> = {
  physicians: 'Registro de médicos',
  companies: 'Registro de empresas',
  suppliers: 'Registro de proveedores',
  reagents: 'Registro de reactivos y servicios',
  equipment: 'Registro de equipos',
  parasites: 'Registro de parásitos',
  antibiotics: 'Registro de antibióticos',
  organisms: 'Registro de microorganismo',
  bacteriology_samples: 'Registro de muestra de bacteriología',
  bacteriology_observations: 'Registro de observaciones de bacteriología',
  profiles: 'Crear perfiles',
  retentions: 'Tipos de retenciones (ISLR)',
}

const BACT_KINDS = new Set([
  'parasites',
  'antibiotics',
  'organisms',
  'bacteriology_samples',
  'bacteriology_observations',
])

/** Registry lists that used to mirror a Reportes “Lista de …” stub. Export lives here. */
const EXPORTABLE = new Set(['physicians', 'companies', 'suppliers', 'reagents', 'equipment'])

const KINDS = new Set<string>(Object.keys(REGISTRY_COMMAND))

export default async function RegistryPage({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params
  if (!KINDS.has(kind)) notFound()
  if (BACT_KINDS.has(kind)) redirect(`/registros/bacteriologia?tab=${kind}`)
  const registryKind = kind as RegistryKind
  const context = await requireReadyStaff()
  if (context.locked) return null
  const screen = await getRegistryScreen(context, registryKind, REGISTRY_COMMAND[registryKind], `/registros/${kind}`)
  if (screen.kind === 'BLOCKED') return <BlockedNotice />
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{TITLES[registryKind]}</h1>
      {EXPORTABLE.has(registryKind) ? (
        <p className="text-muted-foreground">{strings.pendingReview.hubs.registryExportHint}</p>
      ) : null}
      <RegistryPanel kind={registryKind} rows={screen.rows} canEdit={screen.canEdit} titular={screen.titular} />
    </section>
  )
}
