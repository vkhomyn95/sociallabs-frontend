import type { Component } from 'vue'
import type { NodeParamsMap, SchemaNodeTypeKey } from '@/generated/node-types'
import TelegramKeyboardField from './custom/telegram-keyboard/KeyboardField.vue'
import RichMediaButtonsField from './custom/viber-keyboard/RichMediaButtonsField.vue'
import ViberKeyboardField from './custom/viber-keyboard/ViberKeyboardField.vue'
import ListSectionsField from './custom/whatsapp-interactive/ListSectionsField.vue'
import ReplyButtonsField from './custom/whatsapp-interactive/ReplyButtonsField.vue'
import TemplateBodyValuesField from './custom/whatsapp-template/TemplateBodyValuesField.vue'
import TemplateButtonValuesField from './custom/whatsapp-template/TemplateButtonValuesField.vue'
import TemplateHeaderTypeField from './custom/whatsapp-template/TemplateHeaderTypeField.vue'
import TemplateHeaderVariableField from './custom/whatsapp-template/TemplateHeaderVariableField.vue'

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
    'viber.botAction@1': { keyboard: ViberKeyboardField, richButtons: RichMediaButtonsField },
    'whatsapp.botAction@1': {
      buttons: ReplyButtonsField,
      sections: ListSectionsField,
      headerType: TemplateHeaderTypeField,
      headerVariable: TemplateHeaderVariableField,
      bodyValues: TemplateBodyValuesField,
      buttonValues: TemplateButtonValuesField,
    },
  })
}

export function overrideFor(typeKey: string, property: string): Component | undefined {
  const forType = fieldOverrides()[typeKey as SchemaNodeTypeKey] as Record<string, Component> | undefined
  return forType?.[property]
}
