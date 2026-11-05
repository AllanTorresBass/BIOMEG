import { withCommand } from '@/lib/server/api/with-command'
import { deductInventory } from '@/lib/server/commands/registries'
import { inventorySchema } from '@/types/office/office.schemas'

export const POST = withCommand(inventorySchema, deductInventory)
