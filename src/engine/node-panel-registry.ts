import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'
import { NodeDiscriminator } from '@/stores/node/types'

// Registry of node editor panels
// Add new node panels here only

const NODE_PANEL_REGISTRY: Partial<Record<NodeDiscriminator, Component>> = {
  [NodeDiscriminator.AI_AGENT]:
    defineAsyncComponent(() =>
      import('./nodes/ai-agent/AIAgentPanel.vue')
    ),

  [NodeDiscriminator.IF_LOGIC]:
    defineAsyncComponent(() =>
      import('./nodes/if-logic/IfLogicPanel.vue')
    ),

  [NodeDiscriminator.SWITCH_LOGIC]:
    defineAsyncComponent(() =>
      import('./nodes/switch-logic/SwitchLogicPanel.vue')
    ),

  [NodeDiscriminator.HTTP_REQUEST]:
    defineAsyncComponent(() =>
      import('./nodes/http-request/HTTPRequestPanel.vue')
    ),

  [NodeDiscriminator.TELEGRAM_BOT_TRIGGER]:
    defineAsyncComponent(() =>
      import('./nodes/telegram/bot-trigger/TelegramBotTriggerPanel.vue')
    ),

  [NodeDiscriminator.TELEGRAM_BOT_ACTION]:
    defineAsyncComponent(() =>
      import('./nodes/telegram/bot-action/TelegramBotActionPanel.vue')
    ),

  [NodeDiscriminator.TELEGRAM_CLIENT_ACTION]:
    defineAsyncComponent(() =>
      import('./nodes/telegram/client-action/TelegramClientActionPanel.vue')
    ),

  [NodeDiscriminator.TELEGRAM_CLIENT_TRIGGER]:
    defineAsyncComponent(() =>
      import('./nodes/telegram/client-trigger/TelegramClientTriggerPanel.vue')
    ),

  [NodeDiscriminator.VIBER_BOT_ACTION]:
    defineAsyncComponent(() =>
      import('./nodes/viber/bot-action/ViberBotActionPanel.vue')
    ),

  [NodeDiscriminator.VIBER_BOT_TRIGGER]:
    defineAsyncComponent(() =>
      import('./nodes/viber/bot-trigger/ViberBotTriggerPanel.vue')
    ),

  [NodeDiscriminator.VIBER_CLIENT_ACTION]:
    defineAsyncComponent(() =>
      import('./nodes/viber/client-action/ViberClientActionPanel.vue')
    ),

  [NodeDiscriminator.VIBER_CLIENT_TRIGGER]:
    defineAsyncComponent(() =>
      import('./nodes/viber/client-trigger/ViberClientTriggerPanel.vue')
    ),

  [NodeDiscriminator.WHATSAPP_BOT_ACTION]:
    defineAsyncComponent(() =>
      import('./nodes/whatsapp/bot-action/WhatsappBotActionPanel.vue')
    ),

  [NodeDiscriminator.WHATSAPP_BOT_TRIGGER]:
    defineAsyncComponent(() =>
      import('./nodes/whatsapp/bot-trigger/WhatsappBotTriggerPanel.vue')
    ),

  [NodeDiscriminator.WHATSAPP_CLIENT_ACTION]:
    defineAsyncComponent(() =>
      import('./nodes/whatsapp/client-action/WhatsappClientActionPanel.vue')
    ),

  [NodeDiscriminator.WHATSAPP_CLIENT_TRIGGER]:
    defineAsyncComponent(() =>
      import('./nodes/whatsapp/client-trigger/WhatsappClientTriggerPanel.vue')
    ),

  [NodeDiscriminator.MESSENGER_BOT_TRIGGER]:
    defineAsyncComponent(() =>
      import('./nodes/messenger/bot-trigger/MessengerTriggerPanel.vue')
    ),

  [NodeDiscriminator.MESSENGER_BOT_ACTION]:
    defineAsyncComponent(() =>
      import('./nodes/messenger/bot-action/MessengerActionPanel.vue')
    ),

  // [NodeDiscriminator.INSTAGRAM_BOT_TRIGGER]:
  //   defineAsyncComponent(() =>
  //     import('./nodes/instagram//MessengerTriggerPanel.vue')
  //   ),

  [NodeDiscriminator.INSTAGRAM_BOT_ACTION]:
    defineAsyncComponent(() =>
      import('./nodes/instagram/bot-action/InstagramActionPanel.vue')
    ),
}

/**
 * Resolve node panel component by discriminator
 */
export function resolveNodePanel(
  discriminator: string,
): Component | null {
  return (
    NODE_PANEL_REGISTRY[
      discriminator as NodeDiscriminator
      ] ?? null
  )
}
