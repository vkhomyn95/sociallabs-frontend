import { Component } from 'vue';

export interface MenuItem {
  component: string | Component;
  class: string;
  text?: string;
  icon?: Component;
  tooltip?: string;
  hasDropdown?: boolean;
  badge?: string;
  action?: string;
}

export interface TooltipPosition {
  show: boolean;
  text: string;
  top: string;
  left: string;
}

export interface TooltipProps {
  show: boolean;
  text: string;
  targetElement: HTMLElement | null;
}
