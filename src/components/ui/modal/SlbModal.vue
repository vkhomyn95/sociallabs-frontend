<script setup lang="ts">

import type { ModalSize } from '@/stores/modal/types.ts'

interface Props {
  title?: string
  size?: ModalSize
  closable?: boolean
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  closeOnBackdrop: true,
})

const emit = defineEmits<{
  close: []
}>()

const onBackdropClick = (): void => {
  if (props.closeOnBackdrop) emit('close')
}

const onKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape' && props.closable) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="slb-modal-backdrop">
      <div
        class="slb-modal-backdrop"
        role="dialog"
        aria-modal="true"
        @click.self="onBackdropClick"
        @keydown="onKeydown"
      >
        <Transition name="slb-modal">
          <div
            class="slb-modal"
            :class="`slb-modal--${size}`"
          >
            <!-- Header -->
            <div class="slb-modal__header">
              <slot name="header">
                <h2 v-if="title" class="slb-modal__title">{{ title }}</h2>
              </slot>

              <button
                v-if="closable"
                type="button"
                class="slb-modal__close"
                aria-label="Close modal"
                @click="emit('close')"
              >
                <i class="fas fa-xmark"></i>
              </button>
            </div>

            <!-- Body -->
            <div class="slb-modal__body">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="slb-modal__footer">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss">
@use './modal.scss';
</style>
