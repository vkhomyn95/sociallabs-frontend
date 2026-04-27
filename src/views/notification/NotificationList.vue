<script setup lang="ts">
import { ref, computed } from 'vue'
import SlbButton from '@/components/ui/button/SlbButton.vue'

type NotifType = 'billing' | 'warning' | 'info' | 'success' | 'error'
type NotifFilter = 'all' | 'unread' | NotifType

interface Notification {
  id: number
  type: NotifType
  title: string
  message: string
  time: string
  read: boolean
}

const notifications = ref<Notification[]>([
  {
    id: 1,
    type: 'billing',
    title: 'Execution quota reached',
    message: 'You have used 100% of your monthly execution quota (1,000 / 1,000). Workflows will pause until the quota resets on May 19, 2026 or you upgrade your plan.',
    time: '2 minutes ago',
    read: false,
  },
  {
    id: 2,
    type: 'warning',
    title: 'Trigger limit approaching',
    message: 'You have used 18 of your 20 available triggers (90%). Consider reviewing unused triggers or upgrading your plan to avoid disruptions.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 3,
    type: 'warning',
    title: 'Workflow limit approaching',
    message: 'You have created 9 of 10 allowed workflows (90%). You are 1 workflow away from reaching your plan limit.',
    time: '3 hours ago',
    read: false,
  },
  {
    id: 4,
    type: 'success',
    title: 'Workflow "Email Digest" completed',
    message: 'Your workflow ran successfully and processed 214 items in 4.2 seconds.',
    time: 'Yesterday, 09:15',
    read: true,
  },
  {
    id: 5,
    type: 'info',
    title: 'Quota reset in 3 days',
    message: 'Your monthly quota will reset on May 19, 2026. All counters (executions, workflows, triggers) will return to zero.',
    time: 'Yesterday, 08:00',
    read: true,
  },
  {
    id: 6,
    type: 'error',
    title: 'Workflow "Slack Alert" failed',
    message: 'Execution #4821 failed at step "Post Message" due to an invalid API token. Please update your Slack credentials.',
    time: '2 days ago',
    read: true,
  },
  {
    id: 7,
    type: 'billing',
    title: 'Invoice #INV-0042 available',
    message: 'Your invoice for the Pro plan (April 2026) is ready. You can download it from your billing settings.',
    time: 'Apr 1, 2026',
    read: true,
  },
  {
    id: 8,
    type: 'info',
    title: 'New feature: Conditional branches',
    message: 'You can now add conditional branching logic to any workflow step. Check out the documentation to get started.',
    time: 'Mar 28, 2026',
    read: true,
  },
])

// ── Filters ─────────────────────────────────────────────────────────────────
const activeFilter = ref<NotifFilter>('all')

const filters: { key: NotifFilter; label: string }[] = [
  { key: 'all',     label: 'All' },
  { key: 'unread',  label: 'Unread' },
  { key: 'billing', label: 'Billing' },
  { key: 'warning', label: 'Warnings' },
  { key: 'error',   label: 'Errors' },
  { key: 'success', label: 'Success' },
  { key: 'info',    label: 'Info' },
]

const filtered = computed(() => {
  const f = activeFilter.value
  if (f === 'all')    return notifications.value
  if (f === 'unread') return notifications.value.filter(n => !n.read)
  return notifications.value.filter(n => n.type === f)
})

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

// ── Actions ─────────────────────────────────────────────────────────────────
const markRead = (id: number) => {
  const n = notifications.value.find(n => n.id === id)
  if (n) n.read = true
}

const markAllRead = () => {
  notifications.value.forEach(n => { n.read = true })
}

const dismiss = (id: number) => {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

// ── Icon / label helpers ─────────────────────────────────────────────────────
const typeIcon: Record<NotifType, string> = {
  billing: 'fa-solid fa-credit-card',
  warning: 'fa-solid fa-triangle-exclamation',
  info:    'fa-solid fa-circle-info',
  success: 'fa-solid fa-circle-check',
  error:   'fa-solid fa-circle-xmark',
}

const typeLabel: Record<NotifType, string> = {
  billing: 'Billing',
  warning: 'Warning',
  info:    'Info',
  success: 'Success',
  error:   'Error',
}
</script>

<template>
  <div class="slb-notifications">

    <!-- ── Header ─────────────────────────────────────────────────────────── -->
    <div class="slb-notifications__header">
      <div>
        <h1 class="slb-notifications__title">
          Notifications
          <span v-if="unreadCount" class="slb-notifications__badge">{{ unreadCount }}</span>
        </h1>
        <p class="slb-notifications__subtitle">Stay updated on billing, quota alerts, and workflow activity.</p>
      </div>
      <SlbButton
        v-if="unreadCount > 0"
        variant="secondary"
        size="md"
        @click="markAllRead"
      >
        <i class="fa-solid fa-check-double"></i> Mark all read
      </SlbButton>
    </div>

    <!-- ── Filter bar ──────────────────────────────────────────────────────── -->
    <div class="slb-notifications__filters" role="tablist">
      <button
        v-for="f in filters"
        :key="f.key"
        class="slb-notifications__filter-btn"
        :class="{ 'slb-notifications__filter-btn--active': activeFilter === f.key }"
        role="tab"
        :aria-selected="activeFilter === f.key"
        @click="activeFilter = f.key"
      >
        {{ f.label }}
        <span
          v-if="f.key === 'unread' && unreadCount"
          class="slb-notifications__filter-count"
        >{{ unreadCount }}</span>
      </button>
    </div>

    <!-- ── List ────────────────────────────────────────────────────────────── -->
    <div class="slb-notifications__list">

      <TransitionGroup name="slb-notif-list">
        <div
          v-for="n in filtered"
          :key="n.id"
          class="slb-notifications__item"
          :class="[
            `slb-notifications__item--${n.type}`,
            { 'slb-notifications__item--unread': !n.read }
          ]"
          @click="markRead(n.id)"
        >
          <!-- Icon -->
          <div class="slb-notifications__item-icon-wrap">
            <i :class="[typeIcon[n.type], 'slb-notifications__item-icon']"></i>
          </div>

          <!-- Body -->
          <div class="slb-notifications__item-body">
            <div class="slb-notifications__item-top">
              <span class="slb-notifications__item-type-tag" :class="`slb-notifications__item-type-tag--${n.type}`">
                {{ typeLabel[n.type] }}
              </span>
              <span class="slb-notifications__item-time">{{ n.time }}</span>
            </div>
            <div class="slb-notifications__item-title">{{ n.title }}</div>
            <div class="slb-notifications__item-message">{{ n.message }}</div>
          </div>

          <!-- Actions -->
          <div class="slb-notifications__item-actions">
            <span v-if="!n.read" class="slb-notifications__unread-dot" aria-label="Unread"></span>
            <button
              class="slb-notifications__dismiss-btn"
              aria-label="Dismiss"
              @click.stop="dismiss(n.id)"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      </TransitionGroup>

      <!-- Empty state -->
      <div v-if="filtered.length === 0" class="slb-notifications__empty">
        <i class="fa-regular fa-bell-slash slb-notifications__empty-icon"></i>
        <p class="slb-notifications__empty-text">No notifications here.</p>
      </div>

    </div>
  </div>
</template>

<style lang="scss">
@use './notification.scss';
</style>
