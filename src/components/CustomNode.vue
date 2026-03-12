<template>
  <div
    class="custom-node"
    :class="{
      disabled: data.disabled,
      selected: isSelected,
      trigger: isTrigger,
    }"
    @mouseenter="showActions = true"
    @mouseleave="showActions = false"
  >
    <!-- Top controls (hover) -->
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
        <button class="control-btn" @click.stop="$emit('configure', data.nodeId)" title="More">
          <i class="fas fa-ellipsis-h"></i>
        </button>
      </div>
    </Transition>

    <!-- Input Handle -->
    <Handle
      v-if="!isTrigger"
      type="target"
      position="left"
      id="main"
      class="input-handle"
    />

    <!--
      СТРУКТУРА:
      ┌─────────────────┬──────────────────┐
      │  [icon]  Name   │  Label ●         │
      │                 │  Label ●         │
      └─────────────────┴──────────────────┘
      Для звичайної ноди — без правої колонки, один handle по центру.
    -->
    <div class="node-body">
      <!-- Ліва: іконка + назва -->
      <div class="node-left">
        <div class="node-icon-wrapper" :style="{ background: nodeColor }">
          <i :class="data.icon || 'fas fa-cube'" class="node-icon"></i>
        </div>
        <div class="node-name">{{ data.name }}</div>
        <div v-if="data.disabled" class="node-warning-badge">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
      </div>

      <!-- Права: колонка виходів (тільки для IF/Switch) -->
      <div v-if="hasMultipleOutputs" class="node-outputs">
        <div
          v-for="(output, key) in nodeOutputs"
          :key="key"
          class="output-row"
        >
          <span class="output-label" :class="getLabelClass(String(key))">
            {{ output.displayName }}
          </span>
          <Handle
            type="source"
            position="right"
            :id="String(key)"
            :class="['output-handle', getHandleClass(String(key))]"
          />
        </div>
      </div>
    </div>

    <!-- Single output handle -->
    <Handle
      v-if="!hasMultipleOutputs"
      type="source"
      position="right"
      id="main"
      class="single-output-handle"
    />

    <!-- Subtitle -->
    <div v-if="nodeSubtitle" class="node-subtitle">{{ nodeSubtitle }}</div>

    <!-- Bottom + button -->
    <Transition name="fade">
      <div v-if="showActions && !isTrigger" class="bottom-actions">
        <button class="add-btn" title="Add node below">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    </Transition>

    <!-- Execution spinner -->
    <div v-if="data.executing" class="node-execution-indicator">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Handle } from '@vue-flow/core'
import { useNodeStore } from '@/stores/node'
import { NodeOutput, NodeType } from '@/stores/node/types.ts'
import { getNodeDefinition } from '@/stores/node/definitions'

interface Props {
  data: {
    nodeId: string
    name: string
    type: string
    disabled: boolean
    executing?: boolean
    icon?: string
    color?: string
    discriminator?: string
    parameters?: {
      event?: string
      operation?: string
      resource?: string
      rules?: Array<{ outputIndex: string; outputName?: string }>
      fallbackToDefault?: boolean
      triggerOn?: string
      [key: string]: any
    }
  }
}

const props = defineProps<Props>()
const emit = defineEmits(['delete', 'configure', 'execute'])

const nodeStore = useNodeStore()
const showActions = ref(false)

const isSelected = computed(() => false)
const isTrigger = computed(() => props.data.type === NodeType.TRIGGER)
const nodeDef = computed(() => getNodeDefinition(props.data.discriminator))

const nodeOutputs = computed((): Record<string, NodeOutput> => {
  const def = nodeDef.value
  if (!def?.outputs) return {}

  const keys = Object.keys(def.outputs)
  if (keys.length === 1 && keys[0] === 'main') return {}

  if ((def as any).dynamicOutputs && props.data.parameters?.rules?.length) {
    const result: Record<string, NodeOutput> = {}
    for (const rule of props.data.parameters.rules) {
      result[rule.outputIndex] = { displayName: rule.outputName || rule.outputIndex }
    }
    if (props.data.parameters.fallbackToDefault) {
      result['default'] = { displayName: 'Default' }
    }
    return result
  }

  const result: Record<string, NodeOutput> = {}
  for (const [key, out] of Object.entries(def.outputs)) {
    if (key !== 'main') result[key] = out as NodeOutput
  }
  return result
})

const hasMultipleOutputs = computed(() => Object.keys(nodeOutputs.value).length > 0)

function getLabelClass(key: string): string {
  if (key === 'true') return 'label--true'
  if (key === 'false') return 'label--false'
  return 'label--neutral'
}

function getHandleClass(key: string): string {
  if (key === 'true') return 'handle--true'
  if (key === 'false') return 'handle--false'
  return 'handle--neutral'
}

const nodeColor = computed(() => {
  if (props.data.disabled) return '#9ca3af'
  return props.data.color || '#6366f1'
})

const nodeSubtitle = computed(() => {
  if (isTrigger.value) {
    const event = props.data.parameters?.triggerOn || null
    if (!event) return ''
    return `trigger: ${event}`
  }
  const operation = props.data.parameters?.operation || ''
  const resource = props.data.parameters?.resource || ''
  if (!operation || !resource) return ''
  return `${operation}: ${resource}`
})

const onPlayClick = () => emit('execute', props.data.nodeId)
const onTestClick = () => nodeStore.TEST_NODE_DEFINITION(props.data)
</script>

<style scoped>
/* ── Нода ── */
.custom-node {
  position: relative;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
  overflow: visible;
  /* Ширина авто щоб підлаштуватись під кількість виходів */
  display: inline-flex;
  flex-direction: column;
}

.custom-node:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  border-color: #9ca3af;
}

.custom-node.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.custom-node.disabled { opacity: 0.55; }

.custom-node.trigger {
  border-left: 3px solid #3b82f6;
}

/* ── Тіло ноди ── */
.node-body {
  display: flex;
  align-items: stretch;
  min-height: 64px;
}

/* ── Ліва частина ── */
.node-left {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  flex: 1;
  position: relative;
  min-width: 160px;
}

.node-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.node-icon { font-size: 20px; color: white; }

.node-name {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
  white-space: nowrap;
}

/* ── Права колонка виходів ── */
.node-outputs {
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-left: 1px solid #f0f0f0;
  padding: 6px 0;
}

/* Один рядок виходу */
.output-row {
  display: flex;
  align-items: center;
  padding: 5px 28px 5px 14px; /* 28px справа — місце для handle */
  position: relative;
  gap: 8px;
}

/* Мітка */
.output-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1;
  white-space: nowrap;
}

.label--true  { color: #10b981; }
.label--false { color: #ef4444; }
.label--neutral { color: #6b7280; }

/* ── Handles ── */

/* Input — коротка пілюля зліва */
.input-handle {
  width: 5px !important;
  height: 22px !important;
  border-radius: 3px !important;
  background: #9ca3af !important;
  border: none !important;
  left: -5px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
}

/* Output handle у рядку — абсолютно по правому краю output-row */
.output-handle {
  width: 12px !important;
  height: 12px !important;
  border-radius: 50% !important;
  border: 2px solid #9ca3af !important;
  background: white !important;
  position: absolute !important;
  right: -7px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  transition: background 0.15s !important;
  cursor: crosshair !important;
}

.handle--true  { border-color: #10b981 !important; }
.handle--false { border-color: #ef4444 !important; }
.handle--neutral { border-color: #9ca3af !important; }

.output-handle.handle--true:hover  { background: #10b981 !important; }
.output-handle.handle--false:hover { background: #ef4444 !important; }
.output-handle.handle--neutral:hover { background: #9ca3af !important; }

/* Single output handle */
.single-output-handle {
  width: 12px !important;
  height: 12px !important;
  border-radius: 50% !important;
  border: 2px solid #9ca3af !important;
  background: white !important;
  right: -7px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
}

/* ── Subtitle ── */
.node-subtitle {
  font-size: 11px;
  color: #9ca3af;
  text-align: center;
  padding: 2px 14px 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Warning ── */
.node-warning-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  background: #f59e0b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}
.node-warning-badge i { font-size: 7px; color: white; }

/* ── Top controls ── */
.top-controls {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2px;
  background: white;
  padding: 4px 6px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.12);
  z-index: 20;
  white-space: nowrap;
}

.control-btn {
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  transition: all 0.15s;
  font-size: 12px;
}
.control-btn:hover { background: #f3f4f6; color: #111827; }
.control-btn.danger-btn:hover { background: #fee2e2; color: #dc2626; }

/* ── Bottom + ── */
.bottom-actions {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.add-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
}
.add-btn:hover { background: #f3f4f6; transform: scale(1.1); }

/* ── Spinner ── */
.node-execution-indicator {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 14px;
  height: 14px;
}
.spinner {
  width: 100%;
  height: 100%;
  border: 2px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Fade ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
