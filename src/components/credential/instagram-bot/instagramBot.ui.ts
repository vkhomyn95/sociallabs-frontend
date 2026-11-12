import { metaBotStatus } from '../meta-bot/metaBot.service'
import type { MetaBotPlatformUi } from '../meta-bot/metaBot.ui'

/** The Instagram bot's panel: a professional account by its handle, on the customer's Meta app (ADR-0019, mode A). */
export const INSTAGRAM_BOT_UI: MetaBotPlatformUi = {
  title: 'Account delivery',
  loadError: 'Could not load the account status',
  icon: 'brand_instagram',
  load: metaBotStatus('instagram-bot'),
  accountLine: (account) => (account.name ? `@${account.username} · ${account.name}` : `@${account.username}`),
  dashboardSteps: [
    'In the Meta App Dashboard, open your app → Instagram → API setup with Instagram login.',
    'Under “Configure webhooks”, paste the callback URL and verify token below and press “Verify and save”.',
    'Subscribe the fields: messages, messaging_postbacks, messaging_seen, message_reactions, messaging_referral, comments.',
    'Switch the app to Live: Meta delivers webhooks of users only to a live app.',
  ],
  notes: [
    {
      title: 'Users write first',
      text:
        'The account may answer a user within 24 hours of their last message; it cannot start a conversation. A ' +
        'comment may get one private reply within 7 days.',
    },
    {
      title: 'Token renewal',
      text:
        'The token lives 60 days; the server renews it on its own before it expires. A token left to expire cannot ' +
        'be renewed: generate a new one in the Meta app.',
    },
  ],
}
