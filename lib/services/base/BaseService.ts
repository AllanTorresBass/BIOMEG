import { ApiError } from '@/lib/utils/errors'
import { strings } from '@/lib/strings'
import { isApiErrorBody, REFUSAL_RESULT_KEY } from '@/types/api.types'

const text = strings.pendingReview.api

/**
 * Request helpers only. Each service exposes its own named commands, because BIOMEG forbids
 * some operations outright, such as deleting a result, and an inherited delete could not honor that.
 */
export abstract class BaseService {
  protected constructor(private readonly basePath: string) {}

  private async read<T>(response: Response): Promise<T> {
    const body: unknown = await response.json().catch(() => null)
    if (response.ok) return body as T
    if (isApiErrorBody(body)) {
      const result = body.error.details?.[REFUSAL_RESULT_KEY]
      if (result !== undefined) return result as T
      throw new ApiError(response.status, body.error.code, body.error.message)
    }
    throw new ApiError(response.status, 'INTERNAL', text.failed)
  }

  protected async post<T>(path: string, input: unknown = {}): Promise<T> {
    const response = await fetch(`${this.basePath}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    })
    return this.read<T>(response)
  }

  protected async get<T>(path: string, query: Readonly<Record<string, string>>, signal?: AbortSignal): Promise<T> {
    const search = new URLSearchParams(query).toString()
    const response = await fetch(`${this.basePath}${path}?${search}`, signal ? { signal } : {})
    return this.read<T>(response)
  }
}
