<script setup lang="ts">
import { computed } from 'vue'
import { SlbBadge, SlbButton, SlbDropdown, SlbIcon, SlbTooltip } from '@sociallabs/frontend-components'
import type { MenuItem } from '@sociallabs/frontend-components'
import { accountById, channelById } from '@/views/dialogs/dialogs.mock'
import { PROVIDER_META, STATUS_META } from './agents.mock'
import { AgentCardAction, AgentStatus, isAgentCardAction } from './agents.types'
import type { Agent } from './agents.types'

const props = defineProps<{ agent: Agent }>()
const emit = defineEmits<{ open: []; action: [action: AgentCardAction] }>()

const status = computed(() => STATUS_META[props.agent.status])
const provider = computed(() => PROVIDER_META[props.agent.provider])
const accounts = computed(() => props.agent.accountIds.map(accountById))
const hasStats = computed(() => props.agent.stats.conversations7d > 0)

const menu = computed<MenuItem[]>(() => [
  { key: AgentCardAction.EDIT, label: 'Edit', icon: 'action_edit' },
  props.agent.status === AgentStatus.ACTIVE
    ? { key: AgentCardAction.TOGGLE, label: 'Pause', icon: 'media_pause' }
    : { key: AgentCardAction.TOGGLE, label: 'Activate', icon: 'media_play' },
  { key: AgentCardAction.DUPLICATE, label: 'Duplicate', icon: 'action_copy' },
  { key: 'divider', type: 'divider' },
  { key: AgentCardAction.DELETE, label: 'Delete', icon: 'action_trash', danger: true },
])

const onMenu = (item: MenuItem): void => {
  if (isAgentCardAction(item.key)) emit('action', item.key)
}
</script>

<template>
  <article
    class="ag-card"
    tabindex="0"
    :aria-label="`Open agent ${agent.name}`"
    @click="emit('open')"
    @keydown.enter.self="emit('open')"
  >
    <header class="ag-card__head">
      <span class="ag-card__icon" :class="`ag-tone--${agent.color}`">
        <SlbIcon :name="agent.icon" :size="20" />
      </span>
      <div class="ag-card__title">
        <h3 class="ag-card__name">{{ agent.name }}</h3>
        <span class="ag-card__model">
          <SlbIcon :name="provider.icon" :size="12" />
          {{ agent.model }}
        </span>
      </div>
      <SlbBadge :color="status.color" dot>{{ status.label }}</SlbBadge>
      <SlbDropdown :items="menu" placement="bottom-end" @select="onMenu" @click.stop>
        <SlbButton variant="ghost" size="sm" icon-only icon-left="menu_dots_h" :aria-label="`${agent.name} actions`" />
      </SlbDropdown>
    </header>

    <p class="ag-card__desc">{{ agent.description || 'No description yet.' }}</p>

    <dl v-if="hasStats" class="ag-card__stats">
      <div>
        <dt>Conversations · 7d</dt>
        <dd>{{ agent.stats.conversations7d.toLocaleString() }}</dd>
      </div>
      <div>
        <dt>Resolved by AI</dt>
        <dd>{{ agent.stats.resolvedRate }}%</dd>
      </div>
      <div>
        <dt>Handed off</dt>
        <dd>{{ agent.stats.handoffRate }}%</dd>
      </div>
    </dl>
    <p v-else class="ag-card__stats ag-card__stats--empty">No conversations yet</p>

    <footer class="ag-card__foot">
      <div class="ag-card__channels">
        <SlbTooltip v-for="a in accounts" :key="a.id" :content="`${a.name} · ${a.handle}`" :arrow="false">
          <span class="ag-card__channel" :style="{ background: channelById(a.channel).color }">
            <SlbIcon :name="channelById(a.channel).icon" :size="12" color="#fff" />
          </span>
        </SlbTooltip>
        <span v-if="!accounts.length" class="ag-card__muted">Not connected</span>
      </div>
      <span class="ag-card__muted">
        <SlbIcon name="action_wrench" :size="12" /> {{ agent.toolIds.length }} tools · {{ agent.updatedAt }}
      </span>
    </footer>
  </article>
</template>
