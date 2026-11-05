'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { requestPortalCode, verifyPortalCode } from '@/app/actions/portal'
import { strings } from '@/lib/strings'

const TYPES = ['V', 'E', 'P'] as const
const FIELD = 'h-10 rounded-[var(--radius-control)] border border-border-strong bg-background px-3'
const BUTTON =
  'h-10 rounded-[var(--radius-control)] bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60'

export function PortalSignIn() {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [step, setStep] = useState<'data' | 'code'>('data')
  const [type, setType] = useState<string>('V')
  const [digits, setDigits] = useState('')
  const [birth, setBirth] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [demoCode, setDemoCode] = useState<string | null>(null)

  const text = strings.portal

  function askForCode(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    start(async () => {
      const result = await requestPortalCode({ type, digits, birth })
      if (result.kind === 'INVALID') return setError(text.invalid)
      if (result.kind === 'PAUSED') return setError(text.paused)
      setDemoCode(result.demoCode)
      setStep('code')
    })
  }

  function submitCode(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    start(async () => {
      const result = await verifyPortalCode(code)
      if (result.kind === 'OK') return router.push('/portal')
      setError(
        result.kind === 'WRONG' ? text.wrongCode : result.kind === 'LOCKED' ? text.lockedCode : text.expiredCode,
      )
      if (result.kind !== 'WRONG') setStep('data')
    })
  }

  if (step === 'code') {
    return (
      <form onSubmit={submitCode} className="flex flex-col gap-4">
        <p>{text.answered}</p>
        {demoCode ? (
          <p className="rounded-[var(--radius-control)] border border-border bg-muted px-3 py-2">
            {text.demoCode} <strong className="font-mono">{demoCode}</strong>
          </p>
        ) : null}
        <label className="flex flex-col gap-1">
          <span className="font-semibold">{text.codeLabel}</span>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            aria-describedby={error ? 'portal-error' : undefined}
            className={`${FIELD} font-mono tracking-widest`}
          />
        </label>
        {error ? (
          <p id="portal-error" role="alert" className="text-flag-blocked">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={pending || code.length !== 6} className={BUTTON}>
          {text.verify}
        </button>
        <button type="button" onClick={() => setStep('data')} className="h-10 font-semibold underline">
          {text.changeData}
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={askForCode} className="flex flex-col gap-4">
      <p>{text.intro}</p>
      <div className="flex gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-semibold">{text.typeLabel}</span>
          <select value={type} onChange={(event) => setType(event.target.value)} className={FIELD}>
            {TYPES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="font-semibold">{text.cedulaLabel}</span>
          <input
            value={digits}
            onChange={(event) => setDigits(event.target.value.replace(/\D/g, '').slice(0, 9))}
            inputMode="numeric"
            autoComplete="off"
            required
            className={FIELD}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">{text.birthLabel}</span>
        <input
          value={birth}
          onChange={(event) => setBirth(event.target.value.replace(/[^\d/]/g, '').slice(0, 10))}
          placeholder={text.birthHint}
          inputMode="numeric"
          autoComplete="bday"
          required
          aria-describedby={error ? 'portal-error' : undefined}
          className={FIELD}
        />
      </label>
      {error ? (
        <p id="portal-error" role="alert" className="text-flag-blocked">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={BUTTON}>
        {text.requestCode}
      </button>
    </form>
  )
}
