import type { ApiErrorCode } from '@/types/api.types'

/** Thrown by a service when the server answered with an error and no command result. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function errorMessage(error: unknown, fallback: string): string {
  return isApiError(error) && error.message ? error.message : fallback
}
