<script setup lang="ts">
import type { TabItem, TabVariant } from './useTab'
import { useTab } from './useTab'

interface Props {
  modelValue: string
  tabs: TabItem[]
  variant?: TabVariant
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'line',
})

const emit = defineEmits<{
  'update:modelValue': [key: string]
  'change': [key: string]
}>()

const { isActive, select } = useTab(props)

const handleSelect = (tab: TabItem): void => {
  select(tab, emit)
}
</script>

<template>
  <div class="slb-tab" :class="`slb-tab--${variant}`">
    <div class="slb-tab__list" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        role="tab"
        class="slb-tab__btn"
        :class="{
          'slb-tab__btn--active': isActive(tab.key),
          'slb-tab__btn--disabled': tab.disabled,
        }"
        :aria-selected="isActive(tab.key)"
        :aria-controls="`slb-tabpanel-${tab.key}`"
        :disabled="tab.disabled"
        :tabindex="isActive(tab.key) ? 0 : -1"
        @click="handleSelect(tab)"
      >
        <i v-if="tab.icon" :class="tab.icon" aria-hidden="true"></i>
        <span>{{ tab.label }}</span>
        <span v-if="tab.badge !== undefined" class="slb-tab__badge">
          {{ tab.badge }}
        </span>
      </button>
    </div>

    <div class="slb-tab__panel">
      <template v-for="tab in tabs" :key="tab.key">
          <div
            v-if="isActive(tab.key)"
            :id="`slb-tabpanel-${tab.key}`"
            role="tabpanel"
          >
            <slot :name="tab.key" />
          </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss">
@use './tab.scss';
</style>
