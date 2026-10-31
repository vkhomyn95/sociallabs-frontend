import type { PropertyOption } from './descriptor'

/** Which field's choices to load, with the credential and the form values it is edited with. */
export interface OptionsQuery {
  typeKey: string
  /** Property path in the schema, e.g. `model` or `options.voice`. */
  property: string
  credentialId: number | null
  parameters: Readonly<Record<string, unknown>>
}

export type OptionsFetcher = (query: OptionsQuery) => Promise<PropertyOption[]>

/**
 * Loads the choices of fields that load them from the server. Choices are kept per node type, field and credential,
 * so reopening a node or a second node of the same type asks once; concurrent requests share one call, and a failed
 * call is forgotten so the next attempt asks again.
 */
export class OptionsLoader {
  private readonly cache = new Map<string, Promise<PropertyOption[]>>()

  constructor(private readonly fetch: OptionsFetcher) {}

  /** @param refresh ask the server again instead of reusing the kept choices */
  load(query: OptionsQuery, refresh = false): Promise<PropertyOption[]> {
    const key = `${query.typeKey}|${query.property}|${query.credentialId ?? ''}`
    const kept = this.cache.get(key)
    if (kept && !refresh) return kept

    const loading = this.fetch(query)
    this.cache.set(key, loading)
    loading.catch(() => {
      if (this.cache.get(key) === loading) this.cache.delete(key)
    })
    return loading
  }
}
