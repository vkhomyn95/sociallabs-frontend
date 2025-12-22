<template>
  <Teleport to="body">
    <div
      v-if="show && targetElement"
      class="tooltip"
      :style="tooltipStyle"
    >
      {{ text }}
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TooltipProps } from '@/components/sidebar/sidebar.ts'

const props = withDefaults(defineProps<TooltipProps>(), {
  show: false,
  text: '',
  targetElement: null
});

const tooltipStyle = computed(() => {
  if (!props.targetElement) {
    return {
      top: '0px',
      left: '0px',
      opacity: '0'
    };
  }

  const rect = props.targetElement.getBoundingClientRect();
  return {
    top: `${rect.top + rect.height / 2}px`,
    left: `${rect.right + 8}px`,
    opacity: props.show ? '1' : '0'
  };
});
</script>

<style scoped lang="scss">
@import '/src/assets/sidebar-variables';

.tooltip {
  position: fixed;
  background-color: $tooltip-bg;
  color: $tooltip-color;
  padding: $tooltip-padding;
  border-radius: $tooltip-border-radius;
  font-size: $tooltip-font-size;
  white-space: nowrap;
  pointer-events: none;
  z-index: $z-index-tooltip;
  box-shadow: $tooltip-shadow;
  transition: opacity $transition-fast;

  &::before {
    content: '';
    position: absolute;
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 4px 4px 4px 0;
    border-style: solid;
    border-color: transparent $tooltip-bg transparent transparent;
  }
}
</style>
