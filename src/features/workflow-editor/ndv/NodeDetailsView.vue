<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import {
  SlbAlert,
  SlbButton,
  SlbIcon,
  SlbInput,
  SlbResizable,
  SlbResizableHandle,
  SlbResizablePanel,
  SlbTab,
  slbToast,
  type TabItem,
} from '@sociallabs/frontend-components'
import type { WorkflowView } from '@/core/editor/WorkflowView'
import { NodeRunState, type ExecutionTracker, type NodeRunView } from '@/core/execution/ExecutionTracker'
import { RunDataView } from '@/core/execution/RunDataView'
import type { RunData } from '@/core/execution/types'
import { ExpressionCompletions } from '@/core/expression/completions'
import { itemPath, nodePath } from '@/core/expression/paths'
import { NodeKind, NodeTypeStatus } from '@/core/node-types/descriptor'
import type { NodeTypeCatalog } from '@/core/node-types/NodeTypeCatalog'
import { validateParameters } from '@/core/node-types/parameters'
import { outputPorts } from '@/core/node-types/ports'
import { connectionKey, typeKeyOf, type NodeId, type NodeModel, type NodeSettings } from '@/core/workflow/model'
import { executionApi } from '../api/executionApi'
import CredentialField from '../credentials/CredentialField.vue'
import { provideExpressionContext } from '../expression/expressionContext'
import ParameterForm from '../parameters/ParameterForm.vue'
import { presentationOf } from '../presentation'
import RunDataPanel from '../run-data/RunDataPanel.vue'
import type { RunSource } from '../run-data/runSources'
import NodeSettingsForm from '../settings/NodeSettingsForm.vue'
import { useOpenNode } from './useOpenNode'

/**
 * Node details view: what the node received in the last run, its parameters and settings, and what it
 * emitted. Every change is a command of the view, so it is saved and undoable like canvas edits; a read-only
 * view (an execution) shows the same panels without letting anything change.
 */
const props = defineProps<{
  view: WorkflowView
  catalog: NodeTypeCatalog
  nodeId: NodeId
  runData: RunData
  tracker: ExecutionTracker
  executing: boolean
}>()

const emit = defineEmits<{
  close: []
  execute: []
}>()

enum Tab {
  PARAMETERS = 'parameters',
  SETTINGS = 'settings',
}

const TABS: TabItem[] = [
  { key: Tab.PARAMETERS, label: 'Parameters' },
  { key: Tab.SETTINGS, label: 'Settings' },
]

const doc = props.view.document
const commands = props.view.commands
const readonly = commands === null
const node = useOpenNode(doc, props.nodeId, () => emit('close'))
const tab = ref<string>(Tab.PARAMETERS)

const descriptor = computed(() => (node.value ? props.catalog.get(typeKeyOf(node.value)) : undefined))
const presentation = computed(() => presentationOf(node.value?.type ?? '', descriptor.value))
const isTrigger = computed(() => descriptor.value?.kind === NodeKind.TRIGGER)
// Sub-nodes never run with items, so they have neither input nor output data.
const isSupply = computed(() => descriptor.value?.kind === NodeKind.SUPPLY)
const hasSchema = computed(() => (descriptor.value?.properties.length ?? 0) > 0)

// ─── Run data ────────────────────────────────────────────────────────

const runView = shallowRef<NodeRunView | undefined>(props.tracker.view(props.nodeId))
const offRun = props.tracker.events.on('node', (id, view) => {
  if (id === props.nodeId) runView.value = view ?? undefined
})
onBeforeUnmount(offRun)

// Connections are read from the document; the node ref changes on every edit, which refreshes them too.
const data = computed(() => {
  void node.value
  return new RunDataView(doc, props.runData)
})
const running = computed(() => runView.value?.state === NodeRunState.RUNNING)

function portLabel(source: NodeModel, index: number): string {
  const type = props.catalog.get(typeKeyOf(source))
  const ports = type ? outputPorts(type, source) : []
  return ports.length > 1 ? (ports[index]?.label ?? `Output ${index + 1}`) : ''
}

const inputSources = computed<RunSource[]>(() =>
  data.value.inputs(props.nodeId).map((input, index) => {
    const port = portLabel(input.source, input.connection.sourceOutput)
    return {
      key: connectionKey(input.connection),
      label: port ? `${input.source.name} → ${port}` : input.source.name,
      ports: [{ label: '', items: input.items }],
      // The first input is the node's current item; other inputs are reached through the node name.
      mapping: index === 0 ? itemPath : (path) => nodePath(input.source.name, path),
    }
  }),
)

const outputSources = computed<RunSource[]>(() => {
  const record = data.value.record(props.nodeId)
  const current = node.value
  if (!record || !current) return []
  const labels = descriptor.value ? outputPorts(descriptor.value, current).map((p) => p.label) : []
  return [{ key: 'output', label: current.name, ports: record.output.map((items, i) => ({ label: labels[i] ?? '', items })) }]
})

const outputError = computed(() => data.value.record(props.nodeId)?.error ?? null)
const inputEmptyText = computed(() =>
  props.runData.nodes && Object.keys(props.runData.nodes).length
    ? 'No input: the nodes before this one did not run in the last execution'
    : 'Execute the workflow to see the data this node receives',
)

const outputEmptyText = computed(() => {
  if (runView.value?.state === NodeRunState.SKIPPED) return 'Skipped: no items reached this node'
  return readonly ? 'This node did not run in this execution' : 'Execute the workflow to see the output'
})

// ─── Expressions ─────────────────────────────────────────────────────

const completions = computed(() => new ExpressionCompletions(data.value.completionSample(props.nodeId)))

provideExpressionContext({
  completions: () => completions.value,
  hasData: () => data.value.inputs(props.nodeId).length > 0,
  preview: (template) =>
    executionApi.preview({
      template,
      workflowId: props.view.workflowId,
      itemIndex: 0,
      input: data.value.previewInput(props.nodeId),
      // Only nodes the template names are sent, to keep the request small.
      nodes: data.value.upstream(props.nodeId).filter((n) => template.includes(n.name) || template.includes(n.id)),
    }),
})

// ─── Editing ─────────────────────────────────────────────────────────

const issues = computed(
  () => new Map(validateParameters(descriptor.value?.properties ?? [], node.value?.parameters ?? {}).map((i) => [i.path, i.message])),
)

const name = ref(node.value?.name ?? '')
watch(
  () => node.value?.name,
  (value) => (name.value = value ?? ''),
)

function commitName(): void {
  const current = node.value
  if (!current) return
  const next = name.value.trim()
  if (!next || next === current.name) {
    name.value = current.name
    return
  }
  if (doc.nodes().some((n) => n.id !== current.id && n.name === next)) {
    slbToast.warning(`A node named "${next}" already exists`)
    name.value = current.name
    return
  }
  commands?.update(props.nodeId, 'name', next)
}

const setParameters = (values: Record<string, unknown>) => commands?.update(props.nodeId, 'parameters', values)
const setCredential = (id: number | null) => commands?.update(props.nodeId, 'credentialId', id)
const setSettings = (settings: NodeSettings) => commands?.update(props.nodeId, 'settings', settings)
const setDisabled = (disabled: boolean) => commands?.update(props.nodeId, 'disabled', disabled)
const setNotes = (notes: string | null) => commands?.update(props.nodeId, 'notes', notes)

// ─── Closing ─────────────────────────────────────────────────────────

const root = ref<HTMLElement>()

function onKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return
  // Escape inside a dialog opened on top (credential connect) belongs to that dialog.
  const target = event.target as Node | null
  if (target && target !== document.body && !root.value?.contains(target)) return
  emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="wf-ndv-backdrop" @mousedown.self="emit('close')">
    <div v-if="node" ref="root" class="wf-ndv" role="dialog" aria-modal="true" :aria-label="node.name">
      <header class="wf-ndv__header">
        <div class="wf-ndv__icon" :style="{ background: presentation.color }">
          <SlbIcon :name="presentation.icon" :size="18" color="#fff" />
        </div>
        <SlbInput
          v-model="name"
          size="sm"
          class="wf-ndv__name"
          aria-label="Node name"
          :disabled="readonly"
          @blur="commitName"
          @keydown.enter="commitName"
        />
        <span class="wf-ndv__type">{{ descriptor?.displayName ?? node.type }}</span>
        <span v-if="readonly" class="wf-ndv__readonly" title="Parameters of the execution's workflow; edit them in the editor">
          <SlbIcon name="object_lock" :size="12" /> Read-only
        </span>
        <SlbButton v-else size="sm" icon-left="media_play" :loading="executing" :disabled="executing" @click="emit('execute')">
          Execute workflow
        </SlbButton>
        <button type="button" class="wf-ndv__close" title="Close (Esc)" @click="emit('close')">
          <SlbIcon name="action_close" :size="18" />
        </button>
      </header>

      <SlbResizable class="wf-ndv__body" :storage-key="isSupply ? 'wf-ndv-supply' : isTrigger ? 'wf-ndv-trigger' : 'wf-ndv'">
        <template v-if="!isTrigger && !isSupply">
          <SlbResizablePanel :default-size="28" :min-size="15" collapsible>
            <RunDataPanel title="Input" :sources="inputSources" :empty-text="inputEmptyText" />
          </SlbResizablePanel>
          <SlbResizableHandle />
        </template>

        <SlbResizablePanel :default-size="isSupply ? 100 : isTrigger ? 55 : 44" :min-size="30">
          <div class="wf-ndv__editor">
            <SlbTab v-model="tab" :tabs="TABS" />
            <div class="wf-ndv__form">
              <!-- Inert keeps a read-only form visible but out of reach of clicks and focus; the parent still scrolls. -->
              <div class="wf-ndv__fields" :inert="readonly">
                <template v-if="tab === Tab.PARAMETERS">
                  <SlbAlert v-if="!descriptor" variant="warning">Unknown node type {{ node.type }}@{{ node.typeVersion }}</SlbAlert>
                  <SlbAlert v-else-if="descriptor.status === NodeTypeStatus.PREVIEW" variant="info">
                    This node is not runnable yet; executions stop at it.
                  </SlbAlert>
                  <CredentialField
                    v-if="descriptor?.credentials.types.length"
                    :types="descriptor.credentials.types"
                    :required="descriptor.credentials.required"
                    :model-value="node.credentialId"
                    @update:model-value="setCredential"
                  />
                  <ParameterForm
                    v-if="descriptor && hasSchema"
                    :properties="descriptor.properties"
                    :values="node.parameters"
                    :type-key="descriptor.key"
                    :issues="issues"
                    @update:values="setParameters"
                  />
                  <p v-else-if="descriptor" class="wf-ndv__empty">This node has no parameters.</p>
                </template>
                <NodeSettingsForm
                  v-else
                  :settings="node.settings"
                  :disabled="node.disabled"
                  :notes="node.notes"
                  @update:settings="setSettings"
                  @update:disabled="setDisabled"
                  @update:notes="setNotes"
                />
              </div>
            </div>
          </div>
        </SlbResizablePanel>

        <SlbResizableHandle v-if="!isSupply" />
        <SlbResizablePanel v-if="!isSupply" :default-size="isTrigger ? 45 : 28" :min-size="15" collapsible>
          <RunDataPanel
            title="Output"
            :sources="outputSources"
            :running="running"
            :error="outputError"
            :empty-text="outputEmptyText"
          />
        </SlbResizablePanel>
      </SlbResizable>
    </div>
  </div>
</template>

<style scoped lang="scss">
.wf-ndv-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  padding: 24px;
  background: rgba(15, 23, 42, 0.45);
}

.wf-ndv {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  background: var(--slb-color-surface, #fff);
  border-radius: var(--slb-radius-lg);
  box-shadow: var(--slb-shadow-lg, 0 20px 50px rgba(0, 0, 0, 0.25));
}

.wf-ndv__readonly {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 2px 8px;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
  background: var(--slb-color-gray-100);
  border-radius: var(--slb-radius-full);
}

.wf-ndv__header {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid var(--slb-color-border);
}

.wf-ndv__icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: var(--slb-radius-md);
}

.wf-ndv__name {
  width: 280px;
}

.wf-ndv__type {
  margin-right: auto;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
}

.wf-ndv__close {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  color: var(--slb-color-text-muted);
  background: none;
  border: 0;
  border-radius: var(--slb-radius-md);
  cursor: pointer;

  &:hover {
    color: var(--slb-color-text);
    background: var(--slb-color-gray-100);
  }
}

.wf-ndv__body {
  flex: 1;
  min-height: 0;
}

.wf-ndv__editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
}

.wf-ndv__form {
  flex: 1;
  min-height: 0;
  padding: 16px;
  overflow-y: auto;
}

.wf-ndv__fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wf-ndv__empty {
  margin: 0;
  font-size: var(--slb-font-sm);
  color: var(--slb-color-text-muted);
}
</style>
