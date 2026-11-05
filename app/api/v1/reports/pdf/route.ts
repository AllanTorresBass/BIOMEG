import { withCommand } from '@/lib/server/api/with-command'
import { generateReportPdf } from '@/lib/server/commands/report'
import { reportPdfSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(reportPdfSchema, generateReportPdf)
