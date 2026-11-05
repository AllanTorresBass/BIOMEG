import { API_LIMITS } from '@/lib/config/api'
import { withCommand } from '@/lib/server/api/with-command'
import { verifyPortalCode } from '@/lib/server/commands/portal'
import { portalCodeCheckSchema } from '@/types/portal/portal.schemas'

export const POST = withCommand(portalCodeCheckSchema, verifyPortalCode, { perMinute: API_LIMITS.portalPerMinute, audience: 'public' })
