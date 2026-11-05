import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LogoLockup } from '@/components/brand/LogoLockup'
import { PortalSignIn } from '@/components/portal/PortalSignIn'
import { getPortalContext } from '@/lib/server/portal/session'
import { strings } from '@/lib/strings'

export const metadata: Metadata = { title: strings.portal.signInTitle }

export default async function PortalSignInPage() {
  if (await getPortalContext()) redirect('/portal')

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6">
      <LogoLockup />
      <section className="w-full max-w-sm rounded-[var(--radius-card)] border border-border bg-card p-5">
        <h1 className="mb-4 text-xl font-semibold">{strings.portal.title}</h1>
        <PortalSignIn />
      </section>
    </main>
  )
}
