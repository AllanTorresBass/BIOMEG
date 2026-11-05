import type { ReactNode } from 'react'

export interface AppProvidersProps {
  children: ReactNode
  /** 0 on the portal, so a result never stays in memory after it leaves the screen. */
  gcTime?: number
}

export interface LayoutProps {
  children: ReactNode
}

export interface RouteErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export interface ErrorBoundaryProps {
  children: ReactNode
}

export interface ErrorBoundaryState {
  failed: boolean
}

export interface PageSkeletonProps {
  variant: 'table' | 'form' | 'paper'
}
