import type { BadgeColor } from '@sociallabs/frontend-components'
import { NodeKind, type NodeTypeDescriptor } from '@/core/node-types/descriptor'
import type { WorkflowDto } from '@/core/workflow/dto'
import { presentationOf, type NodePresentation } from '@/features/workflow-editor/presentation'

/** What a workflow card's menu does. */
export enum WorkflowCardAction {
  OPEN = 'OPEN',
  EXECUTE = 'EXECUTE',
  EXECUTIONS = 'EXECUTIONS',
  TOGGLE_ACTIVE = 'TOGGLE_ACTIVE',
  DELETE = 'DELETE',
}

export const isWorkflowCardAction = (key: string): key is WorkflowCardAction =>
  Object.values<string>(WorkflowCardAction).includes(key)

/** How the draft relates to what the triggers run. */
export enum PublishState {
  /** Never published: activating publishes the draft. */
  DRAFT_ONLY = 'DRAFT_ONLY',
  PUBLISHED = 'PUBLISHED',
  /** The draft has changes the active version does not. */
  UNPUBLISHED_CHANGES = 'UNPUBLISHED_CHANGES',
}

export const PUBLISH_STATE: Readonly<Record<PublishState, { label: string; color: BadgeColor }>> = {
  [PublishState.DRAFT_ONLY]: { label: 'Draft', color: 'gray' },
  [PublishState.PUBLISHED]: { label: 'Published', color: 'success' },
  [PublishState.UNPUBLISHED_CHANGES]: { label: 'Unpublished changes', color: 'warning' },
}

export function publishStateOf(workflow: Pick<WorkflowDto, 'activeVersionId' | 'hasUnpublishedChanges'>): PublishState {
  if (workflow.activeVersionId === null) return PublishState.DRAFT_ONLY
  return workflow.hasUnpublishedChanges ? PublishState.UNPUBLISHED_CHANGES : PublishState.PUBLISHED
}

/** A trigger of a workflow as its card shows it. */
export interface TriggerChip {
  readonly nodeId: string
  readonly name: string
  readonly presentation: NodePresentation
}

/** @returns the trigger nodes of a workflow, telling them apart by their type */
export function triggersOf(workflow: Pick<WorkflowDto, 'nodes'>, nodeTypes: readonly NodeTypeDescriptor[]): TriggerChip[] {
  return workflow.nodes
    .map((node) => ({ node, type: nodeTypes.find((t) => t.name === node.typeName && t.version === (node.typeVersion ?? 1)) }))
    .filter(({ type }) => type?.kind === NodeKind.TRIGGER)
    .map(({ node, type }) => ({ nodeId: node.nodeId, name: node.name, presentation: presentationOf(node.typeName, type) }))
}

/** Icon and accent of a workflow: those of its first trigger, a neutral one without triggers. */
export const workflowLook = (triggers: readonly TriggerChip[]): NodePresentation =>
  triggers[0]?.presentation ?? { icon: 'dev_nodes', color: 'var(--slb-color-gray-500)' }

const DAY_MS = 86_400_000

/** @returns `Today`, `Yesterday`, `3 days ago`, `2 weeks ago` or the date; `Never` without a date */
export function formatUpdated(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return 'Never'
  const date = new Date(iso)
  const days = Math.floor((now - date.getTime()) / DAY_MS)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  const weeks = Math.floor(days / 7)
  if (days < 30) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
  return date.toLocaleDateString()
}
