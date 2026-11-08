import { ClientRecordScreen } from '../record-screen'
import type { SearchParams } from '@/types/app/page.types'

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

export default async function ClientFichaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: SearchParams
}) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  return <ClientRecordScreen clientId={id} wantsNew={false} justSaved={one(query.saved) === '1'} />
}
