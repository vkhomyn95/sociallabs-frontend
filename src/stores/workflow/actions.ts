import { isAxiosError } from 'axios'
import type { WorkflowDto } from '@/core/workflow/dto'
import { WorkflowService } from './service'
import type { WorkflowState } from './types'

export const messageOf = (error: unknown): string =>
  (isAxiosError(error) && (error.response?.data as { message?: string } | undefined)?.message) ||
  (error instanceof Error ? error.message : String(error))

function replace(state: WorkflowState, workflow: WorkflowDto): void {
  const index = state.items.findIndex((item) => item.id === workflow.id)
  if (index >= 0) state.items[index] = workflow
}

export const actions = {
  /** Load the workflows, and the node types once. */
  async LOAD(this: WorkflowState): Promise<void> {
    this.loading = true
    this.error = null
    try {
      const [items, nodeTypes] = await Promise.all([
        WorkflowService.list(),
        this.nodeTypes ?? WorkflowService.nodeTypes(),
      ])
      this.items = items
      this.nodeTypes = nodeTypes
    } catch (error) {
      this.error = messageOf(error)
    } finally {
      this.loading = false
    }
  },

  /** @returns the new workflow, also put first in the list */
  async CREATE(this: WorkflowState, name: string): Promise<WorkflowDto> {
    const workflow = await WorkflowService.create(name)
    this.items.unshift(workflow)
    return workflow
  },

  async REMOVE(this: WorkflowState, id: number): Promise<void> {
    await WorkflowService.remove(id)
    this.items = this.items.filter((workflow) => workflow.id !== id)
  },

  /** Start or stop the triggers of a workflow; @returns the workflow as it is now */
  async SET_ACTIVE(this: WorkflowState, id: number, active: boolean): Promise<WorkflowDto> {
    this.switching.push(id)
    try {
      const workflow = await WorkflowService.setActive(id, active)
      replace(this, workflow)
      return workflow
    } finally {
      this.switching = this.switching.filter((pending) => pending !== id)
    }
  },
}
