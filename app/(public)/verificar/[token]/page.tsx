import type { Metadata } from 'next'
import { LogoLockup } from '@/components/brand/LogoLockup'
import { readVerification } from '@/lib/server/domain/verification'
import { strings } from '@/lib/strings'
import type { VerificationPageProps } from '@/types/app/page.types'

const text = strings.pendingReview.verification

export const metadata: Metadata = {
  title: text.title,
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  )
}

export default async function VerificationPage({ params, searchParams }: VerificationPageProps) {
  const { token } = await params
  const { consulta } = await searchParams
  const view = await readVerification(token)

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-6">
      <LogoLockup />
      <h1 className="text-xl font-semibold">{text.title}</h1>

      {view.kind === 'NO_DISPONIBLE' ? <p className="text-lg font-semibold">{text.unavailable}</p> : null}

      {view.kind === 'REEMPLAZADO' ? (
        <>
          <p className="text-lg font-semibold">{text.replaced}</p>
          <dl className="flex flex-col gap-3">
            <Fact label={text.labels.order} value={view.orderNumber} />
            <Fact label={text.labels.lab} value={view.labName} />
            <Fact label={text.labels.reportDate} value={view.reportDateText} />
            <Fact label={text.replacedOn} value={view.replacedDateText} />
          </dl>
        </>
      ) : null}

      {view.kind === 'ESTADO' ? (
        <dl className="flex flex-col gap-3">
          <Fact label={text.labels.order} value={view.orderNumber} />
          <Fact label={text.labels.lab} value={view.labName} />
          <Fact label={text.labels.reportDate} value={view.reportDateText} />
          <Fact label={text.labels.state} value={text.states[view.state]} />
        </dl>
      ) : null}

      <p>{text.disclaimer}</p>

      {view.kind === 'ESTADO' && view.valueCheck ? (
        <form
          method="post"
          action={`/api/v1/verificar/${encodeURIComponent(token)}/informe`}
          className="flex flex-col gap-2"
        >
          <p>{text.codeNote}</p>
          <label htmlFor="code" className="text-sm font-semibold">
            {text.codeLabel}
          </label>
          <input
            id="code"
            name="code"
            required
            maxLength={64}
            autoComplete="off"
            className="min-h-11 rounded-md border border-input bg-background px-3 uppercase"
          />
          {consulta === 'no-disponible' ? (
            <p role="alert" className="font-semibold">
              {text.unavailable}
            </p>
          ) : null}
          <button type="submit" className="min-h-11 rounded-md bg-primary px-4 font-semibold text-primary-foreground">
            {text.codeSubmit}
          </button>
        </form>
      ) : null}
    </main>
  )
}
