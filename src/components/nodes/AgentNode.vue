<script setup lang="ts">
import { ref, computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { NodeType, type NodeInstance, type NodeOutput } from '@/stores/node/types'
import { NodeColors, NodeIcons } from '@/stores/node/constants'
import { getNodeDefinition } from '@/stores/node/definitions'
import SingleOutputHandle from '../handle/SingleOutputHandle.vue'

interface OutputPort {
  key:         string
  index:       number
  displayName: string
  color:       string
  position:    'right' | 'bottom'
}

const PORT_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#6366f1']

const props = defineProps<{
  data: NodeInstance & { label?: string; status?: string | null }
  sourcePosition?: Position
  targetPosition?: Position
}>()

const emit = defineEmits<{
  delete:           [nodeId: string]
  configure:        [nodeId: string]
  execute:          [nodeId: string]
  'open-sub-panel': [nodeId: string, portKey: string]
}>()

const showActions = ref(false)
const isTrigger   = computed(() => props.data.type === NodeType.TRIGGER)
const nodeDef     = computed(() => getNodeDefinition(props.data.discriminator))

const allOutputPorts = computed((): OutputPort[] => {
  const def = nodeDef.value
  if (!def) return [{ key: '0', index: 0, displayName: 'Output', color: PORT_COLORS[0], position: 'right' }]

  if (def.dynamicOutputs) {
    const rules: Array<{ outputIndex: number; outputName?: string }> =
      props.data.parameters?.rules ?? []
    const ports: OutputPort[] = rules.map((rule, i) => ({
      key:         String(i),
      index:       rule.outputIndex ?? i,
      displayName: rule.outputName || `Output ${i + 1}`,
      color:       PORT_COLORS[i % PORT_COLORS.length],
      position:    'right',
    }))
    if (props.data.parameters?.fallbackToDefault !== false) {
      ports.push({
        key: 'fallback', index: ports.length,
        displayName: 'Fallback', color: '#9ca3af', position: 'right',
      })
    }
    return ports
  }

  const outputKeys = Object.keys(def.outputs ?? {})
  if (outputKeys.length === 0) return []
  return outputKeys.map((key, i) => {
    const out: NodeOutput = def.outputs[key]
    return {
      key,
      index:       i,
      displayName: out.displayName,
      color:       out.color ?? PORT_COLORS[i % PORT_COLORS.length],
      position:    out.position ?? 'right',
    }
  })
})

const rightPorts  = computed(() => allOutputPorts.value.filter(p => p.position === 'right'))
const bottomPorts = computed(() => allOutputPorts.value.filter(p => p.position === 'bottom'))

const configuredBottomPorts = computed(() => {
  const s = new Set<string>()
  const p = props.data.parameters ?? {}
  if (p.modelId?.modelId) s.add('ai_model')
  if (p.memory?.enabled === true) s.add('ai_memory')
  if (Array.isArray(p.toolNames) && p.toolNames.length > 0) s.add('ai_tool')
  return s
})

const statusClass = computed(() => {
  switch (props.data.status) {
    case 'running':   return 'slb_agent-node--running'
    case 'finished':  return 'slb_agent-node--finished'
    case 'error':     return 'slb_agent-node--error'
    case 'cancelled': return 'slb_agent-node--cancelled'
    case 'skipped':   return 'slb_agent-node--skipped'
    default: return ''
  }
})

const onBottomPortClick = (port: OutputPort, e: MouseEvent) => {
  e.stopPropagation()
  emit('open-sub-panel', props.data.nodeId, port.key)
}
</script>

<template>
  <div
    class="slb_agent-wrapper"
    @mouseenter="showActions = true"
    @mouseleave="showActions = false"
  >
    <!-- Actions bar -->
    <Transition name="slb-fade">
      <div v-if="showActions" class="slb_agent-node__actions">
        <button class="slb_agent-node__action-btn" @click.stop="emit('execute', data.nodeId)" title="Run">
          <i class="fas fa-play"></i>
        </button>
        <button class="slb_agent-node__action-btn slb_agent-node__action-btn--danger" @click.stop="emit('delete', data.nodeId)" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
        <button class="slb_agent-node__action-btn" @click.stop="emit('configure', data.nodeId)" title="Settings">
          <i class="fas fa-ellipsis-h"></i>
        </button>
      </div>
    </Transition>

    <!-- Card -->
    <div
      class="slb_agent-node"
      :class="[statusClass, { 'slb_agent-node--disabled': data.disabled }]"
    >
      <!-- Input handle -->
      <Handle
        v-if="!isTrigger"
        type="target"
        :position="targetPosition ?? Position.Left"
        id="0"
        class="slb_agent-node__input-handle"
      />

      <!-- Header row: icon + name -->
      <div class="slb_agent-node__header">
        <div
          class="slb_agent-node__icon-wrap"
          :style="{ background: NodeColors[data.discriminator] ?? '#6b7280' }"
        >
          <div v-if="data.status === 'running'" class="slb_agent-node__spinner"></div>
          <i v-else :class="NodeIcons[data.discriminator] || 'fas fa-cube'" class="slb_agent-node__icon"></i>
        </div>
        <span class="slb_agent-node__name">{{ data.name }}</span>

        <!-- Status badge -->
        <div
          v-if="data.status && data.status !== 'running'"
          class="slb_agent-node__badge"
          :class="`slb_agent-node__badge--${data.status}`"
        >
          <span v-if="data.status === 'finished'">✓</span>
          <span v-else-if="data.status === 'error'">✕</span>
          <span v-else-if="data.status === 'cancelled'">⊘</span>
          <span v-else-if="data.status === 'skipped'">⤵</span>
        </div>
      </div>

      <!-- Output rows with colored line + plus handle -->
      <div v-if="rightPorts.length" class="slb_agent-node__outputs">
        <div
          v-for="port in rightPorts"
          :key="port.key"
          class="slb_agent-node__output-row"
        >
          <span class="slb_agent-node__output-label" :style="{ color: port.color }">
            {{ port.displayName }}
          </span>
          <!-- Colored connector line + plus button -->
          <SingleOutputHandle
            :position="Position.Right"
            :handle-id="String(port.index)"
            :color="port.color"
            :small="true"
          />
        </div>
      </div>

      <!-- Bottom ports (AI Agent: model / memory / tools) -->
      <template v-if="bottomPorts.length">
        <div class="slb_agent-node__divider"></div>
        <div class="slb_agent-node__bottom-ports">
          <div
            v-for="port in bottomPorts"
            :key="port.key"
            class="slb_agent-node__bottom-port"
            :class="{ 'slb_agent-node__bottom-port--active': configuredBottomPorts.has(port.key) }"
            @click="onBottomPortClick(port, $event)"
          >
            <span
              class="slb_agent-node__bottom-label"
              :style="{ color: configuredBottomPorts.has(port.key) ? port.color : '#9ca3af' }"
            >{{ port.displayName }}</span>

            <Handle
              type="target"
              :position="Position.Bottom"
              :id="port.key"
              class="slb_agent-node__bottom-handle"
              :class="{ 'slb_agent-node__bottom-handle--active': configuredBottomPorts.has(port.key) }"
              :style="{ '--port-color': port.color }"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- Label below (for consistency with BaseNode) -->
    <div class="slb_agent-node__meta">
      <span class="slb_agent-node__meta-label">{{ data.name }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.slb_agent-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow: visible;
  cursor: pointer;
}

/* ── Card ── */
.slb_agent-node {
  position: relative;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 16px;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  overflow: visible;
  transition: box-shadow 0.2s, border-color 0.2s;

  .slb_agent-wrapper:hover & {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    border-color: #d1d5db;
  }

  &--disabled { opacity: 0.5; }

  &--running {
    border-color: #3b82f6;
    animation: slb-agent-pulse 1.5s ease-in-out infinite;
  }
  &--finished {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  }
  &--error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
  }
  &--cancelled { border-color: #f59e0b; opacity: 0.75; }
  &--skipped   { opacity: 0.6; }
}

/* ── Input handle ── */
.slb_agent-node__input-handle {
  width: 6px !important;
  height: 24px !important;
  border-radius: 3px !important;
  background: #d1d5db !important;
  border: none !important;
  left: -5px !important;
  top: 32px !important;
  transform: none !important;
}

/* ── Header ── */
.slb_agent-node__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px 12px;
}

.slb_agent-node__icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.slb_agent-node__icon {
  font-size: 18px;
  color: white;
}

.slb_agent-node__spinner {
  position: absolute;
  inset: 0;
  border-radius: 10px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  animation: slb-spin 0.8s linear infinite;
}

.slb_agent-node__name {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Status badge ── */
.slb_agent-node__badge {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;

  &--finished  { background: #10b981; }
  &--error     { background: #ef4444; }
  &--cancelled { background: #f59e0b; }
  &--skipped   { background: #9ca3af; }
}

/* ── Output rows ── */
.slb_agent-node__outputs {
  border-top: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
}

.slb_agent-node__output-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  /* right padding leaves room for the SingleOutputHandle that sits outside */
  padding: 9px 48px 9px 16px;
  position: relative;
  gap: 0;

  &:not(:last-child) {
    border-bottom: 1px solid #f9fafb;
  }
}

.slb_agent-node__output-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  white-space: nowrap;
}

/* ── Actions bar ── */
.slb_agent-node__actions {
  position: absolute;
  top: -44px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 3px;
  background: white;
  padding: 5px 7px;
  border-radius: 10px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12);
  z-index: 20;
  white-space: nowrap;
}

.slb_agent-node__action-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 12px;
  transition: background 0.15s, color 0.15s;

  &:hover { background: #f3f4f6; color: #111827; }
  &--danger:hover { background: #fee2e2; color: #dc2626; }
}

/* ── Bottom ports ── */
.slb_agent-node__divider {
  height: 1px;
  background: #f0f0f0;
  margin: 0 12px;
}

.slb_agent-node__bottom-ports {
  display: flex;
  justify-content: space-around;
  padding: 10px 14px 40px;
  gap: 12px;
}

.slb_agent-node__bottom-port {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
  cursor: pointer;
}

.slb_agent-node__bottom-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  white-space: nowrap;
}

.slb_agent-node__bottom-handle {
  width: 16px !important;
  height: 16px !important;
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%) !important;
  border-radius: 0 !important;
  background: #e5e7eb !important;
  border: 2px solid #d1d5db !important;
  position: absolute !important;
  bottom: -36px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  cursor: pointer !important;
  transition: background 0.15s !important;

  &--active {
    background: var(--port-color, #9ca3af) !important;
    border-color: var(--port-color, #9ca3af) !important;
  }
}

/* ── Meta label below card ── */
.slb_agent-node__meta {
  margin-top: 10px;
  padding-left: 4px;
  pointer-events: none;
}

.slb_agent-node__meta-label {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
}

/* ── Animations ── */
@keyframes slb-agent-pulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); }
  50%       { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.1); }
}

@keyframes slb-spin {
  to { transform: rotate(360deg); }
}

.slb-fade-enter-active, .slb-fade-leave-active { transition: opacity 0.15s; }
.slb-fade-enter-from, .slb-fade-leave-to { opacity: 0; }
</style>
