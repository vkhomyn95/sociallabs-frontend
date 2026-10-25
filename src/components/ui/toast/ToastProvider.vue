<script setup lang="ts">
import { useToastStore } from '@/stores/toast'
import { ToastType } from '@/stores/toast/types.ts'

const toastStore = useToastStore()

const icons: Record<ToastType, string> = {
  [ToastType.SUCCESS]: 'fa-solid fa-circle-check',
  [ToastType.ERROR]:   'fa-solid fa-circle-xmark',
  [ToastType.WARNING]: 'fa-solid fa-triangle-exclamation',
  [ToastType.INFO]:    'fa-solid fa-circle-info',
}
</script>

<template>
  <Teleport to="body">
    <div class="slb-toast-provider" aria-live="polite" aria-label="Notifications">
      <TransitionGroup name="slb-toast" tag="div" class="slb-toast-provider">
        <div
          v-for="toast in toastStore.items"
          :key="toast.id"
          class="slb-toast"
          :class="`slb-toast--${toast.type}`"
          role="alert"
        >
          <i :class="icons[toast.type]" class="slb-toast__icon" aria-hidden="true"></i>
          <span class="slb-toast__message">{{ toast.message }}</span>
          <button
            type="button"
            class="slb-toast__close"
            aria-label="Dismiss"
            @click="toastStore.dismiss(toast.id)"
          >
            <i class="fas fa-xmark"></i>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style lang="scss">
@use './toast.scss';
</style>
