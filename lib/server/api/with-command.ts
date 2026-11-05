import 'server-only'

import { NextResponse } from 'next/server'
import type { z } from 'zod'
import { API_LIMITS } from '@/lib/config/api'
import { takeRequestToken } from '@/lib/db/memory/rate-limit-store'
import { logger } from '@/lib/logger'
import { requestAddress } from '@/lib/server/audit'
import { getStaffContext } from '@/lib/server/session/current'
import { strings } from '@/lib/strings'
import { REFUSAL_RESULT_KEY, type ApiErrorBody, type ApiErrorCode } from '@/types/api.types'

const text = strings.pendingReview.api

export interface EndpointOptions {
  /** Requests per minute from one address. */
  perMinute?: number
  /** Status for an accepted command. 201 when it creates a record. */
  status?: 200 | 201
  /** Staff is the default, so a new endpoint can't be left open by accident. */
  audience?: 'staff' | 'public'
}

function errorResponse(status: number, code: ApiErrorCode, message: string, details?: Record<string, unknown>): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: { code, message, ...(details ? { details } : {}) } }, { status })
}

/** Same-origin only. Server Actions checked this for us, so each endpoint now does. */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return false
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

/** No session is 401, so the screen can go back to /entrar. A locked station still reaches the command, which refuses it. */
async function needsSession(options: EndpointOptions): Promise<NextResponse | null> {
  if (options.audience === 'public' || (await getStaffContext())) return null
  return errorResponse(401, 'SESSION', text.sessionEnded)
}

async function withinLimit(perMinute: number): Promise<boolean> {
  return takeRequestToken(`api:${(await requestAddress()) ?? 'local'}`, perMinute)
}

/** A refused command keeps its result in the error, with 428 when the screen must collect a gesture first. */
function refusalOf(result: unknown): NextResponse | null {
  if (typeof result !== 'object' || result === null) return null
  const fields = result as { ok?: unknown; error?: unknown; message?: unknown; need?: unknown }
  const refusedByOk = fields.ok === false
  const refusedByForm = typeof fields.error === 'string' && fields.error !== ''
  if (!refusedByOk && !refusedByForm) return null

  const message = refusedByForm ? String(fields.error) : typeof fields.message === 'string' ? fields.message : text.failed
  const details = { [REFUSAL_RESULT_KEY]: result }
  if (!fields.need) return errorResponse(409, 'STATE', message, details)
  const code: ApiErrorCode = fields.need === 'STEP_UP' ? 'STEP_UP' : /MOTIVO/.test(String(fields.need)) ? 'MOTIVO_REQUIRED' : 'CONFIRM'
  return errorResponse(428, code, message, details)
}

function respond(result: unknown, status: number): NextResponse {
  return refusalOf(result) ?? NextResponse.json(result ?? { ok: true }, { status })
}

function unexpected(error: unknown): NextResponse {
  logger.error('[api] unexpected failure', { error })
  return errorResponse(500, 'INTERNAL', text.failed)
}

/** The one pipeline for a write: origin, rate limit, JSON, Zod, then the command, which decides and audits. */
export function withCommand<Schema extends z.ZodType, Result>(
  schema: Schema,
  run: (input: z.infer<Schema>) => Promise<Result>,
  options: EndpointOptions = {},
) {
  return async (request: Request): Promise<NextResponse> => {
    if (!isSameOrigin(request)) return errorResponse(403, 'ORIGIN', text.failed)
    if (!(await withinLimit(options.perMinute ?? API_LIMITS.staffPerMinute))) return errorResponse(429, 'RATE_LIMIT', text.rateLimited)
    const noSession = await needsSession(options)
    if (noSession) return noSession

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return errorResponse(400, 'VALIDATION', text.invalid)
    }
    const parsed = schema.safeParse(body)
    if (!parsed.success) return errorResponse(400, 'VALIDATION', text.invalid)

    try {
      return respond(await run(parsed.data), options.status ?? 200)
    } catch (error: unknown) {
      return unexpected(error)
    }
  }
}

/** The pipeline for a read with no personal data in its query string. */
export function withQuery<Schema extends z.ZodType, Result>(
  schema: Schema,
  run: (input: z.infer<Schema>) => Promise<Result | null>,
  options: EndpointOptions = {},
) {
  return async (request: Request): Promise<NextResponse> => {
    if (!(await withinLimit(options.perMinute ?? API_LIMITS.staffPerMinute))) return errorResponse(429, 'RATE_LIMIT', text.rateLimited)
    const noSession = await needsSession(options)
    if (noSession) return noSession
    const parsed = schema.safeParse(Object.fromEntries(new URL(request.url).searchParams))
    if (!parsed.success) return errorResponse(400, 'VALIDATION', text.invalid)
    try {
      const result = await run(parsed.data)
      return result === null ? errorResponse(404, 'NOT_FOUND', text.failed) : NextResponse.json(result)
    } catch (error: unknown) {
      return unexpected(error)
    }
  }
}

/** For the file routes, which stream a PDF and so can't use the JSON pipeline. */
export async function isDownloadAllowed(): Promise<boolean> {
  return withinLimit(API_LIMITS.downloadsPerMinute)
}
