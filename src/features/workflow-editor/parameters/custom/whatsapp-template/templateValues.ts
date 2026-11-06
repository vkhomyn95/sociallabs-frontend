import { isExpression } from '@/core/expression/template'
import { isRecord } from '@/core/node-types/parameters'
import {
  TemplateButtonKind,
  TemplateParameterFormat,
  type TemplateButtonStructure,
  type TemplateHeaderStructure,
  type TemplateLanguageStructure,
  type WhatsAppTemplateStructureResponse,
} from '@/components/credential/whatsapp-bot/whatsappBot.types'

/** Fields of the "Send a template" operation the template-aware fields read and fill. */
export enum SendTemplateField {
  TEMPLATE = 'template',
  LANGUAGE = 'language',
  HEADER_TYPE = 'headerType',
  HEADER_VARIABLE = 'headerVariable',
  BODY_VALUES = 'bodyValues',
  BUTTON_VALUES = 'buttonValues',
}

/** Mirror of the node's TemplateHeaderType: which header value the template is sent with. */
export enum TemplateHeaderType {
  NONE = 'NONE',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  LOCATION = 'LOCATION',
}

/** How far finding the chosen template's structure got; only READY lets the fields follow it. */
export enum TemplateLookup {
  NO_CREDENTIAL = 'NO_CREDENTIAL',
  NO_TEMPLATE = 'NO_TEMPLATE',
  /** The template's name is an expression, known only when the node runs. */
  DYNAMIC_TEMPLATE = 'DYNAMIC_TEMPLATE',
  LOADING = 'LOADING',
  FAILED = 'FAILED',
  NOT_FOUND = 'NOT_FOUND',
  /** The template has no language with the node's language code. */
  NO_LANGUAGE = 'NO_LANGUAGE',
  READY = 'READY',
}

/** One value of the node's "Body variables". */
export type BodyValue = { name?: string; value?: string }

/** One value of the node's "Button variables". */
export type ButtonValue = { index?: number; type?: string; value?: string }

/** What each kind of button value is. */
export const BUTTON_VALUE_LABELS: Readonly<Record<TemplateButtonKind, string>> = {
  [TemplateButtonKind.QUICK_REPLY]: 'Payload the trigger receives on a press',
  [TemplateButtonKind.URL]: 'End of the address',
  [TemplateButtonKind.COPY_CODE]: 'The code it copies',
  [TemplateButtonKind.FLOW]: 'Flow token',
}

/** The help shown instead of the template's fields, for each lookup that is not ready. */
export const LOOKUP_HINTS: Readonly<Record<Exclude<TemplateLookup, TemplateLookup.READY>, string>> = {
  [TemplateLookup.NO_CREDENTIAL]: 'Select a credential to see what the template asks for',
  [TemplateLookup.NO_TEMPLATE]: 'Choose a template to see its variables',
  [TemplateLookup.DYNAMIC_TEMPLATE]: 'The template is chosen by an expression; give the values in order or by name',
  [TemplateLookup.LOADING]: 'Loading the template…',
  [TemplateLookup.FAILED]: 'Could not load the template',
  [TemplateLookup.NOT_FOUND]: 'The business account has no template of this name',
  [TemplateLookup.NO_LANGUAGE]: 'The template has no such language',
}

/** Whether a text is an expression; not a type guard, so the text stays a string either way. */
const isDynamic = (text: string): boolean => isExpression(text)

/** Variables of a text, as Meta writes them: {{1}} or {{first_name}}. */
const VARIABLE = /\{\{\s*([A-Za-z0-9_]+)\s*}}/g

export type TextPart = { text: string; variable: boolean }

/** @returns the text split into plain parts and variables, for showing a template's text with its variables marked */
export function textParts(text: string | undefined): TextPart[] {
  if (!text) return []
  const parts: TextPart[] = []
  let from = 0
  for (const match of text.matchAll(VARIABLE)) {
    if (match.index > from) parts.push({ text: text.slice(from, match.index), variable: false })
    parts.push({ text: match[0], variable: true })
    from = match.index + match[0].length
  }
  if (from < text.length) parts.push({ text: text.slice(from), variable: false })
  return parts
}

/** @returns how a variable is written in the template */
export const variableLabel = (name: string): string => `{{${name}}}`

/**
 * @returns the language the node sends: the one of its code, or, when the code is an expression, the first approved
 * language (a template's languages carry the same variables); undefined when the template has no such language
 */
export function languageOf(
  structure: WhatsAppTemplateStructureResponse,
  language: unknown,
): TemplateLanguageStructure | undefined {
  const languages = structure.languages
  const code = typeof language === 'string' ? language.trim() : ''
  if (code === '' || isDynamic(code)) return languages.find((candidate) => candidate.approved) ?? languages[0]
  return languages.find((candidate) => candidate.language === code)
}

/** @returns the header value the template is sent with: none for a text without a variable */
export function headerTypeOf(header: TemplateHeaderStructure | undefined): TemplateHeaderType {
  if (!header || !header.needsValue) return TemplateHeaderType.NONE
  return TemplateHeaderType[header.format]
}

/** @returns the name the header's value is sent with; only templates with named variables send one */
export function headerVariableOf(language: TemplateLanguageStructure): string | undefined {
  if (language.parameterFormat !== TemplateParameterFormat.NAMED) return undefined
  return language.header?.variable
}

const recordsOf = (value: unknown): Record<string, unknown>[] => (Array.isArray(value) ? value.filter(isRecord) : [])
const textOf = (value: unknown): string => (typeof value === 'string' ? value : '')

/**
 * @returns one value per body variable, in the template's order: named variables keep the value given for their
 * name, positional ones the value at their position; values of variables the template no longer has are dropped
 */
export function bodyValuesFor(language: TemplateLanguageStructure, current: unknown): BodyValue[] {
  const given = recordsOf(current)
  const named = language.parameterFormat === TemplateParameterFormat.NAMED
  return language.body.variables.map((variable, index) => {
    if (!named) return { value: textOf(given[index]?.value) }
    const match = given.find((entry) => entry.name === variable)
    return { name: variable, value: textOf(match?.value) }
  })
}

/** @returns the template's buttons that are sent with a value */
export function valueButtonsOf(language: TemplateLanguageStructure): TemplateButtonStructure[] {
  return language.buttons.filter((button) => button.valueKind !== undefined)
}

/**
 * @returns one value per button that takes one, by its position among the template's buttons; an optional value
 * (a quick reply's payload, a flow token) is kept only when given, so Meta's defaults apply otherwise
 */
export function buttonValuesFor(language: TemplateLanguageStructure, current: unknown): ButtonValue[] {
  const given = recordsOf(current)
  const values: ButtonValue[] = []
  for (const button of valueButtonsOf(language)) {
    const value = textOf(given.find((entry) => entry.index === button.index)?.value)
    if (button.valueRequired || value !== '') values.push({ index: button.index, type: button.valueKind, value })
  }
  return values
}

/** @returns the button's value in the node's list, empty when none is given */
export function buttonValueOf(values: readonly ButtonValue[], index: number): string {
  return values.find((entry) => entry.index === index)?.value ?? ''
}

/** @returns whether the stored list already holds exactly these values */
export function sameValues(stored: unknown, values: readonly object[]): boolean {
  return JSON.stringify(stored ?? []) === JSON.stringify(values)
}
