import { ref, toRef, toValue } from 'vue'
import { useVueFlow } from '@vue-flow/core'

export const ProcessStatus = {
  ERROR: 'error',
  SKIPPED: 'skipped',
  CANCELLED: 'cancelled',
  FINISHED: 'finished',
  RUNNING: 'running',
} as const

export type ProcessStatusValue = (typeof ProcessStatus)[keyof typeof ProcessStatus]

/**
 * useWorkflowRunner
 *
 * Composable that simulates n8n-style workflow execution:
 * - Traverses node graph from start nodes
 * - Highlights current node (running) and edges
 * - Marks finished (green), error (red), cancelled (yellow), skipped (grey)
 * - Animates packet along edges on node completion
 */
export function useWorkflowRunner(options?: { cancelOnError?: boolean }) {
  const cancelOnError = ref(options?.cancelOnError ?? true)
  const { updateNodeData, updateEdgeData, getConnectedEdges, getEdges, getNodes } = useVueFlow()

  const isRunning = ref(false)
  const runningTasks = new Map<string, ReturnType<typeof setTimeout>>()
  const executedNodes = new Set<string>()
  const upcomingTasks = new Set<string>()

  // Simple successor lookup from edges
  function getSuccessors(nodeId: string): string[] {
    return getEdges.value
      .filter((e) => e.source === nodeId && !e.id.startsWith('sub-'))
      .map((e) => e.target)
  }

  function getPredecessors(nodeId: string): string[] {
    return getEdges.value
      .filter((e) => e.target === nodeId && !e.id.startsWith('sub-'))
      .map((e) => e.source)
  }

  async function runNode(nodeId: string, isStart = false): Promise<void> {
    if (executedNodes.has(nodeId)) return
    upcomingTasks.add(nodeId)

    // Wait for incoming edge animations to finish
    const incomers = getConnectedEdges.value(nodeId).filter((e) => e.target === nodeId)
    await Promise.all(incomers.map((e) => until(() => !e.data?.isAnimating)))

    upcomingTasks.delete(nodeId)
    if (!isRunning.value) return

    executedNodes.add(nodeId)
    updateNodeStatus(nodeId, ProcessStatus.RUNNING)

    const delay = isStart ? 0 : Math.floor(Math.random() * 1500) + 800

    return new Promise<void>((resolve) => {
      const timeout = setTimeout(async () => {
        const children = getSuccessors(nodeId)
        const willError = !isStart && Math.random() < 0.15

        if (willError) {
          updateNodeStatus(nodeId, ProcessStatus.ERROR)
          if (toValue(cancelOnError)) {
            await skipDescendants(nodeId)
            runningTasks.delete(nodeId)
            resolve()
            return
          }
        } else {
          updateNodeStatus(nodeId, ProcessStatus.FINISHED)
        }

        runningTasks.delete(nodeId)

        if (children.length > 0) {
          await Promise.all(children.map((child) => runNode(child)))
        }
        resolve()
      }, delay)

      runningTasks.set(nodeId, timeout)
    })
  }

  async function run(nodes: Array<{ id: string }>) {
    if (isRunning.value) return
    reset(nodes)
    isRunning.value = true

    // Find nodes with no predecessors
    const startNodes = nodes.filter((n) => getPredecessors(n.id).length === 0)
    await Promise.all(startNodes.map((n) => runNode(n.id, true)))

    clear()
  }

  function reset(nodes: Array<{ id: string }>) {
    clear()
    for (const node of nodes) {
      updateNodeStatus(node.id, null)
    }
  }

  async function skipDescendants(nodeId: string) {
    const children = getSuccessors(nodeId)
    for (const child of children) {
      updateNodeStatus(child, ProcessStatus.SKIPPED)
      await skipDescendants(child)
    }
  }

  async function stop() {
    isRunning.value = false

    for (const nodeId of upcomingTasks) {
      clearTimeout(runningTasks.get(nodeId))
      runningTasks.delete(nodeId)
      updateNodeStatus(nodeId, ProcessStatus.CANCELLED)
      await skipDescendants(nodeId)
    }

    for (const [nodeId, task] of runningTasks) {
      clearTimeout(task)
      runningTasks.delete(nodeId)
      updateNodeStatus(nodeId, ProcessStatus.CANCELLED)
      await skipDescendants(nodeId)
    }

    executedNodes.clear()
    upcomingTasks.clear()
  }

  function clear() {
    isRunning.value = false
    executedNodes.clear()
    runningTasks.clear()
  }

  function updateNodeStatus(nodeId: string, status: ProcessStatusValue | null) {
    updateNodeData(nodeId, { status })
  }

  return { run, stop, reset, isRunning, cancelOnError }
}

async function until(condition: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (condition()) {
        clearInterval(interval)
        resolve()
      }
    }, 100)
  })
}
