import { markRaw, ref } from 'vue';
import SettingIcon from '@/components/sidebar/icons/SettingIcon.vue'
import HomeIcon from '@/components/sidebar/icons/HomeIcon.vue'
import UserIcon from '@/components/sidebar/icons/UserIcon.vue'
import ToolsIcon from '@/components/sidebar/icons/ToolsIcon.vue'
import MicIcon from '@/components/sidebar/icons/MicIcon.vue'
import MessageCircleIcon from '@/components/sidebar/icons/MessageCircleIcon.vue'
import SmartphoneIcon from '@/components/sidebar/icons/SmartphoneIcon.vue'
import BellIcon from '@/components/sidebar/icons/Bellicon.vue'
import CodeIcon from '@/components/sidebar/icons/CodeIcon.vue'

const menuItems = ref([
  {
    component: 'div',
    class: 'sidebar__item platform-selector',
    icon: markRaw(SettingIcon),
    text: 'Agents Platform',
    hasDropdown: true,
    tooltip: 'Agents Platform'
  },
  {
    component: 'div',
    class: 'sidebar__item active',
    icon: markRaw(HomeIcon),
    text: 'Workflows',
    tooltip: 'Workflows'
  },
  {
    component: 'div',
    class: 'sidebar__section',
    text: 'Build'
  },
  {
    component: 'div',
    class: 'sidebar__item',
    icon: markRaw(UserIcon),
    text: 'Agents',
    tooltip: 'Agents',
    hasAction: true
  },
  {
    component: 'div',
    class: 'sidebar__item',
    icon: markRaw(ToolsIcon),
    text: 'Tools',
    tooltip: 'Tools'
  },
  {
    component: 'div',
    class: 'sidebar__item',
    icon: markRaw(MicIcon),
    text: 'Voices',
    tooltip: 'Voices',
    hasAction: true
  },
  {
    component: 'div',
    class: 'sidebar__section',
    text: 'Evaluate'
  },
  {
    component: 'div',
    class: 'sidebar__item',
    icon: markRaw(MessageCircleIcon),
    text: 'Conversations',
    tooltip: 'Conversations'
  },
  {
    component: 'div',
    class: 'sidebar__section',
    text: 'Telephony'
  },
  {
    component: 'div',
    class: 'sidebar__item',
    icon: markRaw(SmartphoneIcon),
    text: 'Outbound',
    tooltip: 'Outbound'
  },
  {
    component: 'div',
    class: 'sidebar__spacer'
  },
  {
    component: 'div',
    class: 'sidebar__item',
    icon: markRaw(CodeIcon),
    text: 'Developers',
    tooltip: 'Developers'
  },
  {
    component: 'div',
    class: 'sidebar__item',
    icon: markRaw(BellIcon),
    text: 'Notifications',
    tooltip: 'Notifications'
  }
]);

export function useMenuItems() {
  return {
    menuItems
  };
}
