<script setup lang="ts">
import { useButton } from './useButton'
import type { ButtonVariant, ButtonSize } from './useButton'

interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
  iconOnly?: boolean
  full?: boolean
  iconLeft?: string
  iconRight?: string
  tag?: 'button' | 'a' | 'router-link'
  href?: string
  to?: string | object
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  loading: false,
  disabled: false,
  iconOnly: false,
  full: false,
  tag: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const { isDisabled, classes } = useButton(props)

const handleClick = (event: MouseEvent): void => {
  if (isDisabled.value) return
  emit('click', event)
}
</script>

<template>
  <component
    :is="tag"
    class="slb-btn"
    :class="[classes, { 'slb-btn--full': full }]"
    :type="tag === 'button' ? type : undefined"
    :href="tag === 'a' ? href : undefined"
    :to="tag === 'router-link' ? to : undefined"
    :disabled="tag === 'button' ? isDisabled : undefined"
    :aria-disabled="isDisabled"
    :aria-busy="loading"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <span v-if="loading" class="slb-btn__spinner" aria-hidden="true">
      <span class="slb-btn__spinner-ring"></span>
    </span>

    <!-- Content -->
    <span class="slb-btn__content">
      <i v-if="iconLeft" :class="iconLeft" aria-hidden="true"></i>
      <slot />
      <i v-if="iconRight" :class="iconRight" aria-hidden="true"></i>
    </span>
  </component>
</template>

<style lang="scss">
@use './button.scss';
</style>
