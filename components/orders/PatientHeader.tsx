import { StatusChip } from '@/components/shared/StatusChip'
import { strings } from '@/lib/strings'
import type { PatientHeaderProps } from '@/types/orders/screen.types'

export function PatientHeader({ patient }: PatientHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-[var(--radius-card)] border border-border bg-card px-4 py-3">
      <span className="text-sm text-muted-foreground">{strings.pendingReview.orders.selected}</span>
      <span className="font-semibold">{patient.name}</span>
      <span className="tabular-nums">{patient.cedulaText}</span>
      <span>{patient.ageText}</span>
      {patient.verified ? null : <StatusChip status="SIN_VERIFICAR" />}
    </div>
  )
}
