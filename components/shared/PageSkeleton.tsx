import { strings } from '@/lib/strings'
import type { PageSkeletonProps } from '@/types/shared/providers.types'

const BAR = 'animate-pulse rounded-[var(--radius-control)] bg-sunken'
const ROWS = [0, 1, 2, 3, 4, 5]

/** Mirrors the three screen shapes, so nothing jumps when the data arrives. No spinner. */
export function PageSkeleton({ variant }: PageSkeletonProps) {
  return (
    <div role="status" aria-label={strings.pendingReview.api.loading} className="flex w-full flex-col gap-4">
      <div className={`${BAR} h-7 w-56`} />
      {variant === 'table' ? (
        <>
          <div className={`${BAR} h-10 w-full max-w-lg`} />
          <div className="flex flex-col gap-1 rounded-[var(--radius-card)] border border-border p-2">
            {ROWS.map((row) => (
              <div key={row} className={`${BAR} h-9 w-full`} />
            ))}
          </div>
        </>
      ) : null}
      {variant === 'form' ? (
        <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border p-4">
          {ROWS.slice(0, 4).map((row) => (
            <div key={row} className="flex flex-col gap-1">
              <div className={`${BAR} h-4 w-32`} />
              <div className={`${BAR} h-10 w-full`} />
            </div>
          ))}
        </div>
      ) : null}
      {variant === 'paper' ? (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-[var(--radius-card)] border border-border p-6">
          <div className={`${BAR} h-24 w-48`} />
          {ROWS.map((row) => (
            <div key={row} className={`${BAR} h-5 w-full`} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
