<script setup lang="ts">
import { ref } from 'vue'
import { SlbBadge, SlbButton, SlbIcon, SlbInput } from '@sociallabs/frontend-components'

// Список значень чіпами + поле «додати»: канали, групи, хештеги, ключові слова.
defineProps<{ placeholder?: string }>()
const items = defineModel<string[]>({ required: true })

const draft = ref('')

function add(): void {
  const v = draft.value.trim()
  if (v && !items.value.includes(v)) items.value = [...items.value, v]
  draft.value = ''
}
const remove = (v: string): void => {
  items.value = items.value.filter((x) => x !== v)
}
</script>

<template>
  <div class="mk-broadcast__add">
    <SlbInput v-model="draft" :placeholder="placeholder" @keydown.enter.prevent="add" />
    <SlbButton variant="secondary" icon-left="action_plus" @click="add">Add</SlbButton>
  </div>
  <div v-if="items.length" class="mk-cell__chips">
    <SlbBadge v-for="v in items" :key="v" color="primary">
      {{ v }}
      <button type="button" class="mk-broadcast__chip-x" :aria-label="`Remove ${v}`" @click="remove(v)">
        <SlbIcon name="action_close" :size="10" />
      </button>
    </SlbBadge>
  </div>
</template>
