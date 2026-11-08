import 'server-only'

import { databaseAuth } from '@/lib/server/settings'
import * as memory from '@/lib/server/session/store'
import type { StaffRole } from '@/types/auth/auth.types'
import type { StaffDirectoryRow } from '@/types/server/store.types'
import type { PasswordChangeResult, PublicAccount, SignInResult, StaffSession } from '@/types/session/session.types'

async function db() {
  return import('@/lib/db/repositories/staff-auth')
}

export async function verifyCredentials(
  username: string,
  password: string,
  address: string,
): Promise<{ result: SignInResult; account: PublicAccount | null; flood: boolean }> {
  if (!databaseAuth()) {
    const found = memory.verifyCredentials(username, password)
    return { ...found, flood: false }
  }
  return (await db()).verifyCredentials(username, password, address)
}

export async function getAccount(userId: string): Promise<PublicAccount | null> {
  if (!databaseAuth()) return memory.getAccount(userId)
  return (await db()).getAccount(userId)
}

export async function listDemoAccounts(): Promise<PublicAccount[]> {
  if (!databaseAuth()) return memory.listDemoAccounts()
  return (await db()).listAccounts()
}

export async function listStaffDirectory(): Promise<StaffDirectoryRow[]> {
  if (!databaseAuth()) return memory.listStaffDirectory()
  return (await db()).listStaffDirectory()
}

export async function activeAdminCount(): Promise<number> {
  if (!databaseAuth()) return memory.activeAdminCount()
  return (await db()).activeAdminCount()
}

export async function createSession(
  userId: string,
  workstation: string,
): Promise<{ session: StaffSession; replaced: StaffSession[] }> {
  if (!databaseAuth()) return memory.createSession(userId, workstation)
  return (await db()).createSession(userId, workstation)
}

export async function getSession(sessionId: string): Promise<StaffSession | null> {
  if (!databaseAuth()) return memory.getSession(sessionId)
  return (await db()).getSession(sessionId)
}

export async function endSession(sessionId: string): Promise<void> {
  if (!databaseAuth()) {
    memory.endSession(sessionId)
    return
  }
  await (await db()).endSession(sessionId)
}

export async function endUserSessions(userId: string): Promise<void> {
  if (!databaseAuth()) {
    memory.endUserSessions(userId)
    return
  }
  await (await db()).endUserSessions(userId)
}

export async function touchSession(session: StaffSession): Promise<void> {
  if (!databaseAuth()) {
    memory.touchSession(session)
    return
  }
  await (await db()).touchSession(session.id)
  session.lastSeenAt = Date.now()
}

export async function lockSession(session: StaffSession): Promise<void> {
  if (!databaseAuth()) {
    memory.lockSession(session)
    return
  }
  await (await db()).lockSession(session.id)
  session.locked = true
}

export async function rotateStepUp(sessionId: string): Promise<StaffSession | null> {
  if (!databaseAuth()) return null
  return (await db()).rotateStepUp(sessionId)
}

export async function changePassword(userId: string, current: string, next: string): Promise<PasswordChangeResult> {
  if (!databaseAuth()) return memory.changePassword(userId, current, next)
  return (await db()).changePassword(userId, current, next)
}

export async function createStaffAccount(
  displayName: string,
  roles: readonly StaffRole[],
): Promise<{ id: string; temporaryPassword: string } | null> {
  if (!databaseAuth()) return memory.createStaffAccount(displayName, roles)
  return (await db()).createStaffAccount(displayName, roles)
}

export async function setStaffActive(userId: string, active: boolean): Promise<boolean> {
  if (!databaseAuth()) return memory.setStaffActive(userId, active)
  return (await db()).setStaffActive(userId, active)
}

export async function replaceStaffRoles(userId: string, roles: readonly StaffRole[]): Promise<boolean> {
  if (!databaseAuth()) return memory.replaceStaffRoles(userId, roles)
  return (await db()).replaceStaffRoles(userId, roles)
}

export async function setStaffCover(userId: string, roles: readonly StaffRole[], until: string): Promise<boolean> {
  if (!databaseAuth()) return memory.setStaffCover(userId, roles, until)
  return (await db()).setStaffCover(userId, roles, until)
}

export async function grantStaffBioanalista(userId: string, license: string): Promise<boolean> {
  if (!databaseAuth()) return memory.grantStaffBioanalista(userId, license)
  return (await db()).grantStaffBioanalista(userId, license)
}

export async function resetStaffPassword(userId: string): Promise<string | null> {
  if (!databaseAuth()) return memory.resetStaffPassword(userId)
  return (await db()).resetStaffPassword(userId)
}
