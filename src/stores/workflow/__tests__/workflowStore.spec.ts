import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { WorkflowDto } from '@/core/workflow/dto'
import { useWorkflowStore, WorkflowFilter } from '..'
import { WorkflowService } from '../service'

vi.mock('../service', () => ({
  WorkflowService: { list: vi.fn(), create: vi.fn(), remove: vi.fn(), setActive: vi.fn(), nodeTypes: vi.fn() },
}))

const workflow = (id: number, name: string, active = false, description: string | null = null): WorkflowDto => ({
  id,
  name,
  description,
  active,
  revision: 1,
  activeVersionId: active ? 10 + id : null,
  hasUnpublishedChanges: false,
  nodes: [],
  connections: [],
})

describe('workflow store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(WorkflowService.nodeTypes).mockResolvedValue([])
  })

  it('filters by state and searches name and description', async () => {
    const store = useWorkflowStore()
    vi.mocked(WorkflowService.list).mockResolvedValueOnce([
      workflow(1, 'Support bot', true),
      workflow(2, 'Lead intake', false, 'Collects leads from support chats'),
      workflow(3, 'Digest', false),
    ])
    await store.LOAD()

    expect(store.countOf(WorkflowFilter.ACTIVE)).toBe(1)
    expect(store.countOf(WorkflowFilter.INACTIVE)).toBe(2)

    store.search = 'support'
    expect(store.filtered.map((w) => w.id)).toEqual([1, 2])
    store.filter = WorkflowFilter.INACTIVE
    expect(store.filtered.map((w) => w.id)).toEqual([2])
  })

  it('loads node types once', async () => {
    const store = useWorkflowStore()
    vi.mocked(WorkflowService.list).mockResolvedValue([])
    await store.LOAD()
    await store.LOAD()
    expect(WorkflowService.nodeTypes).toHaveBeenCalledTimes(1)
  })

  it('replaces a workflow after it was activated and marks it while switching', async () => {
    const store = useWorkflowStore()
    vi.mocked(WorkflowService.list).mockResolvedValueOnce([workflow(1, 'Support bot')])
    await store.LOAD()

    let answer!: (value: WorkflowDto) => void
    vi.mocked(WorkflowService.setActive).mockReturnValueOnce(new Promise((resolve) => (answer = resolve)))
    const switching = store.SET_ACTIVE(1, true)
    expect(store.isSwitching(1)).toBe(true)
    answer(workflow(1, 'Support bot', true))
    await switching

    expect(store.isSwitching(1)).toBe(false)
    expect(store.items[0]!.active).toBe(true)
  })

  it('keeps the list when a load fails and says why', async () => {
    const store = useWorkflowStore()
    vi.mocked(WorkflowService.list).mockRejectedValueOnce(new Error('offline'))
    await store.LOAD()
    expect(store.error).toBe('offline')
    expect(store.loading).toBe(false)
  })
})
