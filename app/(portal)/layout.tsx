import { AppProviders } from '@/components/providers/AppProviders'
import type { LayoutProps } from '@/types/shared/providers.types'

/** No staff shell, session, or data. gcTime 0, so a result never stays in memory after it leaves the screen. */
export default function PortalLayout({ children }: LayoutProps) {
  return <AppProviders gcTime={0}>{children}</AppProviders>
}
