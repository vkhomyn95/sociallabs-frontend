import {
  TemplateButtonKind,
  TemplateButtonType,
  TemplateHeaderFormat,
  TemplateParameterFormat,
  type TemplateLanguageStructure,
} from '@/components/credential/whatsapp-bot/whatsappBot.types'

/** An approved template with named variables, a text header with a variable, and buttons of every kind. */
export const namedLanguage = (changes: Partial<TemplateLanguageStructure> = {}): TemplateLanguageStructure => ({
  language: 'en_US',
  status: 'APPROVED',
  approved: true,
  category: 'UTILITY',
  parameterFormat: TemplateParameterFormat.NAMED,
  header: { format: TemplateHeaderFormat.TEXT, text: 'Order {{order}}', variable: 'order', needsValue: true },
  body: { text: 'Hi {{name}}, order {{order}} is ready', variables: ['name', 'order'] },
  buttons: [
    { index: 0, type: TemplateButtonType.QUICK_REPLY, text: 'Thanks', valueKind: TemplateButtonKind.QUICK_REPLY, valueRequired: false },
    {
      index: 1,
      type: TemplateButtonType.URL,
      text: 'Track',
      url: 'https://shop.example/t/{{1}}',
      valueKind: TemplateButtonKind.URL,
      valueRequired: true,
    },
    { index: 2, type: TemplateButtonType.PHONE_NUMBER, text: 'Call', valueRequired: false },
  ],
  ...changes,
})

/** An approved template with {{1}}, {{2}} and an image header. */
export const positionalLanguage = (changes: Partial<TemplateLanguageStructure> = {}): TemplateLanguageStructure => ({
  language: 'uk',
  status: 'APPROVED',
  approved: true,
  category: 'MARKETING',
  parameterFormat: TemplateParameterFormat.POSITIONAL,
  header: { format: TemplateHeaderFormat.IMAGE, needsValue: true },
  body: { text: '{{1}}, your code is {{2}}', variables: ['1', '2'] },
  buttons: [],
  ...changes,
})
