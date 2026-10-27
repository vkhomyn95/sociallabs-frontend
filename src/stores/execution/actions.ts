import { isAxiosError } from 'axios'
import { ExecutionService } from './service'
import type { ExecutionFilters, ExecutionState } from './types'

const messageOf = (error: unknown): string =>
  (isAxiosError(error) && (error.response?.data as { message?: string } | undefined)?.message) ||
  (error instanceof Error ? error.message : String(error))

export const actions = {
  /** Load the first page for the current filters, replacing what is listed. */
  async LOAD(this: ExecutionState): Promise<void> {
    const generation = ++this.generation
    this.loading = true
    this.error = null
    try {
      const page = await ExecutionService.list(this.filters)
      if (generation !== this.generation) return
      this.items = page.items
      this.nextCursor = page.nextCursor
    } catch (error) {
      if (generation === this.generation) this.error = messageOf(error)
    } finally {
      if (generation === this.generation) this.loading = false
    }
  },

  /** Append the next page; does nothing while loading or after the last page. */
  async LOAD_MORE(this: ExecutionState): Promise<void> {
    if (!this.nextCursor || this.loading || this.loadingMore) return
    const generation = this.generation
    this.loadingMore = true
    try {
      const page = await ExecutionService.list(this.filters, this.nextCursor)
      if (generation !== this.generation) return
      const known = new Set(this.items.map((execution) => execution.id))
      this.items.push(...page.items.filter((execution) => !known.has(execution.id)))
      this.nextCursor = page.nextCursor
    } catch (error) {
      this.error = messageOf(error)
    } finally {
      this.loadingMore = false
    }
  },

  /**
   * Fetch the newest page and merge it in: new executions go on top, listed ones get their current status.
   * Pages further down are left alone, so a refresh never jumps the scroll position.
   */
  async REFRESH(this: ExecutionState): Promise<void> {
    if (this.loading) return
    const generation = this.generation
    try {
      const page = await ExecutionService.list(this.filters)
      if (generation !== this.generation) return
      const fresh = new Map(page.items.map((execution) => [execution.id, execution]))
      const listed = new Set(this.items.map((execution) => execution.id))
      const added = page.items.filter((execution) => !listed.has(execution.id))
      this.items = [...added, ...this.items.map((execution) => fresh.get(execution.id) ?? execution)]
      if (!this.items.length) this.nextCursor = page.nextCursor
    } catch {
      // A failed background refresh keeps the list as it is; the next one may succeed.
    }
  },

  /** Change filters and reload; omitted fields keep their value. */
  async SET_FILTERS(this: ExecutionState & { LOAD(): Promise<void> }, filters: Partial<ExecutionFilters>): Promise<void> {
    this.filters = { ...this.filters, ...filters }
    await this.LOAD()
  },

  async REMOVE(this: ExecutionState, id: number): Promise<void> {
    await ExecutionService.remove(id)
    this.items = this.items.filter((execution) => execution.id !== id)
  },

  /** Re-run an execution with its trigger item; @returns id of the new execution */
  async RETRY(this: ExecutionState & { REFRESH(): Promise<void> }, id: number): Promise<number> {
    const executionId = await ExecutionService.retry(id)
    await this.REFRESH()
    return executionId
  },

  /** Load workflow names once, for the filter and the list. */
  async LOAD_WORKFLOWS(this: ExecutionState, force = false): Promise<void> {
    if (this.workflows.length && !force) return
    try {
      this.workflows = await ExecutionService.workflows()
    } catch {
      // Names are cosmetic; rows fall back to the workflow number.
    }
  },
}
