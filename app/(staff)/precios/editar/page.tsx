import { redirect } from 'next/navigation'

export default async function EditPricesRedirect({ searchParams }: { searchParams: Promise<{ moneda?: string }> }) {
  const search = await searchParams
  const qs = new URLSearchParams({ tab: 'editar' })
  if (search.moneda) qs.set('moneda', search.moneda)
  redirect(`/precios?${qs.toString()}`)
}
