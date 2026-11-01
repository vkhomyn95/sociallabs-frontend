/** Separators between entries typed or pasted at once: commas and line breaks. */
const SEPARATORS = /[,\n]+/

/** @returns the entries of typed or pasted text, trimmed, empty ones dropped */
export function entriesOf(text: string): string[] {
  return text
    .split(SEPARATORS)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

/** @returns the list with the new entries appended, without repeating one it has */
export function withEntries(list: readonly string[], entries: readonly string[]): string[] {
  const next = [...list]
  for (const entry of entries) {
    if (!next.includes(entry)) next.push(entry)
  }
  return next
}

/** @returns the list as a field value: absent when empty, so an emptied field is not stored */
export function listValue(list: readonly string[]): string[] | undefined {
  if (list.length === 0) return undefined
  return [...list]
}
