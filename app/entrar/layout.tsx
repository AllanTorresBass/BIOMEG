import { AppProviders } from '@/components/providers/AppProviders'
import type { LayoutProps } from '@/types/shared/providers.types'

export default function SignInLayout({ children }: LayoutProps) {
  return <AppProviders>{children}</AppProviders>
}
