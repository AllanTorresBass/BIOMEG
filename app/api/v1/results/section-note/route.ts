import { withCommand } from '@/lib/server/api/with-command'
import { saveSectionNote } from '@/lib/server/commands/results'
import { sectionNoteSchema } from '@/types/orders/orders.schemas'

export const POST = withCommand(sectionNoteSchema, saveSectionNote)
