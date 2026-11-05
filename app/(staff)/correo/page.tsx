import { MailPanel } from '@/components/office/Panels'
import { BlockedNotice } from '@/components/shared/BlockedNotice'
import { guardRoute } from '@/lib/server/guard'
import { mailScreen } from '@/lib/server/queries/back-office'
import { requireReadyStaff } from '@/lib/server/session/require'
import { strings } from '@/lib/strings'

export default async function MailPage() {
  const context = await requireReadyStaff()
  if (context.locked) return null
  if (!(await guardRoute(context, ['mail.config'], '/correo'))) return <BlockedNotice />
  const mail = mailScreen()
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{strings.pendingReview.office.mailTitle}</h1>
      <MailPanel account={mail.account} secretSet={mail.secretSet} />
    </section>
  )
}
