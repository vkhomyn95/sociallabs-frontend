<script setup lang="ts">
import { SlbIcon } from '@sociallabs/frontend-components'

defineProps<{ message: string }>()
</script>

<template>
  <div class="slb-cred-connect">
    <SlbIcon name="shape_spinner" :size="32" class="slb-cred-connect__spinner" />
    <p class="slb-cred-connect__message">{{ message }}</p>
  </div>
</template>
