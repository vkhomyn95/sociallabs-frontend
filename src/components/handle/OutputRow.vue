<script setup lang="ts">
import { computed, ref } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'

const props = defineProps<{
  nodeId: string
  handleId: string
  color: string
  label: string
}>()

const { connectionStartHandle, edges } = useVueFlow()
const handleRef = ref<any>(null)

const currentColor = computed(() => (isConnected() ? props.color : '#e5e7eb'))

const isDragging = () =>
  !!connectionStartHandle.value &&
  connectionStartHandle.value.nodeId === props.nodeId &&
  connectionStartHandle.value.id === props.handleId

const isConnected = () =>
  edges.value.some((e) => e.source === props.nodeId && e.sourceHandle === props.handleId)

function onDragZoneMouseDown(event: MouseEvent) {
  event.stopPropagation()
  const el = handleRef.value?.$el ?? handleRef.value
  if (el) {
    el.dispatchEvent(
      new MouseEvent('mousedown', {
        bubbles: false,
        cancelable: true,
        button: 0,
        clientX: event.clientX,
        clientY: event.clientY,
      }),
    )
  }
}
</script>

<template>
  <Handle
    ref="handleRef"
    type="source"
    :position="Position.Right"
    :id="handleId"
    class="slb_row__vue-handle"
  />

  <div class="slb_row" @mousedown.stop="onDragZoneMouseDown" v-if="!isDragging()">
    <template v-if="!isConnected()">
      <div class="slb_row__line" :style="{ background: currentColor }" />
      <span class="slb_row__label" :style="{ color: '#6b7280' }">{{ label }}</span>
      <Transition name="slb-fade">
        <div
          v-if="!isDragging()"
          class="slb_row__btn"
          :style="{ borderColor: currentColor, color: '#6b7280' }"
        >
          <i class="fa-solid fa-plus"></i>
        </div>
      </Transition>
    </template>
    <template v-else>
      <div class="slb_row__line" v-if="!isConnected()" :style="{ background: currentColor }" />
    </template>
  </div>
</template>

<style scoped lang="scss">
.slb_row__vue-handle {
  position: absolute !important;
  left: 0 !important;
  top: 50% !important;
  width: 1px !important;
  height: 1px !important;
  min-width: unset !important;
  min-height: unset !important;
  padding: 0 !important;
  margin: 0 !important;
  transform: translate(0, -50%) !important;
  opacity: 0 !important;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  pointer-events: all !important;
}

.slb_row {
  display: flex;
  align-items: center;
  white-space: nowrap;
  pointer-events: all;
  cursor: crosshair;
}

.slb_row__line {
  width: 50px;
  height: 2px;
  flex-shrink: 0;
}

.slb_row__label {
  position: absolute;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.4px;
  max-width: 40px;
  flex-shrink: 0;
  left: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
  background: #f9fafb;
}

.slb_row__btn {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  border: 1.5px solid;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 300;
  line-height: 1;
  flex-shrink: 0;
  user-select: none;
  transition:
    transform 0.1s ease,
    box-shadow 0.1s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}

.slb-fade-enter-active,
.slb-fade-leave-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}
.slb-fade-enter-from,
.slb-fade-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
</style>
