import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm'
import { requireStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

export default async function PasswordPage() {
  const context = await requireStaff()
  if (context.locked) return null

  return (
    <section className="w-full max-w-sm rounded-[var(--radius-card)] border border-border bg-card p-5">
      <h1 className="text-xl font-semibold">{strings.auth.changePassword}</h1>
      {context.account.mustChangePassword ? <p className="mt-2 text-sm text-muted-foreground">{strings.auth.passwordTemporary}</p> : null}
      <div className="mt-4">
        <ChangePasswordForm replaceFirst={context.account.mustChangePassword} />
      </div>
    </section>
  )
}
