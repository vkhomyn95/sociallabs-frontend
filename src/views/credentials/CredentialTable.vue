<script setup lang="ts">
import { computed } from 'vue'
import { SlbButton, SlbDropdown, SlbTable } from '@sociallabs/frontend-components'
import type { MenuItem, SortState, TableColumn } from '@sociallabs/frontend-components'
import { CredentialKind, useCredentialStore } from '@/stores/credential'
import type { Credential, CredentialSortKey } from '@/stores/credential'
import CredentialPlatformIcon from '@/components/credential/CredentialPlatformIcon.vue'
import CredentialStatusBadge from '@/components/credential/CredentialStatusBadge.vue'
import {
  PHONE_METADATA_KEY,
  accountPhone,
  credentialHints,
  formatRelativeDate,
} from '@/components/credential/credential-ui'
import { CredentialAction } from './credential-actions'

const props = defineProps<{
  kind: CredentialKind
  items: Credential[]
  total: number
  loading: boolean
  emptyText: string
}>()

const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })
const emit = defineEmits<{
  sort: [key: CredentialSortKey, direction: 'asc' | 'desc']
  action: [action: CredentialAction, credential: Credential]
}>()

const store = useCredentialStore()

const NAME_COLUMN: TableColumn<Credential> = { key: 'name', label: 'Name', sortable: true, minWidth: '260px' }
// Accounts are told apart by phone: it comes from the authorized profile and is read-only.
const PHONE_COLUMN: TableColumn<Credential> = { key: 'phone', label: 'Phone', width: '170px' }
const COMMON_COLUMNS: TableColumn<Credential>[] = [
  { key: 'type', label: 'Type', sortable: true, width: '180px' },
  { key: 'status', label: 'Status', sortable: true, width: '140px' },
  { key: 'usageCount', label: 'Used in', width: '110px', align: 'right' },
  { key: 'createdAt', label: 'Created', sortable: true, width: '130px' },
  { key: 'actions', label: '', width: '56px', align: 'right', fixed: 'right' },
]

const isAccount = computed(() => props.kind === CredentialKind.ACCOUNT)
const columns = computed(() =>
  isAccount.value ? [NAME_COLUMN, PHONE_COLUMN, ...COMMON_COLUMNS] : [NAME_COLUMN, ...COMMON_COLUMNS],
)
// The phone has its own column on accounts, so it is not repeated under the name.
const hintExclude = computed(() => (isAccount.value ? [PHONE_METADATA_KEY] : []))

function hints(credential: Credential): string {
  return credentialHints(credential, 2, hintExclude.value).join(' · ')
}

const MENU: MenuItem[] = [
  { key: CredentialAction.TEST, label: 'Test connection', icon: 'dev_plug' },
  { key: CredentialAction.EDIT, label: 'Edit', icon: 'action_edit' },
  { key: 'divider', type: 'divider' },
  { key: CredentialAction.DELETE, label: 'Delete', icon: 'action_trash', danger: true },
]

function onSort(state: SortState): void {
  // Clearing the sort falls back to the default order.
  if (!state.key || !state.direction) emit('sort', 'createdAt', 'desc')
  else emit('sort', state.key as CredentialSortKey, state.direction)
}

function onMenu(item: MenuItem, credential: Credential): void {
  emit('action', item.key as CredentialAction, credential)
}
</script>

<template>
  <SlbTable
    v-model:page="page"
    v-model:page-size="pageSize"
    :columns="columns"
    :data="items"
    :total="total"
    :loading="loading"
    fill
    :empty-text="emptyText"
    empty-icon="object_box"
    @sort="onSort"
  >
    <template #cell-name="{ row }">
      <div class="slb-cred-list__identity">
        <CredentialPlatformIcon :platform="row.platform" :size="32" />
        <div class="slb-cred-list__identity-text">
          <span class="slb-cred-list__name">{{ row.name }}</span>
          <span v-if="hints(row)" class="slb-cred-list__hints">{{ hints(row) }}</span>
        </div>
      </div>
    </template>

    <template #cell-phone="{ row }">
      <span v-if="accountPhone(row)" class="slb-cred-list__phone">{{ accountPhone(row) }}</span>
      <span v-else class="slb-cred-list__muted">—</span>
    </template>

    <template #cell-type="{ row }">
      {{ store.typeDescriptor(row.type)?.displayName ?? row.type }}
    </template>

    <template #cell-status="{ row }">
      <CredentialStatusBadge :status="row.status" :message="row.statusMessage" />
    </template>

    <template #cell-usageCount="{ row }">
      <span :class="{ 'slb-cred-list__muted': !row.usageCount }">
        {{ row.usageCount ? `${row.usageCount} node${row.usageCount === 1 ? '' : 's'}` : '—' }}
      </span>
    </template>

    <template #cell-createdAt="{ row }">
      {{ formatRelativeDate(row.createdAt) }}
    </template>

    <template #cell-actions="{ row }">
      <SlbDropdown :items="MENU" placement="bottom-end" @select="onMenu($event, row)">
        <SlbButton variant="ghost" size="sm" icon-only icon-left="menu_dots" :aria-label="`Actions for ${row.name}`" />
      </SlbDropdown>
    </template>
  </SlbTable>
</template>
