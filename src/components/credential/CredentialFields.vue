<script setup lang="ts">
import CredentialFieldInput from './CredentialFieldInput.vue'
import type { CredentialForm } from './useCredentialForm'

defineProps<{ form: CredentialForm }>()
</script>

<template>
  <CredentialFieldInput
    v-for="field in form.visibleFields.value"
    :key="field.key"
    :model-value="form.values[field.key]"
    :field="field"
    :required="form.isRequired(field)"
    :editing="form.editing"
    :error="form.errors[field.key]"
    @update:model-value="form.setValue(field.key, $event ?? null)"
  />
</template>
