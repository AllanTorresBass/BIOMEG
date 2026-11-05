import type { CedulaType } from '@/types/lib/format.types'
import type { ClientRefusal, ValidClientInput } from '@/types/domain/client.types'

export type ClientValidation = { ok: true; value: ValidClientInput } | { ok: false; refusal: ClientRefusal }

export type CedulaPairValidation =
  | { ok: true; type: CedulaType | null; digits: string | null }
  | { ok: false; refusal: ClientRefusal }
