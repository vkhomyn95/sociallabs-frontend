import { metaBotStatus } from '../meta-bot/metaBot.service'
import type { MetaBotPlatformUi } from '../meta-bot/metaBot.ui'

/** The Messenger bot's panel: a Facebook page by its name, on the customer's Meta app (ADR-0020, mode A). */
export const MESSENGER_BOT_UI: MetaBotPlatformUi = {
  title: 'Page delivery',
  loadError: 'Could not load the page status',
  icon: 'brand_messenger',
  load: metaBotStatus('messenger-bot'),
  accountLine: (account) => account.name ?? account.id ?? '',
  dashboardSteps: [
    'In the Meta App Dashboard, open your app → Messenger → Messenger API settings.',
    'Under “Configure webhooks”, paste the callback URL and verify token below and press “Verify and save”.',
    'Add the page, then subscribe the fields: messages, messaging_postbacks, message_reactions, message_reads, ' +
      'message_deliveries, message_echoes, messaging_referrals, feed.',
    'Switch the app to Live: Meta delivers webhooks of people only to a live app.',
  ],
  notes: [
    {
      title: 'People write first',
      text:
        'The page may answer a person within 24 hours of their last message, or 7 days after they came from a ' +
        'Click-to-Messenger ad; it cannot start a conversation. Marked as a human agent, a person may answer for 7 ' +
        'days (needs App Review).',
    },
    {
      title: 'Page token',
      text:
        'A page token generated in the App Dashboard does not expire. It stops working when the person who made it ' +
        'loses their role on the page or changes their password: generate a new one then.',
    },
  ],
}
