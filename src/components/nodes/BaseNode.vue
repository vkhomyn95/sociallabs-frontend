<script setup lang="ts">
import { ref, computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { NodeType, type NodeInstance } from '@/stores/node/types'
import { NodeColors, NodeIcons } from '@/stores/node/constants'
import SingleOutputHandle from '../handle/SingleOutputHandle.vue'

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
const isTrigger = computed(() => props.data.type === NodeType.TRIGGER)

const nodeLabel = computed(() => {
  const op = props.data.parameters?.operation || ''
  const res = props.data.parameters?.resource || ''
  if (op && res) return `${op} ${res}`
  return props.data.name
})

const nodeDescription = computed(() => {
  if (isTrigger.value) {
    const event = props.data.parameters?.triggerOn || props.data.parameters?.events || ''
    return event ? `trigger: ${event}` : ''
  }
  const op = props.data.parameters?.operation || ''
  const url = props.data.parameters?.url || props.data.parameters?.endpoint || ''
  if (op && url) return `${op}: ${url}`
  const method = props.data.parameters?.method || ''
  const path = props.data.parameters?.path || ''
  if (method && path) return `${method}: ${path}`
  return ''
})

const statusClass = computed(() => {
  switch (props.data.status) {
    case 'running':
      return 'slb_base-node--running'
    case 'finished':
      return 'slb_base-node--finished'
    case 'error':
      return 'slb_base-node--error'
    case 'cancelled':
      return 'slb_base-node--cancelled'
    case 'skipped':
      return 'slb_base-node--skipped'
    default:
      return ''
  }
})
</script>

<template>
  <div
    class="slb_base-node-wrapper"
    @mouseenter="showActions = true"
    @mouseleave="showActions = false"
  >
    <!-- Actions bar (above card) -->
    <Transition name="slb-fade">
      <div v-if="showActions" class="slb_base-node__actions">
        <button
          class="slb_base-node__action-btn"
          @click.stop="emit('execute', data.nodeId)"
          title="Run"
        >
          <i class="fas fa-play"></i>
        </button>
        <button
          class="slb_base-node__action-btn slb_base-node__action-btn--danger"
          @click.stop="emit('delete', data.nodeId)"
          title="Delete"
        >
          <i class="fas fa-trash"></i>
        </button>
        <button
          class="slb_base-node__action-btn"
          @click.stop="emit('configure', data.nodeId)"
          title="Settings"
        >
          <i class="fas fa-ellipsis-h"></i>
        </button>
      </div>
    </Transition>

    <!-- Card (icon only) -->
    <div
      class="slb_base-node"
      :class="[
        statusClass,
        {
          'slb_base-node--disabled': data.disabled,
          'slb_base-node--trigger': isTrigger,
        },
      ]"
    >
      <!-- Input pill handle -->
      <Handle
        v-if="!isTrigger"
        type="target"
        :position="targetPosition ?? Position.Left"
        id="0"
        class="slb_base-node__input-handle"
      />

      <!-- Icon -->
      <div
        class="slb_base-node__icon-wrap"
        :style="{ background: NodeColors[data.discriminator] ?? '#6b7280' }"
      >
        <div v-if="data.status === 'running'" class="slb_base-node__spinner"></div>
        <i
          v-else
          :class="NodeIcons[data.discriminator] || 'fas fa-cube'"
          class="slb_base-node__icon"
        ></i>
      </div>

      <!-- Status badge -->
      <div
        v-if="data.status && data.status !== 'running'"
        class="slb_base-node__badge"
        :class="`slb_base-node__badge--${data.status}`"
      >
        <span v-if="data.status === 'finished'">✓</span>
        <span v-else-if="data.status === 'error'">✕</span>
        <span v-else-if="data.status === 'cancelled'">⊘</span>
        <span v-else-if="data.status === 'skipped'">⤵</span>
      </div>

      <!-- Plus output handle -->
      <SingleOutputHandle
        :position="sourcePosition ?? Position.Right"
        handle-id="0"
        :node-id="data.nodeId"
      />
    </div>

    <!-- Label + description BELOW the card -->
    <div class="slb_base-node__meta">
      <span class="slb_base-node__meta-label">{{ nodeLabel }}</span>
      <span v-if="nodeDescription" class="slb_base-node__meta-desc">{{ nodeDescription }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.slb_base-node-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: visible;
  cursor: pointer;
}

/* ── Card ── */
.slb_base-node {
  position: relative;
  width: 100px;
  height: 100px;
  background: #ffffff;
  border: 1.5px solid #e5e7eb;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
  overflow: visible;

  .slb_base-node-wrapper:hover & {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    border-color: #d1d5db;
  }

  &--trigger {
    border-left: 3px solid #3b82f6;
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

/* ── Input handle (pill) ── */
.slb_base-node__input-handle {
  width: 6px !important;
  height: 24px !important;
  border-radius: 3px !important;
  background: #d1d5db !important;
  border: none !important;
  left: -5px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
}

/* ── Icon wrap ── */
.slb_base-node__icon-wrap {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.slb_base-node__icon {
  font-size: 26px;
  color: white;
}

.slb_base-node__spinner {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  animation: slb-spin 0.8s linear infinite;
}

/* ── Status badge ── */
.slb_base-node__badge {
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

/* ── Actions bar ── */
.slb_base-node__actions {
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

.slb_base-node__action-btn {
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

/* ── Meta (label + desc below) ── */
.slb_base-node__meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  margin-top: 10px;
  pointer-events: none;
  max-width: 160px;
}

.slb_base-node__meta-label {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.slb_base-node__meta-desc {
  font-size: 11px;
  color: #9ca3af;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
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
