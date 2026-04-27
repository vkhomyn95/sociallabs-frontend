<script setup lang="ts">
import SlbButton from '@/components/ui/button/SlbButton.vue'
import { useModalStore } from '@/stores/modal'

interface Props {
  modalId: string
  message: string
  title?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Confirm action',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  danger: false,
})

const modalStore = useModalStore()

const confirm = (): void => {
  modalStore.close(props.modalId, true)
}

const cancel = (): void => {
  modalStore.dismiss(props.modalId)
}
</script>

<template>
  <div class="slb-confirm">
    <div class="slb-confirm__header">
      <div class="slb-confirm__icon" :class="{ 'slb-confirm__icon--danger': danger }">
        <i :class="danger ? 'fas fa-triangle-exclamation' : 'fas fa-circle-question'"></i>
      </div>
      <div class="slb-confirm__text">
        <h3 class="slb-confirm__title">{{ title }}</h3>
        <p class="slb-confirm__message">{{ message }}</p>
      </div>
    </div>

    <div class="slb-confirm__footer">
      <SlbButton variant="secondary" size="md" @click="cancel">
        {{ cancelLabel }}
      </SlbButton>
      <SlbButton :variant="danger ? 'danger' : 'primary'" size="md" @click="confirm">
        {{ confirmLabel }}
      </SlbButton>
    </div>
  </div>
</template>

<style lang="scss">
@use '../variables' as *;

.slb-confirm {
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: $slb-ui-primary-light;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    i { font-size: 18px; color: $slb-ui-primary; }

    &--danger {
      background: $slb-ui-error-light;
      i { color: $slb-ui-error; }
    }
  }

  &__text {
    flex: 1;
    padding-top: 2px;
  }

  &__title {
    font-size: 15px;
    font-weight: $slb-ui-fw-semibold;
    color: $slb-ui-gray-900;
    margin: 0 0 6px;
  }

  &__message {
    font-size: 13px;
    color: $slb-ui-gray-500;
    margin: 0;
    line-height: 1.55;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: $slb-ui-space-4;
  }
}
</style>
