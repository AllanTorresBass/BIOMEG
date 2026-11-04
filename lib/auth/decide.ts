import 'server-only'

import type {
  Condition,
  DecideInput,
  Decision,
  DecisionReason,
  Gesture,
  Grant,
  PermissionRow,
  RefusalReason,
  Relation,
  Role,
} from '@/types/auth/auth.types'
import { isStaffRole, ALL_ROLES } from '@/lib/auth/roles'
import { PERMISSION_ROWS, TABLE_VERSION } from '@/lib/auth/table'

const rowsByCommand = new Map<string, PermissionRow[]>()
for (const row of PERMISSION_ROWS) {
  for (const command of row.commands) {
    const rows = rowsByCommand.get(command) ?? []
    rows.push(row)
    rowsByCommand.set(command, rows)
  }
}

const GESTURE_RANK: Record<Gesture, number> = { NONE: 0, CONFIRM: 1, STEP_UP: 2 }

type Match = 'match' | 'nomatch' | 'unknown'

/** A fact must be a real boolean or string. 1 is not true, and a missing fact is unknown. */
function evaluate(conditions: readonly Condition[], facts: Readonly<Record<string, unknown>>): Match {
  let unknown = false
  for (const condition of conditions) {
    const value = facts[condition.fact]
    if ('is' in condition) {
      if (typeof value !== 'boolean') {
        unknown = true
      } else if (value !== condition.is) {
        return 'nomatch'
      }
    } else if (typeof value !== 'string') {
      unknown = true
    } else if (!condition.oneOf.includes(value)) {
      return 'nomatch'
    }
  }
  return unknown ? 'unknown' : 'match'
}

function relationHolds(relation: Relation, input: DecideInput): boolean {
  const { session, record } = input
  switch (relation) {
    case 'own':
      return Boolean(record?.ownerUserId) && record?.ownerUserId === session.userId
    case 'client':
      return Boolean(record?.clientId) && Boolean(session.clientId) && record?.clientId === session.clientId
    case 'token':
      return record?.tokenMatches === true
  }
}

function refuse(reason: RefusalReason, rowId: string | null = null, extra: Partial<Decision> = {}): Decision {
  return {
    allowed: false,
    reason,
    rowId,
    gesture: 'NONE',
    motivoRequired: false,
    scope: null,
    tableVersion: TABLE_VERSION,
    ...extra,
  }
}

/** Furthest check reached, in the order ROLE, STATE, OWNERSHIP. */
const FAILURE_RANK: Record<'ROLE' | 'STATE' | 'OWNERSHIP', number> = { ROLE: 0, STATE: 1, OWNERSHIP: 2 }

function hasValidRoles(roles: readonly Role[]): boolean {
  if (roles.length === 0) return false
  if (!roles.every((role) => ALL_ROLES.includes(role))) return false
  if (roles.every(isStaffRole)) return true
  // A client, public, or system role stands alone.
  return roles.length === 1
}

/** True when any of the person's roles holds a grant on any row of the command. Used by menus. */
export function roleMayReachCommand(roles: readonly Role[], command: string): boolean {
  const rows = rowsByCommand.get(command)
  if (!rows) return false
  return rows.some((row) => roles.some((role) => row.grants[role] !== undefined))
}

export function isKnownCommand(command: string): boolean {
  return rowsByCommand.has(command)
}

export function decide(input: DecideInput): Decision {
  const { session, command } = input
  const gestures = input.gestures ?? {}

  // 1. Session
  if (!session.valid || !session.active || !session.userId || !hasValidRoles(session.roles)) {
    return refuse('SESSION')
  }

  // 2. Command
  const rows = rowsByCommand.get(command)
  if (!rows) return refuse('UNKNOWN_COMMAND')

  // 3. Role
  const holdsAnyGrant = rows.some((row) => session.roles.some((role) => row.grants[role] !== undefined))
  if (!holdsAnyGrant) {
    return refuse(rows.some((row) => row.blocked) ? 'BLOCKED' : 'ROLE')
  }

  // $own is computed here from the record. A caller cannot supply it.
  const ownerKnown = Boolean(input.record?.ownerUserId)
  const facts: Record<string, unknown> = { ...input.facts }
  delete facts['$own']
  if (ownerKnown) facts['$own'] = input.record?.ownerUserId === session.userId

  // 4. Row
  let applied: PermissionRow | null = null
  for (const row of rows) {
    const heldHere = session.roles.some((role) => row.grants[role] !== undefined)
    const match = evaluate(row.when, facts)
    if (match === 'nomatch') continue
    if (match === 'unknown') {
      // A row this person holds nothing on cannot change their answer.
      if (heldHere) return refuse('STATE', row.id)
      continue
    }
    applied = row
    break
  }
  if (!applied) return refuse('STATE')
  if (applied.blocked) return refuse('BLOCKED', applied.id)

  // 5. Grant
  const candidates = session.roles.filter((role) => applied.grants[role] !== undefined)
  if (candidates.length === 0) {
    return refuse(applied.ownDependent ? 'OWNERSHIP' : 'STATE', applied.id)
  }

  const mode = input.mode ?? (applied.kind === 'read' ? 'read' : 'write')
  const eligible: Grant[] = []
  let furthest: 'ROLE' | 'STATE' | 'OWNERSHIP' = 'ROLE'
  const note = (failure: 'ROLE' | 'STATE' | 'OWNERSHIP') => {
    if (FAILURE_RANK[failure] > FAILURE_RANK[furthest]) furthest = failure
  }

  for (const role of candidates) {
    const roleGrant = applied.grants[role] as Grant
    if (roleGrant.read && mode === 'write') {
      note('ROLE')
      continue
    }
    if (roleGrant.when && evaluate(roleGrant.when, facts) !== 'match') {
      note('STATE')
      continue
    }
    if (roleGrant.relation && !relationHolds(roleGrant.relation, input)) {
      note('OWNERSHIP')
      continue
    }
    eligible.push(roleGrant)
  }
  if (eligible.length === 0) return refuse(furthest, applied.id)

  // 6. Gesture: the lightest applies, and among equals the one without a motivo.
  const [chosen] = [...eligible].sort(
    (a, b) => GESTURE_RANK[a.gesture] - GESTURE_RANK[b.gesture] || Number(Boolean(a.motivo)) - Number(Boolean(b.motivo)),
  )
  if (!chosen) return refuse(furthest, applied.id)
  const motivoRequired = Boolean(chosen.motivo)
  const presented = gestures.stepUpVerified === true ? 2 : gestures.confirmVerified === true ? 1 : 0
  const base = { gesture: chosen.gesture, motivoRequired, scope: chosen.scope ?? null }

  if (GESTURE_RANK[chosen.gesture] > presented) {
    return refuse(chosen.gesture === 'STEP_UP' ? 'STEP_UP' : 'CONFIRM', applied.id, base)
  }
  if (motivoRequired && !(typeof gestures.motivo === 'string' && gestures.motivo.trim() !== '')) {
    return refuse('MOTIVO_REQUIRED', applied.id, base)
  }

  const reason: DecisionReason = 'OK'
  return { allowed: true, reason, rowId: applied.id, tableVersion: TABLE_VERSION, ...base }
}
