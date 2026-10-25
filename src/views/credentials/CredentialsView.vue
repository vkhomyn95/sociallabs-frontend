<script setup lang="ts">
import { computed, onMounted, ref, toRef } from 'vue'
import { SlbAlert, SlbButton, SlbConfirmModal, SlbIcon, SlbInput, SlbSelect, SlbToastProvider, slbToast } from '@sociallabs/frontend-components'
import type { SelectOption } from '@sociallabs/frontend-components'
import { CredentialService, CredentialStatus, useCredentialStore } from '@/stores/credential'
import type { Credential, CredentialKind } from '@/stores/credential'
import CredentialCreateModal from '@/components/credential/CredentialCreateModal.vue'
import CredentialEditModal from '@/components/credential/CredentialEditModal.vue'
import { KIND_UI, STATUS_UI, toApiError } from '@/components/credential/credential-ui'
import CredentialTable from './CredentialTable.vue'
import { CredentialAction } from './credential-actions'
import { useCredentialList } from './useCredentialList'

/**
 * One page per credential kind (Accounts, Bots, AI providers, Credentials);
 * the kind comes from the route.
 */
const props = defineProps<{ kind: CredentialKind }>()

const store = useCredentialStore()
const list = useCredentialList(toRef(props, 'kind'))
const { items, total, loading, loaded, error, page, pageSize, filters } = list

const ui = computed(() => KIND_UI[props.kind])
const createOpen = ref(false)
const editing = ref<Credential | null>(null)
const editOpen = ref(false)
const deleting = ref<Credential | null>(null)
const deleteOpen = ref(false)
const deleteBusy = ref(false)

const typeOptions = computed<SelectOption[]>(() =>
  store.typesOfKind(props.kind).map((d) => ({ value: d.type, label: d.displayName })),
)
const statusOptions: SelectOption[] = Object.values(CredentialStatus).map((status) => ({
  value: status,
  label: STATUS_UI[status].label,
}))

const hasFilters = computed(() => !!(filters.search || filters.status || filters.type))
const isEmpty = computed(() => loaded.value && !total.value && !hasFilters.value)

onMounted(() => void store.LOAD_TYPES())

// ─── Row actions ──────────────────────────────────────────────────────

async function test(credential: Credential): Promise<void> {
  try {
    const result = await CredentialService.test(credential.id)
    list.replace(result.credential)
    if (!result.supported) slbToast.info(result.message)
    else if (result.success) slbToast.success(`${credential.name}: ${result.message}`)
    else slbToast.error(`${credential.name}: ${result.message}`)
  } catch (e) {
    slbToast.error(toApiError(e, 'Test failed').message)
  }
}

function edit(credential: Credential): void {
  editing.value = credential
  editOpen.value = true
}

function askDelete(credential: Credential): void {
  deleting.value = credential
  deleteOpen.value = true
}

async function confirmDelete(): Promise<void> {
  if (!deleting.value) return
  deleteBusy.value = true
  try {
    await CredentialService.remove(deleting.value.id)
    slbToast.success(`${deleting.value.name} deleted`)
    deleteOpen.value = false
    await Promise.all([list.load(), store.LOAD_SUMMARY()])
  } catch (e) {
    slbToast.error(toApiError(e, 'Failed to delete').message)
  } finally {
    deleteBusy.value = false
  }
}

// Record — a new action without a handler does not compile.
const ACTIONS: Record<CredentialAction, (credential: Credential) => void> = {
  [CredentialAction.TEST]: test,
  [CredentialAction.EDIT]: edit,
  [CredentialAction.DELETE]: askDelete,
}

function onCreated(credential: Credential): void {
  slbToast.success(`${credential.name} added`)
  // Newest first: show page 1 (changing the page triggers the reload itself).
  if (page.value === 1) void list.load()
  else page.value = 1
}

function onSaved(credential: Credential): void {
  list.replace(credential)
  slbToast.success(`${credential.name} saved`)
}
</script>

<template>
  <div class="slb-cred-list">
    <div v-if="!isEmpty" class="slb-cred-list__toolbar">
      <SlbInput
        v-model="filters.search"
        class="slb-cred-list__search"
        size="sm"
        icon-left="action_search"
        placeholder="Search by name or description"
        clearable
      />
      <SlbSelect
        v-if="typeOptions.length > 1"
        v-model="filters.type"
        class="slb-cred-list__filter"
        size="sm"
        :options="typeOptions"
        placeholder="All types"
        clearable
      />
      <SlbSelect
        v-model="filters.status"
        class="slb-cred-list__filter"
        size="sm"
        :options="statusOptions"
        placeholder="Any status"
        clearable
      />
      <SlbButton
        class="slb-cred-list__add"
        icon-left="action_plus"
        @click="createOpen = true"
      >
        {{ ui.addLabel }}
      </SlbButton>
    </div>

    <SlbAlert v-if="error" variant="error" class="slb-cred-list__error">{{ error }}</SlbAlert>

    <div v-if="isEmpty" class="slb-cred-list__empty">
      <span class="slb-cred-list__empty-icon"><SlbIcon name="object_box" :size="28" /></span>
      <h2>{{ ui.emptyTitle }}</h2>
      <p>{{ ui.emptyText }}</p>
      <SlbButton icon-left="action_plus" @click="createOpen = true">{{ ui.addLabel }}</SlbButton>
    </div>

    <CredentialTable
      v-else
      :kind="kind"
      v-model:page="page"
      v-model:page-size="pageSize"
      :items="items"
      :total="total"
      :loading="loading"
      :empty-text="hasFilters ? 'Nothing matches the filters' : ui.emptyTitle"
      @sort="(key, direction) => (list.sort.value = { key, direction })"
      @action="(action, credential) => ACTIONS[action](credential)"
    />

    <CredentialCreateModal v-model="createOpen" :kind="kind" @created="onCreated" />
    <CredentialEditModal v-model="editOpen" :credential="editing" @saved="onSaved" />
    <SlbConfirmModal
      v-model="deleteOpen"
      title="Delete credential"
      :message="`Delete «${deleting?.name}»? This cannot be undone.`"
      confirm-label="Delete"
      :loading="deleteBusy"
      danger
      @confirm="confirmDelete"
    />

    <SlbToastProvider />
  </div>
</template>

<style lang="scss">
@use './credentials.scss';
</style>
