import 'server-only'

import { record } from '@/lib/server/draft-gate'
import { officeAllow, officeContext, officeDone, officeFail } from '@/lib/server/office-gate'
import {
  activeAdminCount,
  createStaffAccount,
  endUserSessions,
  grantStaffBioanalista,
  listStaffDirectory,
  replaceStaffRoles,
  resetStaffPassword,
  setStaffActive,
  setStaffCover,
} from '@/lib/server/session/accounts'
import { strings } from '@/lib/strings'
import type { StaffRole } from '@/types/auth/auth.types'
import type { OfficeResult } from '@/types/office/office.types'
import type { CoverInput, CreateUserInput, GrantBioanalistaInput, ReplaceRolesInput, UserIdInput } from '@/types/office/office.schemas'
import type { Presented } from '@/types/server/draft-gate.types'

const text = strings.pendingReview.office

function presentedOf(input: { confirmed?: boolean; motivo?: string }): Presented {
  return { confirmed: input.confirmed === true, ...(input.motivo === undefined ? {} : { motivo: input.motivo }) }
}

function target(userId: string) {
  return { recordType: 'user', recordId: userId, state: null }
}

async function isLastAdmin(roles: readonly StaffRole[]): Promise<boolean> {
  return roles.includes('ADMINISTRACION') && (await activeAdminCount()) === 1
}

export async function createUser(input: CreateUserInput): Promise<OfficeResult> {
  const context = await officeContext()
  if (!context) return officeFail(text.notAllowed)
  const allowed = await officeAllow(
    context,
    'user.create',
    { grants_bioanalista: input.roles.includes('BIOANALISTA') },
    presentedOf(input),
    target('new'),
  )
  if ('need' in allowed) return allowed
  const created = await createStaffAccount(input.displayName, input.roles)
  if (!created) return officeFail(text.userBioanalista)
  await record(
    { context },
    'user.create',
    allowed.rowId,
    { before: null, after: { id: created.id, roles: input.roles }, field: 'roles' },
    undefined,
    target(created.id),
  )
  return officeDone(`${text.userCreated} ${text.userTemporary(created.temporaryPassword)}`)
}

export async function disableUser(input: UserIdInput): Promise<OfficeResult> {
  const context = await officeContext()
  if (!context) return officeFail(text.notAllowed)
  const person = (await listStaffDirectory()).find((row) => row.id === input.userId)
  if (!person) return officeFail(text.missing)
  const allowed = await officeAllow(
    context,
    'user.disable',
    { is_self: input.userId === context.account.id, is_last_admin: await isLastAdmin(person.roles) },
    presentedOf(input),
    target(person.id),
  )
  if ('need' in allowed) return allowed
  if (!(await setStaffActive(person.id, false))) return officeFail(text.missing)
  await endUserSessions(person.id)
  await record({ context }, 'user.disable', allowed.rowId, { before: true, after: false, field: 'active' }, undefined, target(person.id))
  return officeDone(text.userDisabled)
}

export async function changeUserRoles(input: ReplaceRolesInput): Promise<OfficeResult> {
  const context = await officeContext()
  if (!context) return officeFail(text.notAllowed)
  const person = (await listStaffDirectory()).find((row) => row.id === input.userId)
  if (!person) return officeFail(text.missing)
  const removesLastAdmin =
    person.roles.includes('ADMINISTRACION') && !input.roles.includes('ADMINISTRACION') && (await activeAdminCount()) === 1
  const allowed = await officeAllow(
    context,
    'user.role.change',
    {
      is_self: input.userId === context.account.id,
      is_last_admin: removesLastAdmin,
      grants_bioanalista: input.roles.includes('BIOANALISTA'),
    },
    presentedOf(input),
    target(person.id),
  )
  if ('need' in allowed) return allowed
  if (!(await replaceStaffRoles(person.id, input.roles))) return officeFail(text.userBioanalista)
  await record(
    { context },
    'user.role.change',
    allowed.rowId,
    { before: person.roles, after: input.roles, field: 'roles' },
    undefined,
    target(person.id),
  )
  return officeDone(text.userRolesDone)
}

export async function grantCover(input: CoverInput): Promise<OfficeResult> {
  const context = await officeContext()
  if (!context) return officeFail(text.notAllowed)
  const allowed = await officeAllow(
    context,
    'user.grant.temporary',
    {
      is_self: input.userId === context.account.id,
      has_end_date: /^\d{4}-\d{2}-\d{2}$/.test(input.until),
      grants_bioanalista: input.roles.includes('BIOANALISTA'),
    },
    presentedOf(input),
    target(input.userId),
  )
  if ('need' in allowed) return allowed
  if (!(await setStaffCover(input.userId, input.roles, input.until))) return officeFail(text.userBioanalista)
  await record(
    { context },
    'user.grant.temporary',
    allowed.rowId,
    { before: null, after: { roles: input.roles, until: input.until }, field: 'cover' },
    input.motivo,
    target(input.userId),
  )
  return officeDone(text.userCoverDone)
}

export async function grantBioanalista(input: GrantBioanalistaInput): Promise<OfficeResult> {
  const context = await officeContext()
  if (!context) return officeFail(text.notAllowed)
  const allowed = await officeAllow(
    context,
    'role.grant_bioanalista',
    { is_self: input.userId === context.account.id, license_present: input.license.trim() !== '' },
    presentedOf(input),
    target(input.userId),
  )
  if ('need' in allowed) return allowed
  if (!(await grantStaffBioanalista(input.userId, input.license))) return officeFail(text.missing)
  await record(
    { context },
    'role.grant_bioanalista',
    allowed.rowId,
    { before: null, after: { licensePresent: true }, field: 'license' },
    undefined,
    target(input.userId),
  )
  return officeDone(text.userGrantDone)
}

export async function resetUserPassword(input: UserIdInput): Promise<OfficeResult> {
  const context = await officeContext()
  if (!context) return officeFail(text.notAllowed)
  const allowed = await officeAllow(
    context,
    'password.reset',
    { is_self: input.userId === context.account.id },
    presentedOf(input),
    target(input.userId),
  )
  if ('need' in allowed) return allowed
  const password = await resetStaffPassword(input.userId)
  if (!password) return officeFail(text.missing)
  await record({ context }, 'password.reset', allowed.rowId, { before: null, after: { reset: true }, field: 'password' }, undefined, target(input.userId))
  return officeDone(text.userTemporary(password))
}
