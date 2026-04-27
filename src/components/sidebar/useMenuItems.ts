import { ref } from 'vue';
import type { MenuItem } from './sidebar.ts';

const menuItems = ref<MenuItem[]>([
  {
    component: 'div',
    class: 'slb-sidebar__item slb-sidebar__item--active',
    iconClass: 'fa-solid fa-hexagon-nodes',
    text: 'Workflows',
    tooltip: 'Workflows',
    action: '/workflows',
  },
  {
    component: 'div',
    class: 'slb-sidebar__item',
    iconClass: 'fa-solid fa-folder-closed',
    text: 'Executions',
    tooltip: 'Executions',
    action: '/executions',
  },
  {
    component: 'div',
    class: 'slb-sidebar__spacer',
  },
  {
    component: 'div',
    class: 'slb-sidebar__item',
    iconClass: 'fa-solid fa-code',
    text: 'Developers',
    tooltip: 'Developers',
  },
  {
    component: 'div',
    class: 'slb-sidebar__item',
    iconClass: 'fa-solid fa-bell',
    text: 'Notifications',
    tooltip: 'Notifications',
    action: '/notifications',
  },
  {
    component: 'div',
    class: 'slb-sidebar__item',
    iconClass: 'fa-solid fa-right-from-bracket',
    text: 'Log out',
    tooltip: 'Log out',
    action: 'logout',
  },
]);

export function useMenuItems() {
  return { menuItems };
}
