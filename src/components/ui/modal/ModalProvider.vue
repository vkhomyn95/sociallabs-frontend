<script setup lang="ts">
import SlbModal from './SlbModal.vue'
import { useModalStore } from '@/stores/modal'

const modalStore = useModalStore()

const onClose = (modalId: string): void => {
  modalStore.dismiss(modalId)
}
</script>

<template>
  <template v-for="instance in modalStore.stack" :key="instance.id">
    <SlbModal
      :size="instance.options.size"
      :closable="instance.options.closable"
      :close-on-backdrop="instance.options.closeOnBackdrop"
      @close="onClose(instance.id)"
    >
      <template #header>
        <slot name="header" />
      </template>

      <!-- Render the dynamic component and pass modal context via props -->
      <component
        :is="instance.component"
        v-bind="instance.props"
        :modal-id="instance.id"
        @confirm="(result: unknown) => modalStore.close(instance.id, result)"
        @cancel="modalStore.dismiss(instance.id)"
      />
    </SlbModal>
  </template>
</template>
