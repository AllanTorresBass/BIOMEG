'use client'

import { Component, type ErrorInfo } from 'react'
import { logger } from '@/lib/logger'
import { strings } from '@/lib/strings'
import type { ErrorBoundaryProps, ErrorBoundaryState } from '@/types/shared/providers.types'

/** Keeps a failure in one complex region from taking down the whole screen. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('[ui] region failed', { error, stack: info.componentStack })
  }

  override render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-[var(--radius-card)] border border-border p-4">
        <p className="font-semibold">{strings.pendingReview.api.pageFailed}</p>
        <button
          type="button"
          onClick={() => this.setState({ failed: false })}
          className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] border border-border px-4 font-semibold"
        >
          {strings.pendingReview.api.retry}
        </button>
      </div>
    )
  }
}
