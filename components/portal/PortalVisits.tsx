import { strings } from '@/lib/strings'
import type { PortalVisit } from '@/types/portal/portal.types'

const BADGE: Record<PortalVisit['state'], string> = {
  LIBERADO: 'bg-flag-released-bg text-flag-released',
  PARCIAL: 'bg-flag-incomplete-bg text-flag-incomplete',
  PENDIENTE: 'bg-flag-blocked-bg text-flag-blocked',
  EN_REVISION: 'bg-flag-incomplete-bg text-flag-incomplete',
}

function note(visit: PortalVisit): string | null {
  if (visit.state === 'PENDIENTE') return strings.portal.pendingNote
  if (visit.state === 'EN_REVISION') return strings.portal.reviewNote
  if (visit.state === 'PARCIAL') return strings.portal.partialNote
  return null
}

export function PortalVisits({ visits }: { visits: PortalVisit[] }) {
  const text = strings.portal
  if (visits.length === 0) return <p>{text.empty}</p>

  return (
    <ul className="flex flex-col gap-4">
      {visits.map((visit) => (
        <li key={visit.orderId} className="rounded-[var(--radius-card)] border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">
              {text.orderLabel} {visit.number}
              <span className="ml-3 font-normal">
                {text.dateLabel}: {visit.dateText}
              </span>
            </p>
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${BADGE[visit.state]}`}>
              {text.states[visit.state]}
            </span>
          </div>

          {note(visit) ? <p className="mt-2">{note(visit)}</p> : null}

          {visit.sections.map((section) => (
            <div key={`${section.title}-${section.subsection ?? ''}`} className="mt-4 overflow-x-auto">
              <h3 className="font-semibold">
                {section.title}
                {section.subsection ? ` · ${section.subsection}` : ''}
              </h3>
              <table className="mt-1 w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="py-1 pr-3 font-semibold">{text.columns.exam}</th>
                    <th scope="col" className="py-1 pr-3 font-semibold">{text.columns.result}</th>
                    <th scope="col" className="py-1 pr-3 font-semibold">{text.columns.unit}</th>
                    <th scope="col" className="py-1 font-semibold">{text.columns.reference}</th>
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row) => (
                    <tr key={row.lineId} className="border-b border-border">
                      <th scope="row" className="py-1 pr-3 font-normal">{row.name}</th>
                      <td className="py-1 pr-3 font-semibold">
                        {row.value}
                        {row.mark ? ` ${row.mark}` : ''}
                      </td>
                      <td className="py-1 pr-3">{row.unit}</td>
                      <td className="py-1">{row.reference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {visit.canDownload ? (
            <a
              href={`/portal/informe/${visit.orderId}`}
              className="mt-4 inline-flex h-10 items-center rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground"
            >
              {text.download}
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
