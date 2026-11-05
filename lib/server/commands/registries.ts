import 'server-only'

import { addInventoryMovement, findRegistry, saveRegistry } from '@/lib/db/memory/registry-store'
import { record } from '@/lib/server/draft-gate'
import { officeAllow, officeContext, officeDone, officeFail } from '@/lib/server/office-gate'
import { strings } from '@/lib/strings'
import { REGISTRY_COMMAND, type OfficeResult, type RegistryKind } from '@/types/office/office.types'
import type { InventoryInput, RegistrySaveInput } from '@/types/office/office.schemas'
import type { Presented } from '@/types/server/draft-gate.types'

const text = strings.pendingReview.office

function presentedOf(input: { confirmed?: boolean; motivo?: string }): Presented {
  return { confirmed: input.confirmed === true, ...(input.motivo === undefined ? {} : { motivo: input.motivo }) }
}

export async function saveRegistryRow(input: RegistrySaveInput): Promise<OfficeResult> {
  const context = await officeContext()
  if (!context) return officeFail(text.notAllowed)
  const kind = input.kind as RegistryKind
  const command = REGISTRY_COMMAND[kind]
  const target = { recordType: 'registry', recordId: input.id ?? kind, state: null }
  const allowed = await officeAllow(context, command, {}, {}, target)
  if ('need' in allowed) return allowed
  if (input.name.trim() === '') return officeFail(text.missing)
  const saved = saveRegistry({ ...input, kind, now: new Date().toISOString() })
  if (!saved.ok) return officeFail(saved.reason === 'DUPLICATE' ? text.duplicate : text.missing)
  await record(
    { context },
    saved.created ? 'registry.create' : 'registry.update',
    allowed.rowId,
    { before: input.id, after: { id: saved.row.id, name: saved.row.name, active: saved.row.active }, field: kind },
    undefined,
    { ...target, recordId: saved.row.id },
  )
  return officeDone(text.saved)
}

export async function deductInventory(input: InventoryInput): Promise<OfficeResult> {
  const context = await officeContext()
  if (!context) return officeFail(text.notAllowed)
  const reagent = findRegistry('reagents', input.reagentId)
  if (!reagent || !reagent.active) return officeFail(text.missing)
  if (input.quantity.trim() === '') return officeFail(text.inventoryInvalid)
  const target = { recordType: 'inventory', recordId: reagent.id, state: null }
  const allowed = await officeAllow(context, 'inventory.deduct', {}, presentedOf(input), target)
  if ('need' in allowed) return allowed
  const at = new Date().toISOString()
  addInventoryMovement(reagent.id, input.quantity.trim().slice(0, 40), at, context.account.displayName)
  await record({ context }, 'inventory.deduct', allowed.rowId, { before: null, after: { quantity: input.quantity.trim() }, field: 'quantity' }, undefined, target)
  return officeDone(text.inventoryDone)
}
