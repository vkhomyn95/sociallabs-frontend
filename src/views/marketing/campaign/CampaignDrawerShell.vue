<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { SlbButton, SlbDrawer, SlbInput, SlbTab, slbToast } from '@sociallabs/frontend-components'
import type { SlbIconName, TabItem } from '@sociallabs/frontend-components'

/**
 * Спільна оболонка drawer кампанії: назва, вкладки Setup / Activity, footer.
 * Нова кампанія відкривається на Setup (Activity вимкнена), існуюча — на Activity.
 */
const props = defineProps<{
  isNew: boolean
  newTitle: string
  campaignName?: string
  activityLabel: string
  activityIcon: SlbIconName
  activityBadge?: number
  startLabel: string
}>()
const open = defineModel<boolean>({ required: true })
const name = defineModel<string>('name', { required: true })

const SETUP = 'setup'
const ACTIVITY = 'activity'
// Drawer монтується вже відкритим (новий key на кожне відкриття), тож початкова вкладка — одразу тут.
const tab = ref<string>(props.isNew ? SETUP : ACTIVITY)

watch(open, (isOpen) => {
  if (isOpen) tab.value = props.isNew ? SETUP : ACTIVITY
})

const tabs = computed<TabItem[]>(() => [
  { key: SETUP, label: 'Setup', icon: 'action_settings' },
  {
    key: ACTIVITY,
    label: props.activityLabel,
    icon: props.activityIcon,
    badge: props.isNew ? undefined : props.activityBadge,
    disabled: props.isNew,
  },
])

function start(): void {
  open.value = false
  slbToast.info('Preview only — campaigns are not implemented yet')
}
</script>

<template>
  <SlbDrawer v-model="open" placement="right" :size="680" :title="isNew ? newTitle : campaignName">
    <SlbTab v-model="tab" :tabs="tabs" variant="line">
      <template #[SETUP]>
        <div class="mk-form mk-broadcast">
          <SlbInput v-model="name" label="Campaign name" />
          <slot name="setup" />
        </div>
      </template>
      <template #[ACTIVITY]>
        <div class="mk-form mk-broadcast">
          <slot name="activity" />
        </div>
      </template>
    </SlbTab>

    <template #footer>
      <div class="mk-form__foot">
        <SlbButton variant="secondary" @click="open = false">Close</SlbButton>
        <SlbButton v-if="tab === SETUP" icon-left="media_play" @click="start">{{ isNew ? startLabel : 'Save' }}</SlbButton>
      </div>
    </template>
  </SlbDrawer>
</template>
