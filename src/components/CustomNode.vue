<script setup lang="ts">
import { ref, computed } from 'vue'
import { Handle } from '@vue-flow/core'
import { useNodeStore } from '@/stores/node'
import { NodeType, type NodeInstance, type NodeOutput } from '@/stores/node/types'
import { getNodeDefinition } from '@/stores/node/definitions'
import { NodeColors, NodeIcons } from '@/stores/node/constants.ts'

interface OutputPort {
  key:         string
  index:       number
  displayName: string
  color:       string
  position:    'right' | 'bottom'
  multiple:    boolean
}

const PORT_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#6366f1']

const props = defineProps<{
  data: NodeInstance & { label?: string }
}>()

const emit = defineEmits<{
  delete:           [nodeId: string]
  configure:        [nodeId: string]
  execute:          [nodeId: string]
  'open-sub-panel': [nodeId: string, portKey: string]
}>()

const nodeStore   = useNodeStore()
const showActions = ref(false)
const isTrigger   = computed(() => props.data.type === NodeType.TRIGGER)
const nodeDef     = computed(() => getNodeDefinition(props.data.discriminator))

const allOutputPorts = computed((): OutputPort[] => {
  const def = nodeDef.value
  if (!def) return []

  if (def.dynamicOutputs) {
    const rules: Array<{ outputIndex: number; outputName?: string }> =
      props.data.parameters?.rules ?? []
    const ports: OutputPort[] = rules.map((rule, i) => ({
      key:         String(i),
      index:       rule.outputIndex ?? i,
      displayName: rule.outputName || `Output ${i + 1}`,
      color:       PORT_COLORS[i % PORT_COLORS.length],
      position:    'right',
      multiple:    false,
    }))
    if (props.data.parameters?.fallbackToDefault !== false) {
      ports.push({
        key: 'fallback', index: ports.length,
        displayName: 'Fallback', color: '#9ca3af', position: 'right', multiple: false,
      })
    }
    return ports
  }

  const outputKeys = Object.keys(def.outputs ?? {})
  return outputKeys.map((key, i) => {
    const out: NodeOutput = def.outputs[key]
    return {
      key,
      index:       i,
      displayName: out.displayName,
      color:       out.color ?? PORT_COLORS[i % PORT_COLORS.length],
      position:    out.position ?? 'right',
      multiple:    out.multiple ?? false,
    }
  })
})

const rightPorts  = computed(() => allOutputPorts.value.filter(p => p.position === 'right'))
const bottomPorts = computed(() => allOutputPorts.value.filter(p => p.position === 'bottom'))

const hasMultipleRightPorts = computed(() => rightPorts.value.length > 1)
const singleRightPort = computed(() =>
  rightPorts.value.length === 1 ? rightPorts.value[0] : null
)

// ── Підключені bottom порти (є хоча б один edge з targetHandle = portKey) ──
const configuredBottomPorts = computed(() => {
  const configured = new Set<string>()
  const p = props.data.parameters ?? {}
  if (p.modelId?.modelId) configured.add('ai_model')
  if (p.memory?.enabled === true) configured.add('ai_memory')
  if (Array.isArray(p.toolNames) && p.toolNames.length > 0) configured.add('ai_tool')
  return configured
})

const nodeSubtitle = computed(() => {
  if (isTrigger.value) {
    const event = props.data.parameters?.triggerOn || props.data.parameters?.events
    return event ? `trigger: ${event}` : ''
  }
  const op  = props.data.parameters?.operation || ''
  const res = props.data.parameters?.resource  || ''
  return op && res ? `${op}: ${res}` : ''
})

const onPlayClick   = () => emit('execute', props.data.nodeId)
const onTestClick   = () => nodeStore.TEST_NODE_DEFINITION(props.data)

// Клік на bottom port — відкрити бокову панель
const onBottomPortClick = (port: OutputPort, e: MouseEvent) => {
  e.stopPropagation()
  emit('open-sub-panel', props.data.nodeId, port.key)
}
</script>

<template>
  <div
    class="custom-node"
    :class="{
      disabled:           data.disabled,
      trigger:            isTrigger,
      'has-bottom-ports': bottomPorts.length > 0,
    }"
    @mouseenter="showActions = true"
    @mouseleave="showActions = false"
  >
    <!-- Top controls -->
    <Transition name="fade">
      <div v-if="showActions" class="top-controls">
        <button class="control-btn" @click.stop="onPlayClick" title="Execute">
          <i class="fas fa-play"></i>
        </button>
        <button class="control-btn" @click.stop="onTestClick" title="Test">
          <i class="fas fa-flask"></i>
        </button>
        <button class="control-btn danger-btn" @click.stop="$emit('delete', data.nodeId)" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
        <button class="control-btn" @click.stop="$emit('configure', data.nodeId)" title="Configure">
          <i class="fas fa-ellipsis-h"></i>
        </button>
      </div>
    </Transition>

    <!-- Input handle -->
    <Handle
      v-if="!isTrigger"
      type="target"
      position="left"
      id="0"
      class="input-handle"
    />

    <!-- Node body -->
    <div class="node-body">
      <div class="node-left">
        <div
          class="node-icon-wrapper"
          :style="{ background: NodeColors[data.discriminator] }"
        >
          <i :class="NodeIcons[data.discriminator] || 'fas fa-cube'" class="node-icon"></i>
        </div>
        <div class="node-name">{{ data.name }}</div>
      </div>

      <!-- Multiple right ports (IF / Switch) -->
      <div v-if="hasMultipleRightPorts" class="node-outputs">
        <div
          v-for="port in rightPorts"
          :key="port.key"
          class="output-row"
        >
          <span class="output-label" :style="{ color: port.color }">
            {{ port.displayName }}
          </span>
          <Handle
            type="source"
            position="right"
            :id="String(port.index)"
            class="output-handle"
            :style="{ borderColor: port.color }"
          />
        </div>
      </div>
    </div>

    <!-- Single right output handle -->
    <Handle
      v-if="singleRightPort"
      type="source"
      position="right"
      :id="String(singleRightPort.index)"
      class="single-output-handle"
    />

    <!-- Subtitle -->
    <div v-if="nodeSubtitle" class="node-subtitle">{{ nodeSubtitle }}</div>

    <!-- Bottom ports: ai_model / ai_memory / ai_tools -->
    <template v-if="bottomPorts.length">
      <div class="bottom-divider"></div>
      <div class="bottom-ports">
        <div
          v-for="port in bottomPorts"
          :key="port.key"
          class="bottom-port"
          :class="{ 'bottom-port--configured': configuredBottomPorts.has(port.key) }"
          @click="onBottomPortClick(port, $event)"
        >
          <!-- Label -->
          <span
            class="bottom-port__label"
            :style="{ color: configuredBottomPorts.has(port.key) ? port.color : undefined }"
            :class="{ 'bottom-port__label--muted': !configuredBottomPorts.has(port.key) }"
          >{{ port.displayName }}</span>

          <!-- VueFlow target handle (завжди присутній для прийому edge від sub-ноди) -->
          <Handle
            type="target"
            position="bottom"
            :id="port.key"
            class="bottom-port__handle"
            :class="{ 'bottom-port__handle--active': configuredBottomPorts.has(port.key) }"
            :style="{ '--port-color': port.color }"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* ── Node ── */
.custom-node {
  position: relative;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
  overflow: visible;
  display: inline-flex;
  flex-direction: column;
  min-width: 180px;
}
.custom-node:hover        { box-shadow: 0 4px 14px rgba(0,0,0,.1); border-color: #9ca3af; }
.custom-node.selected     { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.2); }
.custom-node.disabled     { opacity: 0.55; }
.custom-node.trigger      { border-left: 3px solid #3b82f6; }

/* ── Body ── */
.node-body {
  display: flex;
  align-items: stretch;
  min-height: 64px;
}

.node-left {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  flex: 1;
}

.node-icon-wrapper {
  width: 40px; height: 40px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.node-icon  { font-size: 20px; color: white; }
.node-name  { font-size: 13px; font-weight: 600; color: #111827; line-height: 1.3; white-space: nowrap; }

/* ── Right outputs ── */
.node-outputs {
  display: flex; flex-direction: column; justify-content: center;
  border-left: 1px solid #f0f0f0; padding: 6px 0;
}
.output-row {
  display: flex; align-items: center;
  padding: 5px 28px 5px 14px; position: relative; gap: 8px;
}
.output-label {
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .5px; white-space: nowrap;
}

/* ── Subtitle ── */
.node-subtitle {
  font-size: 11px; color: #9ca3af; text-align: center;
  padding: 2px 14px 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ── Handles ── */
.input-handle {
  width: 5px !important; height: 22px !important; border-radius: 3px !important;
  background: #9ca3af !important; border: none !important;
  left: -5px !important; top: 50% !important; transform: translateY(-50%) !important;
}
.output-handle {
  width: 12px !important; height: 12px !important; border-radius: 50% !important;
  border: 2px solid !important; background: white !important;
  position: absolute !important; right: -7px !important; top: 50% !important;
  transform: translateY(-50%) !important; cursor: crosshair !important;
}
.single-output-handle {
  width: 12px !important; height: 12px !important; border-radius: 50% !important;
  border: 2px solid #9ca3af !important; background: white !important;
  right: -7px !important; top: 50% !important; transform: translateY(-50%) !important;
}

/* ── Bottom ports container ── */
.bottom-divider {
  height: 1px; background: #f0f0f0; margin: 0 12px;
}

.bottom-ports {
  display: flex;
  justify-content: space-around;
  padding: 8px 14px 36px;
  gap: 12px;
}

/* ── Bottom port slot ── */
.bottom-port {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
  cursor: pointer;
}

.bottom-port__label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .4px;
  white-space: nowrap;
  line-height: 1;
}
.bottom-port__label--muted {
  color: #9ca3af !important;
}

/* ── Bottom port configured state ── */
.bottom-port--configured .bottom-port__label {
  font-weight: 700;
}

/* ── Bottom handle (diamond) ── */
.bottom-port__handle {
  width:  16px !important;
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
  transition: background .15s !important;
}

/* Active (configured) handle — filled with accent color */
.bottom-port__handle--active {
  background: var(--port-color, #9ca3af) !important;
  border-color: var(--port-color, #9ca3af) !important;
}

.bottom-port:hover .bottom-port__handle {
  background: color-mix(in srgb, var(--port-color, #9ca3af) 30%, #e5e7eb) !important;
  border-color: var(--port-color, #9ca3af) !important;
}

/* ── Top controls ── */
.top-controls {
  position: absolute; top: -40px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 2px; background: white; padding: 4px 6px;
  border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,.12); z-index: 20; white-space: nowrap;
}
.control-btn {
  width: 26px; height: 26px; border: none; background: transparent; color: #6b7280;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  border-radius: 5px; transition: all .15s; font-size: 12px;
}
.control-btn:hover            { background: #f3f4f6; color: #111827; }
.control-btn.danger-btn:hover { background: #fee2e2; color: #dc2626; }

/* ── Fade ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }
</style>
