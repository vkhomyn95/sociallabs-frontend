const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i
const HTML_TAG = /<[^>]*>/g

/** @returns the color when it is a hex color, undefined for anything else (an expression, a typo) */
export function previewColor(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const color = value.trim()
  return HEX_COLOR.test(color) ? color : undefined
}

/** @returns the text of a button without the simple HTML Viber allows in it (bold, italic, font color) */
export function plainText(text: string | undefined): string {
  return (text ?? '').replace(HTML_TAG, '').trim()
}

/** Perceived brightness above which dark text reads better than white. */
const LIGHT_BACKGROUND = 0.6

/** @returns white for a dark background color, undefined to keep the theme's text color */
export function textColorOn(background: string | undefined): string | undefined {
  if (!background) return undefined
  const hex = background.length === 4 ? [...background.slice(1)].map((digit) => digit + digit).join('') : background.slice(1)
  const [red, green, blue] = [0, 2, 4].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255)
  const brightness = 0.299 * red! + 0.587 * green! + 0.114 * blue!
  return brightness < LIGHT_BACKGROUND ? '#fff' : undefined
}
