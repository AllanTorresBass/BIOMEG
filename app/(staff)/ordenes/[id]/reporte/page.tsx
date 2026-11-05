import { notFound } from 'next/navigation'
import { DeliveryPanel } from '@/components/orders/DeliveryPanel'
import { ReportChrome } from '@/components/orders/ReportChrome'
import { ReportPaper } from '@/components/orders/ReportPaper'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { decide } from '@/lib/auth/decide'
import { getStub } from '@/lib/db/memory/order-index'
import { resultsOf } from '@/lib/db/memory/result-store'
import { demoSeed } from '@/lib/db/memory/seed'
import { resultOrderState } from '@/lib/domain/result-rules'
import { buildDeliveryView, deliveryStateOf } from '@/lib/server/domain/delivery'
import { buildReport } from '@/lib/server/domain/report'
import { guardRoute } from '@/lib/server/guard'
import { requestOrigin } from '@/lib/server/origin'
import { qrModules } from '@/lib/server/qr'
import { toDecisionSession } from '@/lib/server/session/current'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'
import { formatDate } from '@/lib/utils/format'
import type { ReportMode } from '@/types/orders/report.types'

const text = strings.report

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ prueba?: string }>
}) {
  const context = await requireReadyStaff()
  if (context.locked) return null
  const { id } = await params
  const { prueba } = await searchParams
  const mode: ReportMode = prueba ? 'PRUEBA' : 'PACIENTE'
  const command = mode === 'PRUEBA' ? 'report.print.single' : 'report.print.patient'
  if (!(await guardRoute(context, [command], `/ordenes/${id}/reporte`))) return <BlockedNotice />

  const stub = getStub(id)
  if (!stub || stub.voided) notFound()

  const read = decide({
    session: toDecisionSession(context),
    command,
    facts: { state: resultOrderState(stub) },
    gestures: { confirmVerified: false, stepUpVerified: false },
  })
  if (!read.allowed) return <BlockedNotice />

  const lineId = mode === 'PRUEBA' ? (prueba ?? null) : null
  const report = buildReport({ stub, mode, lineId, origin: await requestOrigin() })
  const names = new Map(demoSeed.resultLines.map((line) => [line.id, line.name]))
  const choices = resultsOf(stub.id).filter((cell) => cell.value.trim() !== '')

  const deliveryState = deliveryStateOf(stub)
  const session = toDecisionSession(context)
  const gestures = { confirmVerified: true, stepUpVerified: true }
  const deliveryView =
    mode === 'PACIENTE' && deliveryState
      ? buildDeliveryView(stub, {
          send: decide({
            session,
            command: 'delivery.send',
            facts: { state: deliveryState, delivery_mode_allowed: true, incomplete_approved: true },
            gestures,
          }).allowed,
          approve: decide({ session, command: 'delivery.approve_incomplete', facts: { state: deliveryState }, gestures }).allowed,
        })
      : null

  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold print:hidden">{text.title}</h1>

      <nav aria-label={text.title} className="flex flex-wrap items-end gap-3 print:hidden">
        <a
          href={`/ordenes/${id}/reporte`}
          aria-current={mode === 'PACIENTE' ? 'page' : undefined}
          className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-border px-4 font-semibold aria-[current=page]:bg-sunken"
        >
          {text.chrome.byPatient}
        </a>
        <form method="get" className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1">
            <span>{text.chrome.single}</span>
            <select
              name="prueba"
              defaultValue={prueba ?? ''}
              className="min-h-11 rounded-[var(--radius-control)] border border-border bg-background px-2"
            >
              <option value="" disabled>
                {text.chrome.pickSingle}
              </option>
              {choices.map((cell) => (
                <option key={cell.lineId} value={cell.lineId}>
                  {names.get(cell.lineId) ?? cell.lineId}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="min-h-11 rounded-[var(--radius-control)] border border-border px-4 font-semibold">
            {text.chrome.openReport}
          </button>
        </form>
      </nav>

      {report.kind === 'EMPTY' ? <p role="note">{text.empty}</p> : null}
      {report.kind === 'EN_REVISION' ? (
        <p role="note" className="font-semibold text-flag-incomplete">
          {text.inReview}
        </p>
      ) : null}

      {report.kind === 'READY' ? (
        <>
          <ReportChrome
            orderId={stub.id}
            mode={mode}
            lineId={lineId}
            stored={report.stored}
            final={!report.document.draft}
            storedLabel={
              report.stored ? text.chrome.stored(report.stored.byName, formatDate(report.stored.createdAt)) : null
            }
          />
          <ReportPaper doc={report.document} qr={report.document.verifyUrl ? qrModules(report.document.verifyUrl) : null} />
        </>
      ) : null}

      {deliveryView ? <DeliveryPanel orderId={stub.id} view={deliveryView} /> : null}
    </section>
  )
}
