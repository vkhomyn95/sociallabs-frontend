import type { Component } from 'vue'
import type { NodeParamsMap, SchemaNodeTypeKey } from '@/generated/node-types'
import TelegramKeyboardField from './custom/telegram-keyboard/KeyboardField.vue'

/**
 * Custom editors for single fields of a node type, the escape hatch for parameters a generic field cannot
 * edit well (e.g. reply keyboards). Keys are checked against the generated parameter types, so an override
 * cannot point at a property that does not exist. New field types are not added for one node.
 */
export type FieldOverrides = {
  [K in SchemaNodeTypeKey]?: Partial<Record<keyof NodeParamsMap[K] & string, Component>>
}

let overrides: FieldOverrides | null = null

/** Built on first use: the custom editors render nested forms, which import this module back. */
function fieldOverrides(): FieldOverrides {
  return (overrides ??= {
    'telegram.botAction@2': { keyboard: TelegramKeyboardField },
  })
}

export function overrideFor(typeKey: string, property: string): Component | undefined {
  const forType = fieldOverrides()[typeKey as SchemaNodeTypeKey] as Record<string, Component> | undefined
  return forType?.[property]
}
