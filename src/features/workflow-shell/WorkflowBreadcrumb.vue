<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, type RouteLocationRaw } from 'vue-router'
import { SlbBreadcrumb, SlbIcon, type BreadcrumbItem } from '@sociallabs/frontend-components'
import { NAV, NavSection, navGroupOf } from '@/layouts/navigation'
import WorkflowNameInput from './WorkflowNameInput.vue'

interface Crumb extends BreadcrumbItem {
  to?: RouteLocationRaw
}

/**
 * Where a workflow page sits, like the header of the other pages: menu group › Workflows › the workflow.
 * The editor renames the workflow in its own crumb.
 */
const props = defineProps<{
  name: string
  renamable?: boolean
}>()

const emit = defineEmits<{ rename: [name: string] }>()

const router = useRouter()

/** Same separator as SlbBreadcrumb draws between its items. */
const SEPARATOR = 'arrow_right'

const parents = computed<Crumb[]>(() => {
  const workflows = NAV[NavSection.WORKFLOWS]
  const group = navGroupOf(NavSection.WORKFLOWS)
  const first = group?.sections[0]
  return [
    ...(group && first ? [{ label: group.label, to: { name: NAV[first].route } }] : []),
    { label: workflows.label, icon: workflows.icon, to: { name: workflows.route } },
  ]
})

const crumbs = computed<Crumb[]>(() => (props.renamable ? parents.value : [...parents.value, { label: props.name }]))

function onCrumb(_item: BreadcrumbItem, index: number): void {
  const target = crumbs.value[index]?.to
  if (target) void router.push(target)
}
</script>

<template>
  <nav class="wf-crumbs">
    <SlbBreadcrumb :items="crumbs" :separator="SEPARATOR" @item-click="onCrumb" />
    <template v-if="renamable">
      <span class="wf-crumbs__sep" aria-hidden="true"><SlbIcon :name="SEPARATOR" :size="14" /></span>
      <WorkflowNameInput :name="name" @rename="emit('rename', $event)" />
    </template>
  </nav>
</template>

<style scoped lang="scss">
.wf-crumbs {
  display: flex;
  gap: var(--slb-space-xs);
  align-items: center;
  min-width: 0;
}

.wf-crumbs__sep {
  display: inline-flex;
  color: var(--slb-color-gray-300);
}
</style>
