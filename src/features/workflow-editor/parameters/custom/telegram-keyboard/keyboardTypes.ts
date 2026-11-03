import { isRecord } from '@/core/node-types/parameters'
import { KeyboardType, type BotOperation } from './keyboard.types'

/** Operations that edit a message or send an invoice: Telegram takes only inline buttons there (`Keyboards.inlineMarkupOf`). */
const INLINE_ONLY_OPERATIONS: ReadonlySet<BotOperation> = new Set<BotOperation>([
  'EDIT_TEXT',
  'EDIT_CAPTION',
  'EDIT_MEDIA',
  'EDIT_KEYBOARD',
  'STOP_POLL',
  'EDIT_INLINE_TEXT',
  'SEND_INVOICE',
])

const ALL_TYPES: ReadonlySet<KeyboardType> = new Set(Object.values(KeyboardType))
const INLINE_TYPES: ReadonlySet<KeyboardType> = new Set([KeyboardType.NONE, KeyboardType.INLINE, KeyboardType.JSON])

/** @returns the keyboards the node's operation accepts; all of them when the operation is unknown */
export function keyboardTypesFor(parameters: unknown): ReadonlySet<KeyboardType> {
  const operation = isRecord(parameters) ? parameters.operation : undefined
  return INLINE_ONLY_OPERATIONS.has(operation as BotOperation) ? INLINE_TYPES : ALL_TYPES
}

export const isKeyboardType = (value: unknown): value is KeyboardType => ALL_TYPES.has(value as KeyboardType)
