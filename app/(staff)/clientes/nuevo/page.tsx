import { ClientRecordScreen } from '../record-screen'
import type { SearchParams } from '@/types/app/page.types'

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

export default async function NewClientPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  return <ClientRecordScreen clientId="" wantsNew justSaved={one(params.saved) === '1'} />
}
