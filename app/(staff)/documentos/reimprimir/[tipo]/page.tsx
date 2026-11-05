import { notFound } from 'next/navigation'
import { ReprintPanel } from '@/components/fiscal/ReprintPanel'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { canReprint } from '@/lib/server/queries/fiscal'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'
import type { ReprintKind } from '@/types/orders/fiscal.types'

const { kinds } = strings.pendingReview.fiscal

function isReprintKind(value: string): value is ReprintKind {
  return Object.hasOwn(kinds, value)
}

export default async function ReprintPage({ params }: { params: Promise<{ tipo: string }> }) {
  const { tipo } = await params
  if (!isReprintKind(tipo)) notFound()
  const context = await requireReadyStaff()
  if (context.locked) return null
  if (!(await canReprint(context, tipo))) return <BlockedNotice />
  return <ReprintPanel kind={tipo} title={`Re-imprimir ${kinds[tipo].toLowerCase()}`} />
}
