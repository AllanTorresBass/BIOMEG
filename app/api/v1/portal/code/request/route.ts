import { API_LIMITS } from '@/lib/config/api'
import { withCommand } from '@/lib/server/api/with-command'
import { requestPortalCode } from '@/lib/server/commands/portal'
import { portalCodeRequestSchema } from '@/types/portal/portal.schemas'

export const POST = withCommand(portalCodeRequestSchema, requestPortalCode, { perMinute: API_LIMITS.portalPerMinute, audience: 'public' })
