import { ArrowDown, ArrowUp } from 'lucide-react'
import { STATUS_TABLE, statusLabel } from '@/lib/config/status'
import { cn } from '@/lib/utils/cn'
import type { StatusChipProps, StatusTone } from '@/types/shared/status.types'

const TONE_CLASSES: Record<StatusTone, string> = {
  high: 'bg-flag-high-bg text-flag-high',
  low: 'bg-flag-low-bg text-flag-low',
  incomplete: 'bg-flag-incomplete-bg text-flag-incomplete',
  blocked: 'bg-flag-blocked-bg text-flag-blocked',
  released: 'bg-flag-released-bg text-flag-released',
  neutral: 'bg-sunken text-muted-foreground',
}

export function StatusChip({ status, surface = 'staff' }: StatusChipProps) {
  const definition = STATUS_TABLE[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-[var(--radius-control)] px-2 py-1 text-xs font-semibold tabular-nums',
        TONE_CLASSES[definition.tone],
      )}
    >
      {definition.icon === 'up' ? <ArrowUp aria-hidden className="size-3" /> : null}
      {definition.icon === 'down' ? <ArrowDown aria-hidden className="size-3" /> : null}
      {statusLabel(status, surface)}
    </span>
  )
}
