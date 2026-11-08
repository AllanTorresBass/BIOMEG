import Link from 'next/link'
import { RegistryPanel } from '@/components/office/Panels'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { StaffBreadcrumb } from '@/components/shared/StaffBreadcrumb'
import { mayReach } from '@/lib/server/guard'
import { getRegistryScreen } from '@/lib/server/queries/back-office'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'
import { REGISTRY_COMMAND, type RegistryKind } from '@/types/office/office.types'
import { cn } from '@/lib/utils'

const text = strings.pendingReview.hubs

const BACT_TABS: { id: RegistryKind; label: string }[] = [
  { id: 'parasites', label: 'Parásitos' },
  { id: 'antibiotics', label: 'Antibióticos' },
  { id: 'organisms', label: 'Microorganismos' },
  { id: 'bacteriology_samples', label: 'Muestras' },
  { id: 'bacteriology_observations', label: 'Observaciones' },
]

const TITLES: Record<string, string> = {
  parasites: 'Registro de parásitos',
  antibiotics: 'Registro de antibióticos',
  organisms: 'Registro de microorganismo',
  bacteriology_samples: 'Registro de muestra de bacteriología',
  bacteriology_observations: 'Registro de observaciones de bacteriología',
}

export default async function BacteriologiaHubPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const context = await requireReadyStaff()
  if (context.locked) return null
  const search = await searchParams
  const reachable = BACT_TABS.filter((tab) => mayReach(context, [REGISTRY_COMMAND[tab.id]]))
  if (reachable.length === 0) return <BlockedNotice />

  const requested = search.tab
  const activeKind = reachable.some((tab) => tab.id === requested) ? (requested as RegistryKind) : reachable[0]!.id
  const command = REGISTRY_COMMAND[activeKind]
  const screen = await getRegistryScreen(context, activeKind, command, `/registros/bacteriologia`)
  if (screen.kind === 'BLOCKED') return <BlockedNotice />

  return (
    <section className="flex flex-col gap-4">
      <StaffBreadcrumb label={text.routeLabel} crumbs={[{ label: text.bacteriologiaTitle }]} />
      <h1 className="text-xl font-semibold">{text.bacteriologiaTitle}</h1>
      <p className="text-muted-foreground">{text.bacteriologiaHint}</p>
      <div role="tablist" aria-label={text.bacteriologiaTabs} className="flex flex-wrap gap-1 border-b border-border">
        {reachable.map((tab) => {
          const selected = tab.id === activeKind
          return (
            <Link
              key={tab.id}
              href={`/registros/bacteriologia?tab=${tab.id}`}
              role="tab"
              aria-selected={selected}
              className={cn(
                'inline-flex h-10 items-center rounded-t-[var(--radius-control)] px-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] focus-visible:ring-offset-2',
                selected ? 'border-b-2 border-[var(--color-navy)] text-[var(--color-navy)]' : 'text-muted-foreground',
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
      <h2 className="text-lg font-semibold">{TITLES[activeKind]}</h2>
      <RegistryPanel kind={activeKind} rows={screen.rows} canEdit={screen.canEdit} titular={screen.titular} />
    </section>
  )
}
