import 'server-only'

type MaintenanceState = {
  account: string
  secretSet: boolean
  backups: { at: string; byName: string }[]
}

const globalStore = globalThis as typeof globalThis & { __biomegMaintenance?: MaintenanceState }

function state(): MaintenanceState {
  return (globalStore.__biomegMaintenance ??= { account: '', secretSet: false, backups: [] })
}

/** The secret is never stored. Only the fact that one was written, and the account name. */

export function mailConfig(): { account: string; secretSet: boolean } {
  const current = state()
  return { account: current.account, secretSet: current.secretSet }
}

export function saveMailAccount(account: string): void {
  const current = state()
  current.account = account.trim().slice(0, 120)
  current.secretSet = true
}

export function listBackups(): readonly { at: string; byName: string }[] {
  return state().backups
}

export function addBackup(at: string, byName: string): void {
  state().backups.push({ at, byName })
}

export function resetMaintenanceForTests(): void {
  const current = state()
  current.account = ''
  current.secretSet = false
  current.backups.length = 0
}
