import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface StaffBreadcrumbCrumb {
  label: string
  href?: string
}

/** Sticky list → record orientation. Last crumb is the current page. */
export function StaffBreadcrumb({ crumbs, label }: { crumbs: readonly StaffBreadcrumbCrumb[]; label: string }) {
  if (crumbs.length === 0) return null
  return (
    <nav aria-label={label} className="sticky top-0 z-10 -mx-1 bg-[var(--surface-page)] px-1 py-2">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1
          return (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
              {index > 0 ? (
                <span aria-hidden className="text-muted-foreground">
                  <ChevronRight className="size-4" />
                </span>
              ) : null}
              {last || !crumb.href ? (
                <span aria-current={last ? 'page' : undefined} className="font-semibold">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="rounded-[var(--radius-control)] font-semibold text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--color-navy)] focus-visible:ring-offset-2"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
