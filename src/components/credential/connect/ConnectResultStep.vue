<script setup lang="ts">
import { SlbIcon } from '@sociallabs/frontend-components'
import type { Credential } from '@/stores/credential/types'

defineProps<{ credential?: Credential; message?: string }>()
</script>

<template>
  <div class="slb-cred-connect">
    <template v-if="credential">
      <SlbIcon name="status_success" :size="40" class="slb-cred-connect__result-icon--success" />
      <p class="slb-cred-connect__message"><strong>{{ credential.name }}</strong> is connected.</p>
    </template>
    <template v-else>
      <SlbIcon name="status_error" :size="40" class="slb-cred-connect__result-icon--error" />
      <p class="slb-cred-connect__message">{{ message }}</p>
    </template>
  </div>
</template>
