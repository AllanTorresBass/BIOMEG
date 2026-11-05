import { describe, expect, it } from 'vitest'

import { decide } from '@/lib/auth/decide'
import type { DecideInput, Decision, Role } from '@/types/auth/auth.types'

const REC: Role = 'RECEPCION'
const AUX: Role = 'AUXILIAR'
const BIO: Role = 'BIOANALISTA'
const ADM: Role = 'ADMINISTRACION'

function run(roles: Role[], command: string, rest: Partial<DecideInput> = {}): Decision {
  return decide({
    session: { valid: true, active: true, userId: 'u1', roles, clientId: 'c1', ...rest.session },
    command,
    facts: rest.facts,
    record: rest.record,
    gestures: rest.gestures,
    mode: rest.mode,
  })
}

const STEP_UP_OK = { stepUpVerified: true }
const CONFIRM_OK = { confirmVerified: true }

describe('decide: required cases from V0-03', () => {
  it('Auxiliar cannot release a result (E-36)', () => {
    expect(run([AUX], 'result.release', { facts: { state: 'CARGADO' } }).reason).toBe('ROLE')
  })

  it('Bioanalista needs a re-entry to release', () => {
    expect(run([BIO], 'result.release', { facts: { state: 'CARGADO' } }).reason).toBe('STEP_UP')
  })

  it('Bioanalista cannot release a result already released', () => {
    expect(run([BIO], 'result.release', { facts: { state: 'LIBERADO' }, gestures: STEP_UP_OK }).reason).toBe('STATE')
  })

  it('Recepción cannot merge', () => {
    expect(run([REC], 'client.merge', { facts: { both_complete_and_different: false } }).reason).toBe('ROLE')
  })

  it('Administración cannot merge two complete, different cédulas (E-17)', () => {
    expect(run([ADM], 'client.merge', { facts: { both_complete_and_different: true }, gestures: STEP_UP_OK }).reason).toBe('STATE')
  })

  it('a fact that is the number 1 is not true', () => {
    expect(run([ADM], 'client.merge', { facts: { both_complete_and_different: 1 }, gestures: STEP_UP_OK }).reason).toBe('STATE')
  })

  it('Administración merge needs a re-entry', () => {
    expect(run([ADM], 'client.merge', { facts: { both_complete_and_different: false } }).reason).toBe('STEP_UP')
  })

  it('values.modify and client.transfer are blocked', () => {
    expect(run([REC], 'values.modify').reason).toBe('BLOCKED')
    expect(run([REC], 'client.transfer').reason).toBe('BLOCKED')
    expect(run([ADM], 'client.transfer').reason).toBe('BLOCKED')
  })

  it('Recepción sets the rate only when today has none', () => {
    expect(run([REC], 'rate.set', { facts: { rate_today_exists: true } }).reason).toBe('STATE')
    expect(run([REC], 'rate.set', { facts: { rate_today_exists: false } }).allowed).toBe(true)
  })

  it('payment.reverse by Recepción needs the same day and ownership', () => {
    const gestures = { confirmVerified: true, motivo: 'Error de monto' }
    expect(
      run([REC], 'payment.reverse', { facts: { same_day: true }, record: { ownerUserId: 'u2' }, gestures }).reason,
    ).toBe('OWNERSHIP')
    expect(
      run([REC], 'payment.reverse', { facts: { same_day: false }, record: { ownerUserId: 'u1' }, gestures }).reason,
    ).toBe('STATE')
  })

  it('a person holding both roles uses the lightest gesture', () => {
    const decision = run([REC, ADM], 'payment.reverse', {
      facts: { same_day: true },
      record: { ownerUserId: 'u1' },
      gestures: { confirmVerified: true, motivo: 'Error de monto' },
    })
    expect(decision.allowed).toBe(true)
    expect(decision.gesture).toBe('CONFIRM')
  })

  describe('order.void', () => {
    it('refuses Recepción when a result is released', () => {
      expect(run([REC], 'order.void', { facts: { has_released_result: true } }).reason).toBe('STATE')
    })

    it('refuses Recepción when a payment exists', () => {
      expect(run([REC], 'order.void', { facts: { has_payment: true } }).reason).toBe('STATE')
    })

    it('asks for a motivo when it is blank', () => {
      const facts = { has_released_result: false, has_payment: false, has_result: false }
      expect(run([REC], 'order.void', { facts, gestures: { ...CONFIRM_OK, motivo: '   ' } }).reason).toBe('MOTIVO_REQUIRED')
      expect(run([REC], 'order.void', { facts, gestures: { ...CONFIRM_OK, motivo: 'Pedido por error' } }).allowed).toBe(true)
    })

    it('sends unreleased results with no payment to Administración only', () => {
      const facts = { has_released_result: false, has_payment: false, has_result: true }
      expect(run([REC], 'order.void', { facts }).reason).toBe('STATE')
      expect(run([ADM], 'order.void', { facts, gestures: { ...STEP_UP_OK, motivo: 'Duplicada' } }).rowId).toBe('R-034')
    })
  })

  it('Administración cannot read released clinical values', () => {
    expect(run([ADM], 'result.read', { facts: { state: 'LIBERADO' } }).reason).toBe('ROLE')
  })

  it('Recepción reads the worklist with status only', () => {
    const decision = run([REC], 'worklist.read')
    expect(decision.allowed).toBe(true)
    expect(decision.scope).toBe('status_only')
  })

  describe('portal.grid.read', () => {
    const facts = { state: 'INCOMPLETO', section_released: true }

    it('allows the own client with the partial scope', () => {
      const decision = run(['CLIENTE'], 'portal.grid.read', { facts, record: { clientId: 'c1' } })
      expect(decision.allowed).toBe(true)
      expect(decision.scope).toBe('released_sections_labeled_partial')
    })

    it('refuses another client', () => {
      expect(run(['CLIENTE'], 'portal.grid.read', { facts, record: { clientId: 'c2' } }).reason).toBe('OWNERSHIP')
    })

    it('refuses when the section is not released', () => {
      const unreleased = { state: 'INCOMPLETO', section_released: false }
      expect(run(['CLIENTE'], 'portal.grid.read', { facts: unreleased, record: { clientId: 'c1' } }).reason).toBe('STATE')
    })
  })

  it('a re-entry alone satisfies a confirm', () => {
    expect(run([ADM], 'inventory.deduct', { gestures: STEP_UP_OK }).allowed).toBe(true)
  })

  it('an unknown command is refused for any staff', () => {
    expect(run([ADM], 'not.a.command').reason).toBe('UNKNOWN_COMMAND')
  })

  describe('user administration', () => {
    it('refuses a role change that grants Bioanalista', () => {
      expect(run([ADM], 'user.role.change', { facts: { grants_bioanalista: true }, gestures: STEP_UP_OK }).reason).toBe('STATE')
    })

    it('refuses temporary cover that includes Bioanalista (E-08)', () => {
      const facts = { has_end_date: true, grants_bioanalista: true }
      expect(run([ADM], 'user.grant.temporary', { facts, gestures: { ...STEP_UP_OK, motivo: 'Vacaciones' } }).reason).toBe('STATE')
    })

    it('allows the Bioanalista grant with a license and a re-entry', () => {
      expect(run([ADM], 'role.grant_bioanalista', { facts: { license_present: true }, gestures: STEP_UP_OK }).allowed).toBe(true)
    })
  })

  it('refuses a send when the delivery mode is not allowed', () => {
    const facts = { state: 'LIBERADO', delivery_mode_allowed: false }
    expect(run([REC], 'delivery.send', { facts, gestures: CONFIRM_OK }).reason).toBe('STATE')
  })

  describe('verify.file.read', () => {
    const facts = {
      value_check_enabled: true,
      state: 'LIBERADO',
      issue_current: true,
      printed_code_matches: true,
      within_value_check_period: true,
    }

    it('is refused while the value check is off', () => {
      const off = { ...facts, value_check_enabled: false }
      expect(run(['PUBLICO'], 'verify.file.read', { facts: off, record: { tokenMatches: true } }).reason).toBe('STATE')
    })

    it('is allowed with every fact and a matching token', () => {
      expect(run(['PUBLICO'], 'verify.file.read', { facts, record: { tokenMatches: true } }).allowed).toBe(true)
    })
  })
})

describe('decide: session and invariants', () => {
  it('refuses an invalid or inactive session', () => {
    expect(run([REC], 'shell.view', { session: { valid: false, active: true, userId: 'u1', roles: [REC] } }).reason).toBe('SESSION')
    expect(run([REC], 'shell.view', { session: { valid: true, active: false, userId: 'u1', roles: [REC] } }).reason).toBe('SESSION')
  })

  it('refuses a person with no role', () => {
    expect(run([], 'shell.view').reason).toBe('SESSION')
  })

  it('never lets a client role carry staff rights', () => {
    expect(run(['CLIENTE', ADM], 'client.merge', { facts: { both_complete_and_different: false }, gestures: STEP_UP_OK }).reason).toBe('SESSION')
  })

  it('computes $own from the record and ignores a supplied value', () => {
    const forged = { $own: true }
    const gestures = { ...STEP_UP_OK, motivo: 'Cierre de otro usuario' }
    const decision = run([REC], 'cash.close', { facts: forged, record: { ownerUserId: 'u2' } })
    expect(decision.reason).toBe('OWNERSHIP')
    expect(run([ADM], 'cash.close', { facts: forged, record: { ownerUserId: 'u2' }, gestures }).rowId).toBe('R-063')
  })

  it('a read-only grant refuses an action', () => {
    expect(run([REC], 'print_status.use', { mode: 'write' }).reason).toBe('ROLE')
    expect(run([REC], 'print_status.use', { mode: 'read' }).allowed).toBe(true)
  })

  it('stamps the table version on every answer', () => {
    expect(run([REC], 'shell.view').tableVersion).toBe(5)
    expect(run([REC], 'not.a.command').tableVersion).toBe(5)
  })
})
