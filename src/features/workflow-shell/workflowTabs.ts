import type { RouteLocationRaw } from 'vue-router'
import type { TabItem } from '@sociallabs/frontend-components'
import { RouteName } from '@/layouts/navigation'

/** The two faces of a workflow in its header, like n8n: the editor and the executions of the workflow. */
export enum WorkflowTab {
  EDITOR = 'editor',
  EXECUTIONS = 'executions',
}

export const WORKFLOW_TABS: readonly TabItem[] = [
  { key: WorkflowTab.EDITOR, label: 'Editor' },
  { key: WorkflowTab.EXECUTIONS, label: 'Executions' },
]

const ROUTES: Readonly<Record<WorkflowTab, RouteName>> = {
  [WorkflowTab.EDITOR]: RouteName.WORKFLOW_EDITOR,
  [WorkflowTab.EXECUTIONS]: RouteName.EXECUTION_VIEW,
}

export const isWorkflowTab = (key: string): key is WorkflowTab => Object.values<string>(WorkflowTab).includes(key)

/** @returns where a tab of the workflow lives; the executions tab opens the newest execution */
export const routeOfTab = (tab: WorkflowTab, workflowId: number): RouteLocationRaw => ({ name: ROUTES[tab], params: { id: workflowId } })
