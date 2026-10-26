type Listener<A extends unknown[]> = (...args: A) => void

/**
 * Minimal synchronous event emitter with typed event names and payloads.
 *
 * @typeParam E map from event name to listener arguments
 */
export class TypedEmitter<E extends { [K in keyof E]: unknown[] }> {
  private readonly listeners: { [K in keyof E]?: Set<Listener<E[K]>> } = {}

  /** @returns function that removes the listener */
  on<K extends keyof E>(event: K, listener: Listener<E[K]>): () => void {
    const set = (this.listeners[event] ??= new Set())
    set.add(listener)
    return () => set.delete(listener)
  }

  emit<K extends keyof E>(event: K, ...args: E[K]): void {
    this.listeners[event]?.forEach((listener) => listener(...args))
  }
}
