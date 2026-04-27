import { reactive } from 'vue';
import type { TooltipState } from './sidebar.ts';
import type { MenuItem } from './sidebar.ts';

export function useTooltip(isCollapsed: { value: boolean }) {
  const tooltipState = reactive<TooltipState>({
    show: false,
    text: '',
    targetElement: null,
  });

  const handleMouseEnter = (
    event: MouseEvent,
    item: MenuItem | { tooltip?: string }
  ): void => {
    if (isCollapsed.value && item.tooltip) {
      tooltipState.show = true;
      tooltipState.text = item.tooltip;
      tooltipState.targetElement = event.currentTarget as HTMLElement;
    }
  };

  const handleMouseLeave = (): void => {
    tooltipState.show = false;
    tooltipState.text = '';
    tooltipState.targetElement = null;
  };

  return {
    tooltipState,
    handleMouseEnter,
    handleMouseLeave,
  };
}
