import type { AuditSeverity } from '@/types/audit/audit.types'

/**
 * The business event when the permission command uses another word.
 * `order.save` is Guardar, and the audit page names that moment `order.open`.
 */
const EVENT_BY_COMMAND: Readonly<Record<string, string>> = {
  'order.save': 'order.open',
  'order.discount': 'order.line.change.discount',
  'client.create': 'patient.save',
  'client.update': 'patient.save',
  'client.deactivate': 'patient.deactivate',
  'client.reactivate': 'patient.reactivate',
  'client.delete': 'patient.delete',
  'client.merge': 'patient.merge',
  'client.unmerge': 'patient.unmerge',
  'rate.set': 'rate.change',
  'prices.edit': 'price.change',
  'prices.general_increase': 'price.change',
  'mail.config': 'mail.config.change',
}

const SEVERITY_BY_EVENT: Readonly<Record<string, AuditSeverity>> = {
  'password.change': 'NOTICE',
  'password.reset': 'NOTICE',
  'session.enter.failed': 'WARNING',
  'access.denied': 'WARNING',
  'step_up.failed': 'CRITICAL',
  'user.create': 'NOTICE',
  'user.disable': 'NOTICE',
  'user.role.change': 'NOTICE',
  'user.grant.temporary': 'NOTICE',
  'role.grant_bioanalista': 'NOTICE',
  'patient.deactivate': 'NOTICE',
  'patient.reactivate': 'NOTICE',
  'patient.delete': 'NOTICE',
  'patient.merge': 'NOTICE',
  'patient.unmerge': 'NOTICE',
  'order.line.change.discount': 'NOTICE',
  'order.price_column.override': 'NOTICE',
  'order.rate.warn': 'WARNING',
  'order.void': 'NOTICE',
  'bacteriology.note.add': 'NOTICE',
  'result.conflict': 'NOTICE',
  'result.release': 'NOTICE',
  'result.correct.open': 'NOTICE',
  'result.correct.cancel': 'NOTICE',
  'result.correct.release': 'NOTICE',
  'report.issue': 'NOTICE',
  'report.pdf': 'NOTICE',
  'report.superseded': 'NOTICE',
  'delivery.whatsapp': 'NOTICE',
  'delivery.email': 'NOTICE',
  'delivery.incomplete.approved': 'NOTICE',
  'delivery.resend.task': 'NOTICE',
  'portal.login.failed': 'WARNING',
  'portal.code.failed': 'WARNING',
  'verify.file.read': 'NOTICE',
  'payment.reverse': 'NOTICE',
  'cash.close': 'NOTICE',
  'cash.reopen': 'NOTICE',
  'month.close': 'NOTICE',
  'note.issue': 'NOTICE',
  'document.reprint': 'NOTICE',
  'control.assign': 'NOTICE',
  'rate.change': 'NOTICE',
  'price.change': 'NOTICE',
  'price.print': 'NOTICE',
  'setting.qr.change': 'NOTICE',
  'setting.saturday.change': 'NOTICE',
  'mail.config.change': 'NOTICE',
  'policy.publish': 'NOTICE',
  'backup.run': 'NOTICE',
  'backup.restore': 'CRITICAL',
  'audit.verify.failed': 'CRITICAL',
  'audit.write.failed': 'CRITICAL',
  'system.start': 'NOTICE',
  'system.stop': 'NOTICE',
  'data.import': 'CRITICAL',
}

const CLINICAL_EXACT = new Set([
  'report.issue',
  'report.pdf',
  'report.superseded',
  'bacteriology.note.add',
  'verify.file.read',
  'report.patient_evolution',
  'order.line.remove',
])

export function eventFor(command: string, explicit?: string): string {
  return explicit ?? EVENT_BY_COMMAND[command] ?? command
}

export function severityFor(event: string): AuditSeverity {
  return SEVERITY_BY_EVENT[event] ?? 'INFO'
}

/** Clinical events carry a result or a report. Administración sees them masked. */
export function isClinicalEvent(event: string): boolean {
  return event.startsWith('result.') || CLINICAL_EXACT.has(event)
}

/** A motivo is its own field. Control characters are removed so typed text cannot forge a row. */
export function cleanMotivo(value: string | null | undefined): string | null {
  if (!value) return null
  const cleaned = value.replace(/[\u0000-\u001F\u007F]/g, '').slice(0, 500)
  return cleaned === '' ? null : cleaned
}
