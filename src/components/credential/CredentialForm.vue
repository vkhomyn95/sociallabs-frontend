<script setup lang="ts">
import { computed, ref } from 'vue'
import { SlbAlert, SlbInput } from '@sociallabs/frontend-components'
import { CredentialService, SetupMode } from '@/stores/credential'
import type { Credential, CredentialTypeDescriptor } from '@/stores/credential'
import CredentialPlatformIcon from './CredentialPlatformIcon.vue'
import CredentialFields from './CredentialFields.vue'
import { useCredentialForm } from './useCredentialForm'
import { toApiError } from './credential-ui'

/**
 * Create or edit a credential of a FORM type (interactive accounts only edit name/description).
 * Exposes `submit()` so the surrounding modal owns the buttons.
 */
const props = defineProps<{
  descriptor: CredentialTypeDescriptor
  /** Credential being edited; omitted when creating. */
  credential?: Credential
}>()

const emit = defineEmits<{ saved: [credential: Credential] }>()

const editing = !!props.credential
const name = ref(props.credential?.name ?? '')
const description = ref(props.credential?.description ?? '')
const busy = ref(false)
const error = ref<string | null>(null)

// Interactive accounts are re-connected, not edited, so they expose no data fields here.
const dataFields = computed(() => (props.descriptor.setupMode === SetupMode.FORM ? props.descriptor.fields : []))
const form = useCredentialForm(dataFields, editing)

const canSubmit = computed(() => !busy.value && form.isComplete.value && (!editing || !!name.value.trim()))

/**
 * Validate and persist the form.
 *
 * @returns true when saved
 */
async function submit(): Promise<boolean> {
  if (!canSubmit.value) return false
  busy.value = true
  error.value = null
  form.setErrors({})
  try {
    const saved = editing
      ? await CredentialService.update(props.credential!.id, {
          name: name.value.trim(),
          description: description.value.trim() || undefined,
          data: dataFields.value.length ? form.payload() : undefined,
        })
      : await CredentialService.create({
          type: props.descriptor.type,
          name: name.value.trim() || undefined,
          description: description.value.trim() || undefined,
          data: form.payload(),
        })
    emit('saved', saved)
    return true
  } catch (e) {
    const apiError = toApiError(e, 'Failed to save credential')
    error.value = apiError.message
    form.setErrors(apiError.fields)
    return false
  } finally {
    busy.value = false
  }
}

defineExpose({ submit, canSubmit, busy })
</script>

<template>
  <form class="slb-cred-form" @submit.prevent="submit">
    <div class="slb-cred-form__type">
      <CredentialPlatformIcon :platform="descriptor.platform" />
      <div>
        <div class="slb-cred-form__type-name">{{ descriptor.displayName }}</div>
        <div class="slb-cred-form__type-desc">{{ descriptor.description }}</div>
      </div>
    </div>

    <SlbAlert v-if="error" variant="error">{{ error }}</SlbAlert>

    <SlbInput
      v-model="name"
      label="Name"
      :required="editing"
      :placeholder="editing ? undefined : 'Generated automatically if empty'"
    />

    <template v-if="dataFields.length">
      <h3 class="slb-cred-form__section-title">Connection</h3>
      <CredentialFields :form="form" />
    </template>

    <SlbInput v-model="description" label="Description" placeholder="Optional note for your team" />

    <!-- Enter submits the form; buttons live in the modal footer. -->
    <button type="submit" hidden />
  </form>
</template>

<style lang="scss">
.slb-cred-form {
  display: flex;
  flex-direction: column;
  gap: var(--slb-space-lg);

  &__type {
    display: flex;
    align-items: center;
    gap: var(--slb-space-base);
    padding-bottom: var(--slb-space-base);
    border-bottom: 1px solid var(--slb-color-border);
  }
  &__type-name { font-weight: var(--slb-fw-semibold); color: var(--slb-color-gray-900); }
  &__type-desc { font-size: var(--slb-font-sm); color: var(--slb-color-text-muted); }
  &__section-title {
    margin: 0;
    font-size: var(--slb-font-sm);
    font-weight: var(--slb-fw-semibold);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--slb-color-text-muted);
  }
}
</style>
