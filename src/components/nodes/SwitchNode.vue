<script setup lang="ts">
import { ref, computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { NodeInstance } from '@/stores/node/types'
import { NodeColors, NodeIcons } from '@/stores/node/constants'
import MultiOutputHandle from '../handle/MultiOutputHandle.vue'

interface SwitchRule {
  outputIndex: number
  outputName?: string
}

const PORT_COLORS = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#8b5cf6',
  '#06b6d4',
  '#6366f1',
  '#ec4899',
  '#14b8a6',
]

const props = defineProps<{
  data: NodeInstance & { label?: string; status?: string | null }
  sourcePosition?: Position
  targetPosition?: Position
}>()

const emit = defineEmits<{
  delete: [nodeId: string]
  configure: [nodeId: string]
  execute: [nodeId: string]
}>()

const showActions = ref(false)

const ROW_HEIGHT = 36
const BASE_HEIGHT = 100

const outputPorts = computed(() => {
  const rules: SwitchRule[] = props.data.parameters?.rules ?? []
  const ports = rules.map((rule, i) => ({
    id: String(rule.outputIndex ?? i),
    label: rule.outputName || `output ${i + 1}`,
    color: PORT_COLORS[i % PORT_COLORS.length],
  }))
  if (props.data.parameters?.fallbackToDefault !== false) {
    ports.push({ id: String(ports.length), label: 'fallback', color: '#9ca3af' })
  }
  return ports
})

const cardHeight = computed(() => {
  const count = outputPorts.value.length
  return Math.max(BASE_HEIGHT, BASE_HEIGHT + (count - 2) * ROW_HEIGHT)
})

const statusClass = computed(() => {
  switch (props.data.status) {
    case 'running':
      return 'slb_sw-node--running'
    case 'finished':
      return 'slb_sw-node--finished'
    case 'error':
      return 'slb_sw-node--error'
    case 'cancelled':
      return 'slb_sw-node--cancelled'
    case 'skipped':
      return 'slb_sw-node--skipped'
    default:
      return ''
  }
})
</script>

<template>
  <div class="slb_sw-wrapper" @mouseenter="showActions = true" @mouseleave="showActions = false">
    <Transition name="slb-fade">
      <div v-if="showActions" class="slb_sw-wrapper__actions">
        <button class="slb_sw-wrapper__action-btn" @click.stop="emit('execute', data.nodeId)">
          <i class="fas fa-play"></i>
        </button>
        <button
          class="slb_sw-wrapper__action-btn slb_sw-wrapper__action-btn--danger"
          @click.stop="emit('delete', data.nodeId)"
        >
          <i class="fas fa-trash"></i>
        </button>
        <button class="slb_sw-wrapper__action-btn" @click.stop="emit('configure', data.nodeId)">
          <i class="fas fa-ellipsis-h"></i>
        </button>
      </div>
    </Transition>

    <div
      class="slb_sw-node"
      :class="[statusClass, { 'slb_sw-node--disabled': data.disabled }]"
      :style="{ height: cardHeight + 'px' }"
    >
      <Handle
        type="target"
        :position="targetPosition ?? Position.Left"
        id="0"
        class="slb_sw-node__input-handle"
      />

      <div
        class="slb_sw-node__icon-wrap"
        :style="{ background: NodeColors[data.discriminator] ?? '#f59e0b' }"
      >
        <div v-if="data.status === 'running'" class="slb_sw-node__spinner"></div>
        <i
          v-else
          :class="NodeIcons[data.discriminator] || 'fas fa-random'"
          class="slb_sw-node__icon"
        ></i>
      </div>

      <div
        v-if="data.status && data.status !== 'running'"
        class="slb_sw-node__badge"
        :class="`slb_sw-node__badge--${data.status}`"
      >
        <span v-if="data.status === 'finished'">✓</span>
        <span v-else-if="data.status === 'error'">✕</span>
        <span v-else-if="data.status === 'cancelled'">⊘</span>
        <span v-else-if="data.status === 'skipped'">⤵</span>
      </div>

      <MultiOutputHandle :node-id="data.nodeId" :outputs="outputPorts" :row-height="ROW_HEIGHT" />
    </div>

    <div class="slb_sw-wrapper__meta">
      <span class="slb_sw-wrapper__meta-label">{{ data.name }}</span>
      <span v-if="data.parameters?.mode" class="slb_sw-wrapper__meta-mode">
        mode: {{ data.parameters.mode }}
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.slb_sw-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: visible;
  cursor: pointer;
}

.slb_sw-wrapper__actions {
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

.slb_sw-wrapper__action-btn {
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
  transition:
    background 0.15s,
    color 0.15s;
  &:hover {
    background: #f3f4f6;
    color: #111827;
  }
  &--danger:hover {
    background: #fee2e2;
    color: #dc2626;
  }
}

.slb_sw-node {
  position: relative;
  width: 100px;
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    box-shadow 0.2s,
    border-color 0.2s,
    height 0.2s;
  overflow: visible;

  .slb_sw-wrapper:hover & {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    border-color: #d1d5db;
  }

  &--disabled {
    opacity: 0.5;
  }
  &--running {
    border-color: #3b82f6;
    animation: slb-pulse 1.5s ease-in-out infinite;
  }
  &--finished {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  }
  &--error {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
  }
  &--cancelled {
    border-color: #f59e0b;
    opacity: 0.75;
  }
  &--skipped {
    opacity: 0.6;
  }
}

.slb_sw-node__input-handle {
  width: 6px !important;
  height: 24px !important;
  border-radius: 3px !important;
  background: #d1d5db !important;
  border: none !important;
  left: -5px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
}

.slb_sw-node__icon-wrap {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.slb_sw-node__icon {
  font-size: 26px;
  color: white;
}
.slb_sw-node__spinner {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  animation: slb-spin 0.8s linear infinite;
}

.slb_sw-node__badge {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: white;
  border: 2px solid white;
  &--finished {
    background: #10b981;
  }
  &--error {
    background: #ef4444;
  }
  &--cancelled {
    background: #f59e0b;
  }
  &--skipped {
    background: #9ca3af;
  }
}

.slb_sw-wrapper__meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  margin-top: 10px;
  pointer-events: none;
}
.slb_sw-wrapper__meta-label {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}
.slb_sw-wrapper__meta-mode {
  font-size: 11px;
  color: #9ca3af;
  text-align: center;
}

@keyframes slb-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.1);
  }
}
@keyframes slb-spin {
  to {
    transform: rotate(360deg);
  }
}
.slb-fade-enter-active,
.slb-fade-leave-active {
  transition: opacity 0.15s;
}
.slb-fade-enter-from,
.slb-fade-leave-to {
  opacity: 0;
}
</style>
