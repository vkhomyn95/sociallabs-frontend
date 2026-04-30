<script setup lang="ts">
import { ref, computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { NodeInstance } from '@/stores/node/types'
import { NodeType } from '@/stores/node/types'

const TYPE_META: Record<string, { color: string; icon: string; portKey: string }> = {
  [NodeType.AI_MODEL]: { color: '#8b5cf6', icon: 'fas fa-microchip', portKey: 'ai_model' },
  [NodeType.AI_MEMORY]: { color: '#06b6d4', icon: 'fas fa-database', portKey: 'ai_memory' },
  [NodeType.AI_TOOL]: { color: '#10b981', icon: 'fas fa-tools', portKey: 'ai_tools' },
}

const props = defineProps<{
  data: NodeInstance & { label?: string }
}>()

const emit = defineEmits<{
  delete: [nodeId: string]
  'open-panel': [agentNodeId: string, portKey: string]
}>()

const showDelete = ref(false)
const meta = computed(
  () => TYPE_META[props.data.type] ?? { color: '#9ca3af', icon: 'fas fa-cube', portKey: '' },
)
const agentNodeId = computed(() => props.data.parameters?.agentNodeId ?? '')

const onCardClick = () => {
  if (agentNodeId.value) emit('open-panel', agentNodeId.value, meta.value.portKey)
}
</script>

<template>
  <div
    class="slb_sub-card"
    :style="{ '--c': meta.color }"
    @mouseenter="showDelete = true"
    @mouseleave="showDelete = false"
    @click="onCardClick"
  >
    <Handle type="source" :position="Position.Top" id="0" class="slb_sub-card__handle" />

    <Transition name="slb-fade">
      <button
        v-if="showDelete"
        class="slb_sub-card__del"
        @click.stop="$emit('delete', data.nodeId)"
      >
        <i class="fas fa-times"></i>
      </button>
    </Transition>

    <div class="slb_sub-card__icon">
      <i :class="meta.icon"></i>
    </div>
    <div class="slb_sub-card__name">{{ data.name }}</div>
  </div>
</template>

<style scoped lang="scss">
.slb_sub-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 16px 12px;
  background: white;
  border: 1.5px solid color-mix(in srgb, var(--c) 25%, #e5e7eb);
  border-radius: 12px;
  min-width: 100px;
  cursor: pointer;
  transition:
    box-shadow 0.2s,
    border-color 0.2s,
    transform 0.15s;
  overflow: visible;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 14px;
    right: 14px;
    height: 3px;
    background: var(--c);
    border-radius: 0 0 3px 3px;
  }

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    border-color: var(--c);
    transform: translateY(-2px);
  }

  &__handle {
    width: 14px !important;
    height: 14px !important;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%) !important;
    background: var(--c) !important;
    border: none !important;
    border-radius: 0 !important;
    top: -8px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    position: absolute !important;
    cursor: crosshair !important;
  }

  &__icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--c) 15%, white);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--c);
    font-size: 16px;
  }

  &__name {
    font-size: 11px;
    font-weight: 600;
    color: #374151;
    text-align: center;
    max-width: 90px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__del {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 16px;
    height: 16px;
    border: none;
    background: #fee2e2;
    color: #dc2626;
    border-radius: 4px;
    font-size: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;

    &:hover {
      background: #fca5a5;
    }
  }
}

.slb-fade-enter-active,
.slb-fade-leave-active {
  transition: opacity 0.12s;
}
.slb-fade-enter-from,
.slb-fade-leave-to {
  opacity: 0;
}
</style>
