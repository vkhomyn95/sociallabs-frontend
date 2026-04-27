import { ref, computed } from 'vue';

export function useSidebar() {
  const isCollapsed = ref<boolean>(false);

  const sidebarClasses = computed(() => ({
    'slb-sidebar': true,
    'slb-sidebar--collapsed': isCollapsed.value,
  }));

  const toggleCollapse = (): void => {
    isCollapsed.value = !isCollapsed.value;
  };

  return {
    isCollapsed,
    sidebarClasses,
    toggleCollapse,
  };
}
