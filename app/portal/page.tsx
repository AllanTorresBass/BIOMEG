import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LogoLockup } from '@/components/brand/LogoLockup'
import { LeaveButton } from '@/components/portal/LeaveButton'
import { PortalVisits } from '@/components/portal/PortalVisits'
import { visitsOf } from '@/lib/server/domain/portal'
import { getPortalContext } from '@/lib/server/portal/session'
import { strings } from '@/lib/strings'

export const metadata: Metadata = { title: strings.portal.title }

export default async function PortalPage() {
  const session = await getPortalContext()
  if (!session) redirect('/ingresar')

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <LogoLockup />
        <LeaveButton />
      </header>
      <h1 className="text-xl font-semibold">
        {strings.portal.visitsTitle} · {session.name}
      </h1>
      <PortalVisits visits={visitsOf(session.clientIds)} />
    </main>
  )
}
