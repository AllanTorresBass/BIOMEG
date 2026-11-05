import Link from 'next/link'
import { ShellEmblem } from '@/components/brand/ShellEmblem'
import { SalirButton } from '@/components/shell/SalirButton'
import { SignOutButton } from '@/components/shell/SignOutButton'
import { StatusChip } from '@/components/shared/StatusChip'
import { strings } from '@/lib/strings'
import { formatDate, formatRate } from '@/lib/utils/format'
import type { ShellBarProps } from '@/types/shell/shell.types'

export function ShellBar({ account, roleLabel, settings }: ShellBarProps) {
  const hasRate = settings.rateBs !== null && settings.rateBs !== ''

  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-primary-deep px-4 py-2 text-primary-foreground">
      <div className="flex items-center gap-3">
        <ShellEmblem />
        <div className="leading-tight">
          <p className="text-xl font-bold tracking-wide">{strings.brand.name}</p>
          <p className="text-xs tracking-widest">{strings.brand.descriptor}</p>
        </div>
      </div>

      <dl className="flex flex-wrap items-center gap-x-5 gap-y-1">
        <div className="flex items-center gap-2">
          <dt><Link href="/mantenimiento/tasa" className="underline">{strings.shell.rate}</Link></dt>
          <dd>
            {hasRate ? (
              <span className="tabular-nums">
                {formatRate(settings.rateBs)} · {formatDate(settings.rateDate)}
              </span>
            ) : (
              <StatusChip status="SIN_TASA" />
            )}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt><Link href="/mantenimiento/qr" className="underline">{strings.shell.qr}</Link></dt>
          <dd>
            <StatusChip status={settings.qrEnabled ? 'ACTIVO' : 'INACTIVO'} />
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt><Link href="/mantenimiento/sabado" className="underline">{strings.shell.saturday}</Link></dt>
          <dd className="flex items-center gap-2">
            <StatusChip status={settings.saturdayPriceEnabled ? 'ACTIVO' : 'INACTIVO'} />
            <span className="text-xs">{strings.shell.saturdayCaption}</span>
          </dd>
        </div>
      </dl>

      <div className="ml-auto flex flex-wrap items-center gap-3">
        <p className="leading-tight">
          <span className="block text-xs">{strings.shell.activeUser}</span>
          <span className="font-semibold">{account.displayName}</span>
          <span className="block text-xs">{roleLabel}</span>
        </p>
        <SalirButton />
        <SignOutButton />
      </div>
    </header>
  )
}
