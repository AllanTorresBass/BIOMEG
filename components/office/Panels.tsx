'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GestureDialogs } from '@/components/payments/GestureDialogs'
import { useGestureCommand } from '@/hooks/use-gesture-command'
import { useOfficeCommands } from '@/hooks/use-office'
import { useSessionCommands } from '@/hooks/use-session'
import { PRICE_COLUMNS, PRICE_COLUMN_LABELS } from '@/lib/config/price-defaults'
import { applyIncrease } from '@/lib/domain/pricing'
import { parsePercentBp } from '@/lib/domain/order-totals'
import { strings } from '@/lib/strings'
import { formatMoney } from '@/lib/utils/format'
import type { PriceColumn } from '@/types/domain/demo.types'
import type { PriceMatrixRow, RegistryKind, RegistryRow } from '@/types/office/office.types'
import type { StaffDirectoryRow } from '@/types/server/store.types'

const text = strings.pendingReview.office
const FIELD = 'h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3'
const BUTTON = 'h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60'

const ASSIGNABLE = ['RECEPCION', 'AUXILIAR', 'ADMINISTRACION'] as const

export function PrintListButton() {
  const { printPrices } = useOfficeCommands()
  return (
    <button
      type="button"
      className={BUTTON}
      onClick={() => void printPrices().then(() => window.print(), () => undefined)}
    >
      {text.print}
    </button>
  )
}

export function PriceEditor({ rows, currency }: { rows: readonly PriceMatrixRow[]; currency: 'USD' | 'BS' }) {
  const { editPrice } = useOfficeCommands()
  const gesture = useGestureCommand()
  const key = currency === 'USD' ? 'usd' : 'bs'

  return (
    <>
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-card">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-sunken">
              <th className="px-3 py-2">{text.name}</th>
              {PRICE_COLUMNS.map((column) => (
                <th key={column} className="px-3 py-2">{PRICE_COLUMN_LABELS[column]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-b-0">
                <th scope="row" className="px-3 py-2 font-normal">{row.name}</th>
                {PRICE_COLUMNS.map((column) => (
                  <td key={column} className="px-3 py-2">
                    <input
                      key={row.prices[column][key] ?? ''}
                      defaultValue={row.prices[column][key] ?? ''}
                      aria-label={`${row.name} ${PRICE_COLUMN_LABELS[column]}`}
                      className={`${FIELD} w-28 tabular-nums`}
                      onBlur={(event) => {
                        const amount = event.target.value
                        if (amount === (row.prices[column][key] ?? '')) return
                        gesture.ask({
                          title: text.confirmTitle,
                          body: text.confirmBody,
                          confirmLabel: text.confirmLabel,
                          motivoRequired: false,
                          command: (presented) => editPrice({ examId: row.id, currency, column, amount, confirmed: presented.confirmed }),
                        })
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <GestureDialogs gesture={gesture} />
    </>
  )
}

export function IncreasePanel({ rows, currency }: { rows: readonly PriceMatrixRow[]; currency: 'USD' | 'BS' }) {
  const { increasePrices } = useOfficeCommands()
  const gesture = useGestureCommand()
  const [percent, setPercent] = useState('10')
  const [columns, setColumns] = useState<PriceColumn[]>([...PRICE_COLUMNS])
  const [showPreview, setShowPreview] = useState(false)
  const percentBp = parsePercentBp(percent)
  const key = currency === 'USD' ? 'usd' : 'bs'

  function toggle(column: PriceColumn) {
    setColumns((current) => (current.includes(column) ? current.filter((item) => item !== column) : [...current, column]))
    setShowPreview(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex w-40 flex-col gap-1">
        <span className="font-semibold">{text.increasePercent}</span>
        <input value={percent} onChange={(event) => { setPercent(event.target.value); setShowPreview(false) }} className={`${FIELD} tabular-nums`} />
      </label>
      <div className="flex flex-wrap gap-3">
        {PRICE_COLUMNS.map((column) => (
          <label key={column} className="flex items-center gap-2">
            <input type="checkbox" checked={columns.includes(column)} onChange={() => toggle(column)} />
            {PRICE_COLUMN_LABELS[column]}
          </label>
        ))}
      </div>
      <button type="button" className={BUTTON} onClick={() => setShowPreview(true)}>{text.increasePreview}</button>
      {showPreview && percentBp !== null && percentBp > 0 ? (
        <table className="w-full border-collapse text-left">
          <caption className="mb-2 text-left font-semibold">{text.increasePreview}</caption>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row" className="py-1 pr-4 font-normal">{row.name}</th>
                {columns.map((column) => (
                  <td key={column} className="px-2 py-1 tabular-nums">
                    {formatMoney(applyIncrease(row.prices[column][key], percentBp))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      <button
        type="button"
        className={`${BUTTON} self-start`}
        disabled={!showPreview || percentBp === null || percentBp <= 0 || columns.length === 0}
        onClick={() => void gesture.attempt(() => increasePrices({ percent, currency, columns }), {})}
      >
        {text.increaseApply}
      </button>
      <GestureDialogs gesture={gesture} />
    </div>
  )
}

export function RatePanel({ rate }: { rate: string }) {
  const { setRate } = useOfficeCommands()
  const [value, setValue] = useState(rate)
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        void setRate({ rate: value })
      }}
    >
      <label className="flex flex-col gap-1">
        <span className="font-semibold">{text.rateLabel}</span>
        <input value={value} onChange={(event) => setValue(event.target.value)} className={`${FIELD} tabular-nums`} />
      </label>
      <button type="submit" className={BUTTON}>{text.save}</button>
    </form>
  )
}

export function SwitchPanel({ enabled, which }: { enabled: boolean; which: 'saturday' | 'qr' }) {
  const { setSaturday, setQr } = useOfficeCommands()
  const gesture = useGestureCommand()
  const title = which === 'saturday' ? text.saturdayTitle : text.qrTitle
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="font-semibold">{enabled ? text.switchOn : text.switchOff}</p>
      {which === 'saturday' ? <p className="max-w-xl text-muted-foreground">{text.saturdayNote}</p> : null}
      <button
        type="button"
        className={BUTTON}
        onClick={() =>
          gesture.ask({
            title,
            body: text.confirmBody,
            confirmLabel: text.confirmLabel,
            motivoRequired: false,
            command: (presented) =>
              (which === 'saturday' ? setSaturday : setQr)({ enabled: !enabled, confirmed: presented.confirmed }),
          })
        }
      >
        {enabled ? text.switchOff : text.switchOn}
      </button>
      <GestureDialogs gesture={gesture} />
    </div>
  )
}

export function RegistryPanel({ kind, rows, canEdit, titular }: { kind: RegistryKind; rows: readonly RegistryRow[]; canEdit: boolean; titular: boolean }) {
  const { saveRegistry } = useOfficeCommands()
  const [name, setName] = useState('')
  const [requiresTitular, setRequiresTitular] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      {canEdit ? (
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            void saveRegistry({ kind, id: null, name, active: true, requiresTitular }).then(() => {
              setName('')
              setRequiresTitular(false)
            })
          }}
        >
          <label className="flex flex-col gap-1">
            <span className="font-semibold">{text.name}</span>
            <input value={name} onChange={(event) => setName(event.target.value)} className={FIELD} />
          </label>
          {titular ? (
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={requiresTitular} onChange={(event) => setRequiresTitular(event.target.checked)} />
              {text.titular}
            </label>
          ) : null}
          <button type="submit" className={BUTTON}>{text.newRecord}</button>
        </form>
      ) : null}
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2">{text.name}</th>
            <th className="py-2">{text.status}</th>
            {titular ? <th className="py-2">{text.titular}</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border">
              <th scope="row" className="py-2 font-normal">{row.name}</th>
              <td>{row.active ? text.active : text.inactive}</td>
              {titular ? <td>{row.requiresTitular ? text.active : text.inactive}</td> : null}
              {canEdit ? (
                <td>
                  <button
                    type="button"
                    className="underline"
                    onClick={() => void saveRegistry({ kind, id: row.id, name: row.name, active: !row.active, requiresTitular: row.requiresTitular })}
                  >
                    {row.active ? text.inactive : text.active}
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? <p className="text-muted-foreground">{text.emptyRegistry}</p> : null}
    </div>
  )
}

export function InventoryPanel({ reagents }: { reagents: readonly { id: string; name: string }[] }) {
  const { deductInventory } = useOfficeCommands()
  const gesture = useGestureCommand()
  const [reagentId, setReagentId] = useState(reagents[0]?.id ?? '')
  const [quantity, setQuantity] = useState('')
  if (reagents.length === 0) return <p>{text.inventoryEmpty}</p>
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        gesture.ask({
          title: text.inventoryTitle,
          body: text.confirmBody,
          confirmLabel: text.confirmLabel,
          motivoRequired: false,
          command: (presented) => deductInventory({ reagentId, quantity, confirmed: presented.confirmed }),
        })
      }}
    >
      <label className="flex flex-col gap-1">
        <span className="font-semibold">{text.name}</span>
        <select value={reagentId} onChange={(event) => setReagentId(event.target.value)} className={FIELD}>
          {reagents.map((reagent) => (
            <option key={reagent.id} value={reagent.id}>{reagent.name}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">{text.quantity}</span>
        <input value={quantity} onChange={(event) => setQuantity(event.target.value)} className={`${FIELD} tabular-nums`} />
      </label>
      <button type="submit" className={BUTTON}>{text.save}</button>
      <GestureDialogs gesture={gesture} />
    </form>
  )
}

function roleBoxes(selected: readonly string[], onChange: (roles: string[]) => void, allowBioanalista = false) {
  const choices = allowBioanalista ? ([...ASSIGNABLE, 'BIOANALISTA'] as const) : ASSIGNABLE
  return (
    <div className="flex flex-wrap gap-3">
      {choices.map((role) => (
        <label key={role} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected.includes(role)}
            onChange={() => onChange(selected.includes(role) ? selected.filter((item) => item !== role) : [...selected, role])}
          />
          {text.roles[role]}
        </label>
      ))}
    </div>
  )
}

export function UserPanel({ people }: { people: readonly StaffDirectoryRow[] }) {
  const commands = useOfficeCommands()
  const gesture = useGestureCommand()
  const [name, setName] = useState('')
  const [roles, setRoles] = useState<string[]>(['RECEPCION'])
  const [license, setLicense] = useState('')
  const [until, setUntil] = useState('')

  return (
    <div className="flex flex-col gap-6">
      <form
        className="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          void gesture.attempt(() => commands.createUser({ displayName: name, roles: roles as CreateRoles }), {})
        }}
      >
        <label className="flex max-w-sm flex-col gap-1">
          <span className="font-semibold">{text.userName}</span>
          <input value={name} onChange={(event) => setName(event.target.value)} className={FIELD} />
        </label>
        {roleBoxes(roles, setRoles)}
        <button type="submit" className={`${BUTTON} self-start`}>{text.userCreate}</button>
      </form>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2">{text.userName}</th>
            <th className="py-2">{text.userRoles}</th>
            <th className="py-2">{text.status}</th>
          </tr>
        </thead>
        <tbody>
          {people.map((person) => (
            <tr key={person.id} className="border-b border-border align-top">
              <th scope="row" className="py-2 font-normal">{person.displayName}</th>
              <td className="py-2">{person.roles.map((role) => text.roles[role]).join(', ')}</td>
              <td className="py-2">{person.active ? text.active : text.inactive}</td>
              <td className="flex flex-col items-start gap-1 py-2">
                <button type="button" className="underline" onClick={() => void gesture.attempt(() => commands.disableUser({ userId: person.id }), {})}>{text.userDisable}</button>
                <button type="button" className="underline" onClick={() => void gesture.attempt(() => commands.changeRoles({ userId: person.id, roles: roles as CreateRoles }), {})}>{text.userRolesSave}</button>
                <button type="button" className="underline" onClick={() => void gesture.attempt(() => commands.resetPassword({ userId: person.id }), {})}>{text.userReset}</button>
                <button
                  type="button"
                  className="underline"
                  onClick={() =>
                    gesture.ask({
                      title: text.userCover,
                      body: text.confirmBody,
                      confirmLabel: text.confirmLabel,
                      motivoRequired: true,
                      command: (presented) => commands.grantCover({ userId: person.id, roles: roles as CreateRoles, until, confirmed: presented.confirmed, motivo: presented.motivo }),
                    })
                  }
                >
                  {text.userCover}
                </button>
                <button type="button" className="underline" onClick={() => void gesture.attempt(() => commands.grantBioanalista({ userId: person.id, license }), {})}>{text.userGrant}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-semibold">{text.userLicense}</span>
          <input value={license} onChange={(event) => setLicense(event.target.value)} className={FIELD} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold">{text.userCoverUntil}</span>
          <input type="date" value={until} onChange={(event) => setUntil(event.target.value)} className={FIELD} />
        </label>
      </div>
      <GestureDialogs gesture={gesture} />
    </div>
  )
}

type CreateRoles = ('RECEPCION' | 'AUXILIAR' | 'BIOANALISTA' | 'ADMINISTRACION')[]

export function MailPanel({ account, secretSet }: { account: string; secretSet: boolean }) {
  const { saveMail } = useOfficeCommands()
  const gesture = useGestureCommand()
  const [name, setName] = useState(account)
  const [secret, setSecret] = useState('')
  return (
    <form
      className="flex max-w-md flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        void gesture.attempt(() => saveMail({ account: name, secret }), {}).then(() => setSecret(''))
      }}
    >
      <p className="text-muted-foreground">{text.mailUnknown}</p>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">{text.mailAccount}</span>
        <input value={name} onChange={(event) => setName(event.target.value)} className={FIELD} autoComplete="off" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">{text.mailSecret}</span>
        <input type="password" value={secret} onChange={(event) => setSecret(event.target.value)} className={FIELD} autoComplete="new-password" />
      </label>
      {secretSet ? <p>{text.mailSecretSet}</p> : null}
      <button type="submit" className={`${BUTTON} self-start`}>{text.save}</button>
      <GestureDialogs gesture={gesture} />
    </form>
  )
}

export function BackupPanel() {
  const { runBackup } = useOfficeCommands()
  const gesture = useGestureCommand()
  return (
    <>
      <button type="button" className={`${BUTTON} self-start`} onClick={() => void gesture.attempt(() => runBackup(), {})}>{text.backupRun}</button>
      <GestureDialogs gesture={gesture} />
    </>
  )
}

export function StepUpGate() {
  const { verifyStepUp } = useSessionCommands()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  return (
    <form
      className="flex max-w-sm flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        void verifyStepUp(password).then((answer) => {
          if (answer.ok) router.refresh()
          else setError(text.notAllowed)
        }, () => setError(text.notAllowed))
      }}
    >
      <h2 className="text-lg font-semibold">{text.stepUpTitle}</h2>
      <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={FIELD} autoComplete="current-password" />
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit" className={`${BUTTON} self-start`}>{text.stepUpSubmit}</button>
    </form>
  )
}
