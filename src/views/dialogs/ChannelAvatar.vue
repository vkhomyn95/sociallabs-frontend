<script setup lang="ts">
import { computed } from 'vue'
import { SlbAvatar, SlbIcon } from '@sociallabs/frontend-components'
import type { AvatarSize } from '@sociallabs/frontend-components'
import { accountById, channelById } from './dialogs.mock'

const props = withDefaults(defineProps<{ name: string; accountId: string; size?: AvatarSize; group?: boolean }>(), {
  size: 'md',
  group: false,
})

const account = computed(() => accountById(props.accountId))
const channel = computed(() => channelById(account.value.channel))
</script>

<template>
  <span class="ch-avatar" :class="`ch-avatar--${size}`">
    <SlbAvatar :name="name" :size="size" :shape="group ? 'rounded' : 'circle'">
      <SlbIcon v-if="group" name="object_users" :size="18" />
    </SlbAvatar>
    <span class="ch-avatar__badge" :style="{ background: channel.color }" :title="channel.label">
      <SlbIcon :name="channel.icon" :size="10" color="#fff" />
    </span>
  </span>
</template>

<style scoped>
.ch-avatar { position: relative; display: inline-flex; flex-shrink: 0; }
.ch-avatar__badge {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 18px;
  height: 18px;
  border-radius: var(--slb-radius-full);
  border: 2px solid var(--slb-color-white);
  display: grid;
  place-items: center;
}
.ch-avatar--lg .ch-avatar__badge, .ch-avatar--xl .ch-avatar__badge { width: 22px; height: 22px; }
</style>
