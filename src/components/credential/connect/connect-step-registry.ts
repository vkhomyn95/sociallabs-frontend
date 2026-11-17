import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'
import { ConnectView } from './connect.types'
import ConnectWaitingStep from './ConnectWaitingStep.vue'

// Registry of connection flow screens (PARAMS is rendered by the flow itself).
// Record makes a missing screen a compile error.

export const CONNECT_STEP_REGISTRY: Record<Exclude<ConnectView, ConnectView.PARAMS>, Component> = {
  // Shown right after start — no async, so nothing flickers.
  [ConnectView.WAITING]: ConnectWaitingStep,

  [ConnectView.QR]:
    defineAsyncComponent(() =>
      import('./ConnectQrStep.vue')
    ),

  [ConnectView.AUTHORIZE]:
    defineAsyncComponent(() =>
      import('./ConnectAuthorizeStep.vue')
    ),

  [ConnectView.INPUT]:
    defineAsyncComponent(() =>
      import('./ConnectInputStep.vue')
    ),

  [ConnectView.SUCCESS]:
    defineAsyncComponent(() =>
      import('./ConnectResultStep.vue')
    ),

  [ConnectView.ERROR]:
    defineAsyncComponent(() =>
      import('./ConnectResultStep.vue')
    ),
}
