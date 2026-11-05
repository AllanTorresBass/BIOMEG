import 'server-only'

import { addBackup, saveMailAccount } from '@/lib/db/memory/maintenance-store'
import { record } from '@/lib/server/draft-gate'
import { officeAllow, officeContext, officeDone, officeFail } from '@/lib/server/office-gate'
import { strings } from '@/lib/strings'
import type { OfficeResult } from '@/types/office/office.types'
import type { MailInput } from '@/types/office/office.schemas'
import type { Presented } from '@/types/server/draft-gate.types'

const text = strings.pendingReview.office

function presentedOf(input: { confirmed?: boolean; motivo?: string }): Presented {
  return { confirmed: input.confirmed === true, ...(input.motivo === undefined ? {} : { motivo: input.motivo }) }
}

export async function saveMail(input: MailInput): Promise<OfficeResult> {
  const context = await officeContext()
  if (!context) return officeFail(text.notAllowed)
  if (input.secret.trim() === '') return officeFail(text.mailSecretMissing)
  const target = { recordType: 'mail', recordId: 'laboratory', state: null }
  const allowed = await officeAllow(context, 'mail.config', {}, presentedOf(input), target)
  if ('need' in allowed) return allowed
  saveMailAccount(input.account)
  await record({ context }, 'mail.config', allowed.rowId, { before: null, after: { account: input.account.trim() }, field: 'account' }, undefined, target)
  return officeDone(text.mailDone)
}

export async function runBackup(input: { confirmed?: boolean; motivo?: string }): Promise<OfficeResult> {
  const context = await officeContext()
  if (!context) return officeFail(text.notAllowed)
  const target = { recordType: 'backup', recordId: 'laboratory', state: null }
  const allowed = await officeAllow(context, 'backup.run', {}, presentedOf(input), target)
  if ('need' in allowed) return allowed
  const at = new Date().toISOString()
  addBackup(at, context.account.displayName)
  await record({ context }, 'backup.run', allowed.rowId, { before: null, after: { at }, field: 'backup' }, undefined, target)
  return officeDone(text.backupDone)
}
