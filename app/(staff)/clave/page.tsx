import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm'
import { requireStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

export default async function PasswordPage() {
  const context = await requireStaff()
  if (context.locked) return null

  return (
    <>
      <h1 className="text-xl font-semibold">{strings.auth.changePassword}</h1>
      <ChangePasswordForm />
    </>
  )
}
