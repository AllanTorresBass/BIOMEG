import type { ReactNode } from 'react'
import { AppProviders } from '@/components/providers/AppProviders'
import { DemoRoleSwitcher } from '@/components/dev/DemoRoleSwitcher'
import { IdleLock } from '@/components/shell/IdleLock'
import { MenuBar } from '@/components/shell/MenuBar'
import type { MenuBarGroup } from '@/types/shell/menu-bar.props'
import { PrimaryActions } from '@/components/shell/PrimaryActions'
import { ShellBar } from '@/components/shell/ShellBar'
import { UnsavedEditsProvider } from '@/components/shell/UnsavedEditsContext'
import { MENU_GROUPS, PRIMARY_ACTIONS } from '@/lib/config/menu'
import { ROLE_LABELS } from '@/lib/auth/roles'
import { SESSION_SETTINGS } from '@/lib/config/session'
import { mayReach } from '@/lib/server/guard'
import { requireStaff } from '@/lib/server/session/require'
import { listDemoAccounts } from '@/lib/server/session/accounts'
import { getShellSettings, isDemoAccessOn } from '@/lib/server/settings'
import type { StaffRole } from '@/types/auth/auth.types'

function roleLabel(roles: readonly StaffRole[], separator = ', '): string {
  return roles.map((role) => ROLE_LABELS[role]).join(separator)
}

export default async function StaffLayout({ children }: { children: ReactNode }) {
  const context = await requireStaff()
  const needsNewPassword = context.account.mustChangePassword

  const groups: MenuBarGroup[] = needsNewPassword
    ? []
    : MENU_GROUPS.map((group) => ({
        label: group.label,
        items: group.items
          .filter((entry) => mayReach(context, entry.commands))
          .map((entry) => ({ label: entry.label, slug: entry.slug })),
      })).filter((group) => group.items.length > 0)

  const actions = needsNewPassword
    ? []
    : PRIMARY_ACTIONS.filter((action) => mayReach(context, action.commands))

  return (
    <AppProviders>
    <UnsavedEditsProvider>
      <ShellBar account={context.account} roleLabel={roleLabel(context.account.roles)} settings={getShellSettings()} />
      {groups.length > 0 ? <MenuBar groups={groups} /> : null}
      <PrimaryActions actions={actions} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-4">{children}</main>
      {isDemoAccessOn() && !needsNewPassword ? (
        <DemoRoleSwitcher
          accounts={(await listDemoAccounts()).map((account) => ({ id: account.id, label: roleLabel(account.roles, ' y ') }))}
          currentUserId={context.account.id}
        />
      ) : null}
      <IdleLock locked={context.locked} idleMinutes={SESSION_SETTINGS.idleLockMinutes} />
    </UnsavedEditsProvider>
    </AppProviders>
  )
}
