/**
 * Parameter templates: text with `{{ }}` expressions. Mirrors the backend TemplateParser exactly, so the
 * editor highlights and completes the same parts the engine evaluates.
 */

export enum SegmentKind {
  TEXT = 'TEXT',
  EXPRESSION = 'EXPRESSION',
}

export interface Segment {
  readonly kind: SegmentKind
  /** Source text; for expressions the part between the braces, untrimmed. */
  readonly text: string
  /** Offset of the segment in the template, including the opening braces of an expression. */
  readonly start: number
  /** Offset after the segment, including the closing braces of an expression. */
  readonly end: number
}

/**
 * Split a template into literal text and expressions. Closing braces are found outside string literals and
 * nested braces; an unclosed `{{` leaves the rest of the text literal, as on the backend.
 */
export function splitTemplate(text: string): Segment[] {
  const segments: Segment[] = []
  let literalStart = 0
  let i = 0
  while (i < text.length) {
    const open = text.indexOf('{{', i)
    if (open < 0) break
    const close = closingBraces(text, open + 2)
    if (close < 0) break
    if (open > literalStart) segments.push({ kind: SegmentKind.TEXT, text: text.slice(literalStart, open), start: literalStart, end: open })
    segments.push({ kind: SegmentKind.EXPRESSION, text: text.slice(open + 2, close), start: open, end: close + 2 })
    i = close + 2
    literalStart = i
  }
  if (literalStart < text.length || segments.length === 0) {
    segments.push({ kind: SegmentKind.TEXT, text: text.slice(literalStart), start: literalStart, end: text.length })
  }
  return segments
}

/** @returns index of the `}}` closing the expression that starts at `from`, -1 when none */
function closingBraces(text: string, from: number): number {
  let depth = 0
  let quote = ''
  for (let i = from; i < text.length; i++) {
    const c = text[i]!
    if (quote) {
      if (c === '\\') i++
      else if (c === quote) quote = ''
    } else if (c === "'" || c === '"' || c === '`') {
      quote = c
    } else if (c === '{') {
      depth++
    } else if (c === '}') {
      if (depth === 0) return text[i + 1] === '}' ? i : -1
      depth--
    }
  }
  return -1
}

/** Whether a parameter value is a template with at least one complete `{{ }}` expression. */
export function isExpression(value: unknown): value is string {
  return typeof value === 'string' && value.includes('{{') && splitTemplate(value).some((s) => s.kind === SegmentKind.EXPRESSION)
}

/** Expression text from the opening braces up to the caret, when the caret is inside one. */
export interface CaretContext {
  /** Expression source before the caret. */
  readonly before: string
  /** Offset in the template where the expression source starts (after `{{`). */
  readonly sourceStart: number
}

/**
 * Find the expression the caret is in, including one that is still being typed and not closed yet.
 *
 * @returns null when the caret is in literal text
 */
export function caretContext(text: string, caret: number): CaretContext | null {
  for (const segment of splitTemplate(text)) {
    if (segment.kind === SegmentKind.EXPRESSION && caret >= segment.start + 2 && caret <= segment.end - 2) {
      return { before: text.slice(segment.start + 2, caret), sourceStart: segment.start + 2 }
    }
    if (segment.kind === SegmentKind.TEXT && caret >= segment.start && caret <= segment.end) {
      // An unclosed `{{` before the caret means an expression is being typed.
      const open = text.lastIndexOf('{{', caret - 1)
      if (open >= segment.start && open + 2 <= caret) return { before: text.slice(open + 2, caret), sourceStart: open + 2 }
      return null
    }
  }
  return null
}
