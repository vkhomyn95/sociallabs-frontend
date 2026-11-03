import type { SlbIconName } from '@sociallabs/frontend-components'
import type { PropertyDescriptor } from '@/core/node-types/descriptor'
import type { ButtonKind } from '../keyboard-common/keyboardLayout'
import { FlowLayout } from './flowLayout'
import {
  GRID_COLUMNS,
  MAX_KEYBOARD_BUTTON_ROWS,
  ViberButtonAction,
  ViberButtonField,
  type ViberButton,
} from './viberKeyboard.types'

/** How a button of the action shows in the preview and what its value field means; the backend declares one field. */
interface ActionUi {
  readonly icon: SlbIconName | null
  /** Null when the action takes no value. */
  readonly value: { readonly label: string; readonly placeholder: string; readonly hint: string } | null
}

const ACTION_UI: Readonly<Record<ViberButtonAction, ActionUi>> = {
  [ViberButtonAction.REPLY]: {
    icon: null,
    value: { label: 'Reply', placeholder: 'order:42', hint: "Sent back as the user's message; the text when empty" },
  },
  [ViberButtonAction.OPEN_URL]: {
    icon: 'action_external',
    value: { label: 'URL', placeholder: 'https://example.com', hint: 'Opened in Viber’s browser' },
  },
  [ViberButtonAction.LOCATION_PICKER]: { icon: 'object_globe', value: null },
  [ViberButtonAction.SHARE_PHONE]: { icon: 'object_phone', value: null },
  [ViberButtonAction.NONE]: { icon: null, value: null },
}

/** Viber refuses location and phone requests in rich media (`ViberButtonAction.inRichMedia`). */
const RICH_MEDIA_ACTIONS: ReadonlySet<string> = new Set<ViberButtonAction>([
  ViberButtonAction.REPLY,
  ViberButtonAction.OPEN_URL,
  ViberButtonAction.NONE,
])

export const actionOf = (button: ViberButton): ViberButtonAction =>
  (button.action as ViberButtonAction | undefined) ?? ViberButtonAction.REPLY

/** What the fields of a button kind say about its size. */
interface SizeHints {
  readonly columns: string
  readonly rows: string
}

/** The declared fields of a button, with the value labelled by its action and the size hints of the kind. */
function fieldsOf(declared: readonly PropertyDescriptor[], button: ViberButton, hints: SizeHints): PropertyDescriptor[] {
  const value = ACTION_UI[actionOf(button)].value
  return declared.flatMap((property): PropertyDescriptor[] => {
    switch (property.name) {
      case ViberButtonField.VALUE:
        if (!value) return []
        return [{ ...property, displayName: value.label, placeholder: value.placeholder, description: value.hint }]
      case ViberButtonField.COLUMNS:
        return [{ ...property, description: hints.columns }]
      case ViberButtonField.ROWS:
        return [{ ...property, description: hints.rows }]
      default:
        return [property]
    }
  })
}

/** The action field offering what rich media takes, plus the chosen action so it still reads by name. */
function richMediaActions(fields: PropertyDescriptor[], button: ViberButton): PropertyDescriptor[] {
  const chosen = actionOf(button)
  return fields.map((property) => {
    if (property.name !== ViberButtonField.ACTION) return property
    const options = property.options.filter((option) => RICH_MEDIA_ACTIONS.has(String(option.value)) || option.value === chosen)
    return { ...property, options }
  })
}

const newButton = (index: number): ViberButton => ({ text: `Button ${index}`, action: ViberButtonAction.REPLY })

const iconOf = (button: ViberButton): SlbIconName | null => ACTION_UI[actionOf(button)].icon

/** Buttons of a keyboard: rows six columns wide, buttons up to two rows high. */
export const KEYBOARD_BUTTONS: ButtonKind<ViberButton> = {
  layout: new FlowLayout<ViberButton>(GRID_COLUMNS),
  newButton,
  icon: iconOf,
  fields: (declared, button) =>
    fieldsOf(declared, button, {
      columns: `1 to ${GRID_COLUMNS}; buttons that do not fit go to the next row`,
      rows: `1 or ${MAX_KEYBOARD_BUTTON_ROWS}`,
    }),
}

/** Buttons of rich media on cards of the given size; a button that does not fit starts the next card. */
export function richMediaButtons(columns: number, rows: number): ButtonKind<ViberButton> {
  return {
    layout: new FlowLayout<ViberButton>(columns),
    newButton,
    icon: iconOf,
    fields: (declared, button) => {
      const fields = fieldsOf(declared, button, {
        columns: `1 to ${columns}, the width of a card`,
        rows: `1 to ${rows}, the height of a card`,
      })
      return richMediaActions(fields, button)
    },
  }
}
