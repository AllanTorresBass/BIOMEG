import { LogoLockup } from '@/components/brand/LogoLockup'
import { strings } from '@/lib/strings'

export default function HomePage() {
  const { title, note } = strings.pendingReview.home
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center">
      <LogoLockup />
      <h1 className="text-balance text-xl font-semibold">{title}</h1>
      <p className="max-w-prose text-pretty text-muted-foreground">{note}</p>
    </main>
  )
}
