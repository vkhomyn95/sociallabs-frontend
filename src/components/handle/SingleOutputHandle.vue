<script setup lang="ts">
import { ref } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'

const props = defineProps<{
  nodeId: string
  handleId: string
  color?: string
  small?: boolean
}>()

const { connectionStartHandle, edges } = useVueFlow()
const handleRef = ref<any>(null)

const isDragging = () =>
  !!connectionStartHandle.value &&
  connectionStartHandle.value.nodeId === props.nodeId &&
  connectionStartHandle.value.id === props.handleId

const isConnected = () =>
  edges.value.some((e) => e.source === props.nodeId && e.sourceHandle === props.handleId)

function onMouseDown(event: MouseEvent) {
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
  <!--
    Контейнер позиціонується сам — абсолютно на правому краю батьківської ноди,
    по центру вертикально. Не потребує жодного wrapper'а зовні.
    Використовуй просто: <SingleOutputHandle :node-id="..." handle-id="0" />
    всередині ноди (батько має position: relative).
  -->
  <div class="slb_sh__container">
    <!-- 1×1px невидимий Handle точно на краю — VueFlow реєструє позицію -->
    <Handle
      ref="handleRef"
      type="source"
      :position="Position.Right"
      :id="handleId"
      class="slb_sh__vue-handle"
    />

    <!-- Drag zone: лінія + кнопка -->
    <div class="slb_sh__row" @mousedown.stop="onMouseDown" v-if="!isDragging()">
      <div class="slb_sh__line" :style="color ? { background: color } : {}" />

      <Transition name="slb-sh-fade">
        <div
          v-if="!isConnected()"
          class="slb_sh__btn"
          :class="{ 'slb_sh__btn--small': small }"
          :style="color ? { borderColor: color, color } : {}"
        >
          <i class="fa-solid fa-plus"></i>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
// Контейнер — абсолютно на правому краю ноди, по центру
.slb_sh__container {
  position: absolute;
  right: 0; // на правому краю картки
  top: 50%;
  transform: translateY(-50%);
  width: 0; // нульова ширина — вміст іде вправо
  pointer-events: none;
  overflow: visible;
  display: flex;
  align-items: center;
}

// 1×1px Handle на краю картки
.slb_sh__vue-handle {
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

// Рядок: лінія + кнопка — іде вправо від краю картки
.slb_sh__row {
  display: flex;
  align-items: center;
  pointer-events: all;
  cursor: crosshair;
  white-space: nowrap;
}

.slb_sh__line {
  width: 50px;
  height: 2px;
  flex-shrink: 0;
  background: #e5e7eb;
}

.slb_sh__btn {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  border: 1.5px solid #d1d5db;
  background: white;
  color: #6b7280;
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

  &--small {
    width: 20px;
    height: 20px;
    font-size: 13px;
    border-radius: 5px;
  }

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}

.slb-sh-fade-enter-active,
.slb-sh-fade-leave-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}
.slb-sh-fade-enter-from,
.slb-sh-fade-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
</style>
