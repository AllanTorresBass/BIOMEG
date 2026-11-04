'use client'

import { strings } from '@/lib/strings'

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="h-11 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground print:hidden"
    >
      {strings.pendingReview.orders.quotePrint}
    </button>
  )
}
