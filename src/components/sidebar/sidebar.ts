import type { Component } from 'vue';

export interface MenuItem {
  component: string | Component;
  class: string;
  text?: string;
  iconClass?: string;     // Font Awesome клас, напр. 'fa-solid fa-house'
  tooltip?: string;
  hasDropdown?: boolean;
  badge?: string;
  action?: string;
}

export interface TooltipState {
  show: boolean;
  text: string;
  targetElement: HTMLElement | null;
}
