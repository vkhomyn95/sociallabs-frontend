<script setup lang="ts">
/**
 * SubNodeCard.vue
 * Компактна картка sub-ноди на canvas.
 * type: AI_MODEL | AI_MEMORY | AI_TOOL
 * Клік → відкриває RightParameterPanel з параметрами AI_AGENT
 */
import { ref, computed } from 'vue'
import { Handle } from '@vue-flow/core'
import type { NodeInstance } from '@/stores/node/types'
import { NodeType } from '@/stores/node/types'

const TYPE_META: Record<string, { color: string; icon: string; portKey: string }> = {
  [NodeType.AI_MODEL]:  { color: '#8b5cf6', icon: 'fas fa-microchip', portKey: 'ai_model'  },
  [NodeType.AI_MEMORY]: { color: '#06b6d4', icon: 'fas fa-database',  portKey: 'ai_memory' },
  [NodeType.AI_TOOL]:   { color: '#10b981', icon: 'fas fa-tools',     portKey: 'ai_tools'  },
}

const props = defineProps<{
  data: NodeInstance & { label?: string }
}>()

const emit = defineEmits<{
  delete:       [nodeId: string]
  'open-panel': [agentNodeId: string, portKey: string]
}>()

const showDelete = ref(false)
const meta = computed(() => TYPE_META[props.data.type] ?? { color: '#9ca3af', icon: 'fas fa-cube', portKey: '' })

// sub-нода зберігає agentNodeId в parameters
const agentNodeId = computed(() => props.data.parameters?.agentNodeId ?? '')

const onCardClick = () => {
  if (agentNodeId.value) {
    emit('open-panel', agentNodeId.value, meta.value.portKey)
  }
}
</script>

<template>
  <div
    class="sub-card"
    :style="{ '--c': meta.color }"
    @mouseenter="showDelete = true"
    @mouseleave="showDelete = false"
    @click="onCardClick"
  >
    <!-- Top handle (source → AI Agent bottom port) -->
    <Handle
      type="source"
      position="top"
      id="0"
      class="sub-card__handle"
    />

    <!-- Delete -->
    <Transition name="fade">
      <button
        v-if="showDelete"
        class="sub-card__del"
        @click.stop="$emit('delete', data.nodeId)"
      >
        <i class="fas fa-times"></i>
      </button>
    </Transition>

    <div class="sub-card__icon">
      <i :class="meta.icon"></i>
    </div>
    <div class="sub-card__name">{{ data.name }}</div>
  </div>
</template>

<style scoped>
.sub-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 18px 14px 10px;
  background: white;
  border: 1.5px solid color-mix(in srgb, var(--c) 30%, #e5e7eb);
  border-radius: 12px;
  min-width: 100px;
  cursor: pointer;
  transition: box-shadow .2s, border-color .2s, transform .15s;
  overflow: visible;
}
.sub-card::before {
  content: '';
  position: absolute;
  top: 0; left: 16px; right: 16px; height: 2px;
  background: var(--c);
  border-radius: 0 0 2px 2px;
}
.sub-card:hover {
  box-shadow: 0 4px 14px rgba(0,0,0,.1);
  border-color: var(--c);
  transform: translateY(-1px);
}

/* Handle вгорі — diamond */
.sub-card__handle {
  width:  14px !important;
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

.sub-card__icon {
  width: 34px; height: 34px; border-radius: 8px;
  background: color-mix(in srgb, var(--c) 15%, white);
  display: flex; align-items: center; justify-content: center;
  color: var(--c); font-size: 15px;
}
.sub-card__name {
  font-size: 11px; font-weight: 600; color: #374151;
  text-align: center; max-width: 90px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.sub-card__del {
  position: absolute; top: 5px; right: 5px;
  width: 16px; height: 16px; border: none;
  background: #fee2e2; color: #dc2626;
  border-radius: 3px; font-size: 8px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  z-index: 10;
}
.sub-card__del:hover { background: #fca5a5; }

.fade-enter-active, .fade-leave-active { transition: opacity .12s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
