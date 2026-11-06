import 'server-only'

import { decide } from '@/lib/auth/decide'
import { applyAggregatesOnly } from '@/lib/auth/scopes'
import { PRICE_COLUMNS } from '@/lib/config/price-defaults'
import { listAudit } from '@/lib/db/memory/audit-store'
import { searchClients } from '@/lib/db/memory/client-store'
import { allSavedOrders } from '@/lib/db/memory/order-store'
import { demoSeed } from '@/lib/db/memory/seed'
import { listInventoryMovements, listRegistry } from '@/lib/db/memory/registry-store'
import { listBackups, mailConfig } from '@/lib/db/memory/maintenance-store'
import { auditEvent } from '@/lib/server/audit'
import { auditMetrics, restaAging, unverifiedShare } from '@/lib/server/domain/audit-metrics'
import { isClinicalEvent } from '@/lib/server/domain/audit-catalog'
import { todayInLab } from '@/lib/server/domain/client-rules'
import { guardRoute, mayReach } from '@/lib/server/guard'
import { toDecisionSession } from '@/lib/server/session/current'
import { isStepUpFresh, listStaffDirectory } from '@/lib/server/session/store'
import { strings } from '@/lib/strings'
import { LAB_TIME_ZONE, formatDate, formatMoney, formatTime } from '@/lib/utils/format'
import type { PriceColumn } from '@/types/domain/demo.types'
import type { AuditListRow, PriceMatrixRow, RegistryKind } from '@/types/office/office.types'
import type { StaffContext } from '@/types/session/session.types'

const text = strings.pendingReview.office

function labDay(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: LAB_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso))
}

function priceText(value: string | null): string {
  return value === null ? strings.empty.noPrice : formatMoney(value)
}

export interface PriceFilters {
  currency: string
  status: string
  column: string
}

export async function getPriceScreen(context: StaffContext, filters: PriceFilters, editing: boolean) {
  const command = editing ? 'prices.edit' : 'prices.list'
  if (!(await guardRoute(context, [command], editing ? '/precios/editar' : '/precios'))) return { kind: 'BLOCKED' } as const
  const currency: 'USD' | 'BS' | null = filters.currency === 'USD' || filters.currency === 'BS' ? filters.currency : null
  if (!currency) return { kind: 'CURRENCY' } as const
  const focus = PRICE_COLUMNS.find((column) => column === filters.column) ?? null
  const rows: PriceMatrixRow[] = demoSeed.priceRows
    .filter((row) => filters.status !== 'NO_DISP' || row.status === 'NO_DISP')
    .map((row) => ({
      id: row.id,
      name: row.name,
      status: row.status,
      exception: filters.status === 'DISPONIBLE' && row.status === 'NO_DISP',
      prices: row.prices,
    }))
  return {
    kind: 'READY' as const,
    currency,
    focus,
    rows,
    editing,
    canPrint: mayReach(context, ['prices.list']),
  }
}

export function priceAmount(row: PriceMatrixRow, column: PriceColumn, currency: 'USD' | 'BS'): string {
  return priceText(currency === 'USD' ? row.prices[column].usd : row.prices[column].bs)
}

export async function getRegistryScreen(context: StaffContext, kind: RegistryKind, command: string, route: string) {
  if (!(await guardRoute(context, [command], route))) return { kind: 'BLOCKED' } as const
  const session = toDecisionSession(context)
  const canEdit = decide({ session, command, mode: 'write' }).allowed
  return { kind: 'READY' as const, rows: listRegistry(kind, true), canEdit, titular: kind === 'companies' }
}

export function inventoryScreen() {
  return {
    reagents: listRegistry('reagents', false),
    movements: listInventoryMovements(),
  }
}

export function mailScreen() {
  return mailConfig()
}

export function backupScreen() {
  return listBackups().map((row) => ({ ...row, atText: `${formatDate(row.at)} ${formatTime(row.at)}` }))
}

export function userScreen() {
  return listStaffDirectory()
}

export interface AuditFilters {
  from: string
  to: string
  event: string
  userId: string
  severity: string
  outcome: string
  recordId: string
}

function within(day: string, filters: AuditFilters): boolean {
  if (filters.from && day < filters.from) return false
  if (filters.to && day > filters.to) return false
  return true
}

export async function getAuditScreen(context: StaffContext, filters: AuditFilters) {
  const session = toDecisionSession(context)
  const all = decide({ session, command: 'audit.read_all', mode: 'read' })
  const clinical = decide({ session, command: 'audit.read_clinical', mode: 'read' })
  if (!all.allowed && !clinical.allowed) {
    await guardRoute(context, ['audit.read_all', 'audit.read_clinical'], '/auditoria')
    return { kind: 'BLOCKED' } as const
  }
  const mask = all.allowed && all.scope === 'clinical_text_masked'
  const rows: AuditListRow[] = listAudit()
    .filter((row) => (all.allowed ? true : isClinicalEvent(row.what.event)))
    .filter((row) => within(labDay(row.when.serverTime), filters))
    .filter((row) => (filters.event ? row.what.event === filters.event : true))
    .filter((row) => (filters.userId ? row.who.userId === filters.userId : true))
    .filter((row) => (filters.severity ? row.severity === filters.severity : true))
    .filter((row) => (filters.outcome ? row.result.outcome === filters.outcome : true))
    .filter((row) => (filters.recordId ? row.what.recordId === filters.recordId : true))
    .sort((left, right) => right.sequence - left.sequence)
    .map((row) => {
      const hide = mask && isClinicalEvent(row.what.event)
      return {
        id: row.id,
        sequence: row.sequence,
        atText: `${formatDate(row.when.serverTime)} ${formatTime(row.when.serverTime)}`,
        event: row.what.event,
        user: row.who.displayName ?? strings.empty.dash,
        record: row.what.recordId ?? strings.empty.dash,
        outcome: row.result.outcome,
        motivo: hide ? text.auditMasked : (row.why.motivo ?? strings.empty.dash),
        severity: row.severity,
        detail: hide ? text.auditMasked : row.change === null ? strings.empty.dash : JSON.stringify({ before: row.change.before, after: row.change.after }),
      }
    })

  await auditEvent({
    command: 'report.view',
    outcome: 'ALLOWED',
    session: context.session,
    account: context.account,
    recordType: 'audit',
    recordId: 'auditoria',
    change: { before: null, after: { from: filters.from, to: filters.to } },
  })
  return { kind: 'READY' as const, rows, users: listStaffDirectory().map((person) => ({ id: person.id, displayName: person.displayName })) }
}

function minutes(ms: number | null): string {
  if (ms === null) return strings.empty.dash
  return `${(ms / 60_000).toFixed(1).replace('.', ',')} min`
}

function days(ms: number | null): string {
  if (ms === null) return strings.empty.dash
  return `${(ms / 86_400_000).toFixed(1).replace('.', ',')} d`
}

export async function getStatistics(context: StaffContext, filters: AuditFilters) {
  const session = toDecisionSession(context)
  const decision = decide({ session, command: 'report.statistics', mode: 'read' })
  if (!decision.allowed) return { kind: 'BLOCKED' } as const
  const rows = listAudit().filter((row) => within(labDay(row.when.serverTime), filters))
  const metrics = auditMetrics(rows)
  const resta = restaAging(allSavedOrders())
  const share = unverifiedShare(searchClients({ text: '', includeInactive: false }))
  const refusalGroups = metrics.refusals.map((group) => ({ label: `${group.role} ${group.command}`, count: group.count }))
  const portalGroups = metrics.portalFailures.map((group) => ({ label: group.address, count: group.count }))
  const deliveryGroups = metrics.deliveryFailures.map((group) => ({ label: group.channel, count: group.count }))
  const shownRefusals =
    decision.scope === 'aggregates_only' ? applyAggregatesOnly(refusalGroups) : { groups: refusalGroups, suppressedGroups: 0 }
  const shownPortal =
    decision.scope === 'aggregates_only' ? applyAggregatesOnly(portalGroups) : { groups: portalGroups, suppressedGroups: 0 }
  const shownDelivery =
    decision.scope === 'aggregates_only' ? applyAggregatesOnly(deliveryGroups) : { groups: deliveryGroups, suppressedGroups: 0 }
  await auditEvent({
    command: 'report.view',
    outcome: 'ALLOWED',
    session: context.session,
    account: context.account,
    recordType: 'report',
    recordId: 'estadisticas',
  })
  const unverifiedLabel =
    share.activeCount === 0 ? strings.empty.dash : `${share.unverifiedCount} / ${share.activeCount}`
  return {
    kind: 'READY' as const,
    lines: [
      [text.statsIntake, String(metrics.intake)],
      [text.statsTurnaround, minutes(metrics.turnaround.medianMs)],
      [text.statsFirstResult, minutes(metrics.timeToFirstResult.medianMs)],
      [text.statsRelease, minutes(metrics.releaseWait.medianMs)],
      [text.statsDelivery, minutes(metrics.deliveryLag.medianMs)],
      [text.statsPortal, minutes(metrics.portalUptake.medianMs)],
      [text.statsCorrection, minutes(metrics.correctionTime.medianMs)],
      [text.statsResend, minutes(metrics.resendLag.medianMs)],
      [text.statsResendOverTwoDays, String(metrics.resendLagOverTwoDays)],
      [text.statsAdminQueue, minutes(metrics.adminQueue.medianMs)],
      [text.statsControlWait, minutes(metrics.controlWait.medianMs)],
      [text.statsDiscounts, String(metrics.discounts)],
      [text.statsOverrides, String(metrics.priceColumnOverrides)],
      [text.statsStepUpFailures, String(metrics.stepUpFailures)],
      [text.statsSelfEntered, String(metrics.selfEnteredReleases)],
      [text.statsConflicts, String(metrics.analyzerConflicts)],
      [text.statsRateWarnings, String(metrics.rateWarnings)],
      [text.statsSimilarConfirms, String(metrics.similarNameConfirms)],
      [text.statsSimilarRefusals, String(metrics.similarNameRefusals)],
      [text.statsUnverifiedShare, unverifiedLabel],
      [text.statsSameDayWarns, String(metrics.sameDayExamWarns)],
      [text.statsResendBacklog, String(metrics.openResendBacklog)],
      [text.statsConsentRefusals, String(metrics.consentRefusals)],
      [text.statsCorrectionsAfterDelivery, String(metrics.correctionsAfterDelivery)],
      [text.statsRestaOpen, String(resta.openCount)],
      [text.statsRestaAge, days(resta.medianAgeMs)],
      [text.statsReversals, String(metrics.sameUserReversals)],
    ] as const,
    refusals: shownRefusals.groups,
    portalFailures: shownPortal.groups,
    deliveryFailures: shownDelivery.groups,
    suppressed: shownRefusals.suppressedGroups + shownPortal.suppressedGroups + shownDelivery.suppressedGroups,
  }
}

export function defaultAuditFilters(search: {
  from?: string
  to?: string
  event?: string
  user?: string
  severity?: string
  outcome?: string
  record?: string
}): AuditFilters {
  const today = todayInLab()
  return {
    from: search.from || today,
    to: search.to || today,
    event: search.event ?? '',
    userId: search.user ?? '',
    severity: search.severity ?? '',
    outcome: search.outcome ?? '',
    recordId: search.record ?? '',
  }
}

export function salariesLocked(context: StaffContext): boolean {
  return !isStepUpFresh(context.session)
}
