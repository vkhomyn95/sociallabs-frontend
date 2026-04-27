<script setup lang="ts">
import SlbInput from '@/components/ui/input/SlbInput.vue'
import SlbCheckbox from '@/components/ui/checkbox/SlbCheckbox.vue'
import SlbButton from '@/components/ui/button/SlbButton.vue'
import { useModalStore } from '@/stores/modal'
import { useWorkflowStore } from '@/stores/workflow'
import { storeToRefs } from 'pinia'

interface Props {
  modalId: string
}

const props = defineProps<Props>()

const modalStore = useModalStore();
const workflowStore = useWorkflowStore();
const {workflow} = storeToRefs(workflowStore);

const save = (): void => {
  modalStore.close(props.modalId)
}

const cancel = (): void => {
  modalStore.dismiss(props.modalId)
}
</script>

<template>
  <div class="slb-workflow-settings">
    <SlbInput
      id="wf-name"
      v-model="workflow.name"
      label="Workflow Name"
      placeholder="Enter workflow name"
      icon-left="fas fa-pen"
      required
    />

    <div class="slb-workflow-settings__field">
      <label class="slb-workflow-settings__label">Description</label>
      <textarea
        v-model="workflow.description"
        class="slb-workflow-settings__textarea"
        placeholder="Describe what this workflow does..."
        rows="4"
      ></textarea>
    </div>

    <SlbCheckbox
      v-model="workflow.active"
      label="Active"
      description="When active, this workflow can be triggered automatically"
    />

    <div class="slb-workflow-settings__footer">
      <SlbButton variant="secondary" @click="cancel">Cancel</SlbButton>
      <SlbButton variant="primary" icon-left="fa-regular fa-floppy-disk" @click="save">
        Save Settings
      </SlbButton>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/components/ui/variables' as *;

.slb-workflow-settings {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__label {
    font-size: $slb-ui-font-sm;
    font-weight: $slb-ui-fw-medium;
    color: $slb-ui-gray-700;
  }

  &__textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid $slb-ui-border;
    border-radius: $slb-ui-radius-md;
    font-size: $slb-ui-font-base;
    font-family: $slb-ui-font;
    color: $slb-ui-gray-900;
    resize: vertical;
    transition: border-color $slb-ui-transition, box-shadow $slb-ui-transition;
    box-sizing: border-box;

    &::placeholder { color: $slb-ui-gray-400; }

    &:focus {
      outline: none;
      border-color: $slb-ui-primary;
      box-shadow: 0 0 0 3px $slb-ui-primary-ring;
    }
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: $slb-ui-space-4;
    padding-top: 4px;
  }
}
</style>
