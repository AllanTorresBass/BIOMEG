import 'server-only'

import { demoSeed } from '@/lib/db/memory/seed'
import { PRICE_COLUMNS } from '@/lib/config/price-defaults'
import { applyIncrease, centsToDecimal } from '@/lib/domain/pricing'
import { parseAmountCents, parsePercentBp } from '@/lib/domain/order-totals'
import { auditEvent } from '@/lib/server/audit'
import { record } from '@/lib/server/draft-gate'
import { todayInLab } from '@/lib/server/domain/client-rules'
import { officeAllow, officeContext, officeDone, officeFail, refreshShell } from '@/lib/server/office-gate'
import { strings } from '@/lib/strings'
import type { PriceColumn } from '@/types/domain/demo.types'
import type { OfficeResult } from '@/types/office/office.types'
import type { EditPriceInput, IncreaseInput, SetRateInput, SwitchInput } from '@/types/office/office.schemas'
import type { Presented } from '@/types/server/draft-gate.types'

const text = strings.pendingReview.office
const TARGET = { recordType: 'setting', recordId: 'laboratory', state: null }

function presentedOf(input: { confirmed?: boolean; motivo?: string }): Presented {
  return { confirmed: input.confirmed === true, ...(input.motivo === undefined ? {} : { motivo: input.motivo }) }
}

function storedAmount(raw: string): string | null | 'INVALID' {
  if (raw.trim() === '') return null
  const cents = parseAmountCents(raw)
  if (cents === null) return 'INVALID'
  return centsToDecimal(cents)
}

export async function setRate(input: SetRateInput): Promise<OfficeResult> {
  const context = await officeContext()
  if (!context) return officeFail(text.notAllowed)
  const cents = parseAmountCents(input.rate)
  if (cents === null || cents <= 0) return officeFail(text.rateInvalid)
  const { settings } = demoSeed
  const exists = settings.rateDate === todayInLab() && settings.rateBs !== ''
  const allowed = await officeAllow(context, 'rate.set', { rate_today_exists: exists }, presentedOf(input), TARGET)
  if ('need' in allowed) return allowed
  const before = settings.rateBs
  settings.rateBs = centsToDecimal(cents)
  settings.rateDate = todayInLab()
  await record({ context }, 'rate.set', allowed.rowId, { before, after: settings.rateBs, field: 'rate' }, undefined, TARGET)
  refreshShell()
  return officeDone(text.rateDone)
}

async function setSwitch(command: 'setting.saturday.change' | 'setting.qr.change', field: 'saturdayPriceEnabled' | 'qrEnabled', input: SwitchInput): Promise<OfficeResult> {
  const context = await officeContext()
  if (!context) return officeFail(text.notAllowed)
  const allowed = await officeAllow(context, command, {}, presentedOf(input), TARGET)
  if ('need' in allowed) return allowed
  const before = demoSeed.settings[field]
  demoSeed.settings[field] = input.enabled
  await record({ context }, command, allowed.rowId, { before, after: input.enabled, field }, undefined, TARGET)
  refreshShell()
  return officeDone(text.saved)
}

export function setSaturday(input: SwitchInput): Promise<OfficeResult> {
  return setSwitch('setting.saturday.change', 'saturdayPriceEnabled', input)
}

export function setQr(input: SwitchInput): Promise<OfficeResult> {
  return setSwitch('setting.qr.change', 'qrEnabled', input)
}

export async function editPrice(input: EditPriceInput): Promise<OfficeResult> {
  const context = await officeContext()
  if (!context) return officeFail(text.notAllowed)
  const row = demoSeed.priceRows.find((candidate) => candidate.id === input.examId)
  if (!row) return officeFail(text.missing)
  const amount = storedAmount(input.amount)
  if (amount === 'INVALID') return officeFail(text.rateInvalid)
  const target = { recordType: 'price', recordId: row.id, state: row.status }
  const allowed = await officeAllow(context, 'prices.edit', {}, presentedOf(input), target)
  if ('need' in allowed) return allowed
  const key = input.currency === 'USD' ? 'usd' : 'bs'
  const before = row.prices[input.column][key]
  row.prices[input.column] = { ...row.prices[input.column], [key]: amount }
  await record({ context }, 'prices.edit', allowed.rowId, { before, after: amount, field: `${input.column}.${key}` }, undefined, target)
  refreshShell()
  return officeDone(text.saved)
}

export async function increasePrices(input: IncreaseInput): Promise<OfficeResult> {
  const context = await officeContext()
  if (!context) return officeFail(text.notAllowed)
  const percentBp = parsePercentBp(input.percent)
  if (percentBp === null || percentBp <= 0) return officeFail(text.increaseInvalid)
  const columns = input.columns.filter((column): column is PriceColumn => PRICE_COLUMNS.includes(column))
  if (columns.length === 0) return officeFail(text.increaseInvalid)
  const target = { recordType: 'price', recordId: 'catalog', state: null }
  const allowed = await officeAllow(context, 'prices.general_increase', {}, presentedOf(input), target)
  if ('need' in allowed) return allowed
  const before = columns.map((column) => column)
  for (const row of demoSeed.priceRows) {
    for (const column of columns) {
      const key = input.currency === 'USD' ? 'usd' : 'bs'
      row.prices[column] = { ...row.prices[column], [key]: applyIncrease(row.prices[column][key], percentBp) }
    }
  }
  await record({ context }, 'prices.general_increase', allowed.rowId, { before, after: { percentBp, currency: input.currency } }, undefined, target)
  refreshShell()
  return officeDone(text.increaseDone)
}

export async function printPrices(): Promise<OfficeResult> {
  const context = await officeContext()
  if (!context) return officeFail(text.notAllowed)
  const allowed = await officeAllow(context, 'prices.list', {}, {}, TARGET)
  if ('need' in allowed) return allowed
  await auditEvent({
    command: 'price.print',
    outcome: 'ALLOWED',
    session: context.session,
    account: context.account,
    recordType: 'price',
    recordId: 'list',
    rowId: allowed.rowId,
  })
  return officeDone(text.printDone)
}
