import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ExecutionMode, ExecutionStatus, type ExecutionPage, type ExecutionSummary } from '@/core/execution/types'
import { useExecutionStore } from '..'
import { ExecutionService } from '../service'

vi.mock('../service', () => ({
  PAGE_SIZE: 30,
  ExecutionService: { list: vi.fn(), remove: vi.fn(), retry: vi.fn(), workflows: vi.fn() },
}))

const list = vi.mocked(ExecutionService.list)

const execution = (id: number, status = ExecutionStatus.SUCCESS): ExecutionSummary => ({
  id,
  workflowId: 1,
  workflowVersionId: 3,
  status,
  mode: ExecutionMode.TRIGGER,
  triggerNodeId: 't',
  retryOfId: null,
  startedAt: '2026-10-26T10:00:00Z',
  finishedAt: null,
  durationMs: 10,
  nodeCount: 2,
  errorNodeId: null,
  errorMessage: null,
})

const page = (ids: number[], nextCursor: string | null = null, status?: ExecutionStatus): ExecutionPage => ({
  items: ids.map((id) => execution(id, status)),
  nextCursor,
  hasMore: nextCursor !== null,
})

describe('execution store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads the first page for the filters and pages on with the cursor', async () => {
    const store = useExecutionStore()
    list.mockResolvedValueOnce(page([5, 4], 'c1')).mockResolvedValueOnce(page([3]))

    await store.SET_FILTERS({ workflowId: 1 })
    expect(list).toHaveBeenLastCalledWith({ workflowId: 1, status: null })
    expect(store.hasMore).toBe(true)

    await store.LOAD_MORE()
    expect(list).toHaveBeenLastCalledWith({ workflowId: 1, status: null }, 'c1')
    expect(store.items.map((e) => e.id)).toEqual([5, 4, 3])
    expect(store.hasMore).toBe(false)
  })

  it('ignores a slower answer to a filter that was changed meanwhile', async () => {
    const store = useExecutionStore()
    let answerFirst!: (value: ExecutionPage) => void
    list.mockReturnValueOnce(new Promise((resolve) => (answerFirst = resolve))).mockResolvedValueOnce(page([9]))

    const first = store.SET_FILTERS({ status: ExecutionStatus.ERROR })
    await store.SET_FILTERS({ status: null })
    answerFirst(page([1, 2]))
    await first

    expect(store.items.map((e) => e.id)).toEqual([9])
    expect(store.loading).toBe(false)
  })

  it('puts new executions on top and updates the status of listed ones on refresh', async () => {
    const store = useExecutionStore()
    list.mockResolvedValueOnce(page([5, 4], null, ExecutionStatus.RUNNING))
    await store.LOAD()
    expect(store.hasUnfinished).toBe(true)

    list.mockResolvedValueOnce(page([6, 5, 4]))
    await store.REFRESH()

    expect(store.items.map((e) => [e.id, e.status])).toEqual([
      [6, ExecutionStatus.SUCCESS],
      [5, ExecutionStatus.SUCCESS],
      [4, ExecutionStatus.SUCCESS],
    ])
    expect(store.hasUnfinished).toBe(false)
  })

  it('keeps the list when a background refresh fails, and reports a failed load', async () => {
    const store = useExecutionStore()
    list.mockResolvedValueOnce(page([1]))
    await store.LOAD()

    list.mockRejectedValueOnce(new Error('offline'))
    await store.REFRESH()
    expect(store.items).toHaveLength(1)
    expect(store.error).toBeNull()

    list.mockRejectedValueOnce(new Error('offline'))
    await store.LOAD()
    expect(store.error).toBe('offline')
  })

  it('names workflows and their state, falling back for a deleted one', async () => {
    const store = useExecutionStore()
    vi.mocked(ExecutionService.workflows).mockResolvedValueOnce([{ id: 1, name: 'Support bot', active: true }])
    await store.LOAD_WORKFLOWS()

    expect(store.workflowName(1)).toBe('Support bot')
    expect(store.workflowName(2)).toBe('Workflow #2')
    expect(store.workflowActive(1)).toBe(true)
    expect(store.workflowActive(2)).toBeNull()
  })

  it('removes a deleted execution from the list', async () => {
    const store = useExecutionStore()
    list.mockResolvedValueOnce(page([2, 1]))
    await store.LOAD()

    await store.REMOVE(2)
    expect(ExecutionService.remove).toHaveBeenCalledWith(2)
    expect(store.items.map((e) => e.id)).toEqual([1])
  })
})
