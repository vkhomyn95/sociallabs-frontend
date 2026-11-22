import type { BadgeColor, SlbIconName } from '@sociallabs/frontend-components'
import {
  AudienceSource,
  CampaignStatus,
  CampaignType,
  CommentStatus,
  EngagementAction,
  ExecutorKind,
  JobStatus,
  LinkKind,
  Platform,
  PostStatus,
  RecipientStatus,
  ScrapeSource,
  TargetKind,
  TargetStatus,
} from './marketing.types'
import type {
  BroadcastRecipient,
  Campaign,
  CommentLogEntry,
  EngagementLogEntry,
  PlatformMeta,
  PostLogEntry,
  ScrapeJob,
  Target,
  TrackingLink,
} from './marketing.types'

// ── Довідники (Record — новий член enum без запису не скомпілюється) ──

export const PLATFORM_META: Record<Platform, PlatformMeta> = {
  [Platform.TELEGRAM]: { label: 'Telegram', icon: 'brand_telegram', color: '#229ed9' },
  [Platform.TIKTOK]: { label: 'TikTok', icon: 'brand_tiktok', color: '#111111' },
  [Platform.INSTAGRAM]: { label: 'Instagram', icon: 'brand_instagram', color: '#e1306c' },
  [Platform.X]: { label: 'X', icon: 'brand_x', color: '#000000' },
  [Platform.YOUTUBE]: { label: 'YouTube', icon: 'brand_youtube', color: '#ff0033' },
}

export const CAMPAIGN_TYPE_META: Record<CampaignType, { label: string; icon: SlbIconName; color: string; hint: string }> = {
  [CampaignType.COMMENTING]: {
    label: 'Commenting',
    icon: 'chat_bubble_text',
    color: 'violet',
    hint: 'Comment under every new post of the target channels',
  },
  [CampaignType.POSTING]: {
    label: 'Posting',
    icon: 'chat_broadcast',
    color: 'blue',
    hint: 'Publish an ad post into channels and groups on a schedule',
  },
  [CampaignType.BROADCAST]: {
    label: 'Broadcast',
    icon: 'action_send',
    color: 'cyan',
    hint: 'Send messages to users or groups from the audience base',
  },
  [CampaignType.ENGAGEMENT]: {
    label: 'Engagement',
    icon: 'chat_thumbs_up',
    color: 'pink',
    hint: 'Reactions, story views, follows — draw attention to the account',
  },
}

export const CAMPAIGN_STATUS_META: Record<CampaignStatus, { label: string; color: BadgeColor }> = {
  [CampaignStatus.RUNNING]: { label: 'Running', color: 'success' },
  [CampaignStatus.PAUSED]: { label: 'Paused', color: 'warning' },
  [CampaignStatus.DRAFT]: { label: 'Draft', color: 'gray' },
  [CampaignStatus.FINISHED]: { label: 'Finished', color: 'blue' },
}

export const SOURCE_META: Record<ScrapeSource, { label: string; icon: SlbIconName }> = {
  [ScrapeSource.CHANNEL_SEARCH]: { label: 'Channel search', icon: 'action_search' },
  [ScrapeSource.SIMILAR]: { label: 'Similar channels', icon: 'dev_sitemap' },
  [ScrapeSource.HASHTAG]: { label: 'Posts by hashtag', icon: 'chat_hash' },
  [ScrapeSource.KEYWORD_POSTS]: { label: 'Posts by keyword', icon: 'object_tag' },
  [ScrapeSource.CHAT_MEMBERS]: { label: 'Chat members', icon: 'object_users' },
}

export const JOB_STATUS_META: Record<JobStatus, { label: string; color: BadgeColor }> = {
  [JobStatus.RUNNING]: { label: 'Running', color: 'success' },
  [JobStatus.SCHEDULED]: { label: 'Scheduled', color: 'blue' },
  [JobStatus.PAUSED]: { label: 'Paused', color: 'warning' },
  [JobStatus.FAILED]: { label: 'Failed', color: 'error' },
}

export const TARGET_KIND_LABEL: Record<TargetKind, string> = {
  [TargetKind.CHANNEL]: 'Channel',
  [TargetKind.GROUP]: 'Group',
  [TargetKind.POST]: 'Post',
  [TargetKind.PROFILE]: 'Profile',
}

export const TARGET_STATUS_META: Record<TargetStatus, { label: string; color: BadgeColor }> = {
  [TargetStatus.NEW]: { label: 'New', color: 'sky' },
  [TargetStatus.APPROVED]: { label: 'Approved', color: 'primary' },
  [TargetStatus.IN_CAMPAIGN]: { label: 'In campaign', color: 'success' },
  [TargetStatus.EXCLUDED]: { label: 'Excluded', color: 'gray' },
  [TargetStatus.BLOCKED]: { label: 'Blocked us', color: 'error' },
}

export const LINK_KIND_LABEL: Record<LinkKind, string> = {
  [LinkKind.REDIRECT]: 'Redirect',
  [LinkKind.INVITE]: 'Invite link',
}

// ── Дані ──

export const CAMPAIGNS: Campaign[] = [
  {
    id: 'c1',
    name: 'AI comments · crypto channels',
    type: CampaignType.COMMENTING,
    platform: Platform.TELEGRAM,
    status: CampaignStatus.RUNNING,
    executor: { kind: ExecutorKind.AGENT, name: 'Коментатор (Sonnet)' },
    accounts: 6,
    targetList: 'Crypto UA · comments open',
    schedule: 'On every new post · 2–15 min delay',
    limits: '≤ 25 comments / account / day',
    stats: { targets: 184, actions: 2_431, clicks: 1_120, leads: 96, blocked: 7 },
    updatedAt: '5 min ago',
  },
  {
    id: 'c2',
    name: 'Weekly ad post · marketing chats',
    type: CampaignType.POSTING,
    platform: Platform.TELEGRAM,
    status: CampaignStatus.RUNNING,
    executor: { kind: ExecutorKind.WORKFLOW, name: 'Ad post rotation' },
    accounts: 3,
    targetList: 'Marketing groups · posting allowed',
    schedule: 'Mon, Thu · 10:00',
    limits: '1 post / chat / 3 days',
    stats: { targets: 42, actions: 318, clicks: 860, leads: 54, blocked: 3 },
    updatedAt: '1 h ago',
  },
  {
    id: 'c3',
    name: 'Welcome DM · webinar members',
    type: CampaignType.BROADCAST,
    platform: Platform.TELEGRAM,
    status: CampaignStatus.PAUSED,
    executor: { kind: ExecutorKind.WORKFLOW, name: 'Broadcast with follow-up' },
    accounts: 4,
    targetList: 'Members of @growth_chat',
    schedule: '09:00–20:00 · 40 / hour',
    limits: '≤ 30 new dialogs / account / day',
    stats: { targets: 1_950, actions: 1_204, clicks: 210, leads: 38, blocked: 22 },
    updatedAt: 'Yesterday',
  },
  {
    id: 'c4',
    name: '#smm comments under trending videos',
    type: CampaignType.COMMENTING,
    platform: Platform.TIKTOK,
    status: CampaignStatus.RUNNING,
    executor: { kind: ExecutorKind.AGENT, name: 'TikTok commenter' },
    accounts: 2,
    targetList: '#smm #marketingtips · last 24h',
    schedule: 'Every 2 h',
    limits: '≤ 40 comments / account / day',
    stats: { targets: 610, actions: 702, clicks: 340, leads: 21, blocked: 5 },
    updatedAt: '20 min ago',
  },
  {
    id: 'c5',
    name: 'Story mass-views · competitor audience',
    type: CampaignType.ENGAGEMENT,
    platform: Platform.TELEGRAM,
    status: CampaignStatus.DRAFT,
    executor: { kind: ExecutorKind.WORKFLOW, name: 'Story viewer' },
    accounts: 0,
    targetList: 'Members of 5 competitor chats',
    schedule: 'Not scheduled',
    limits: '≤ 500 views / account / day',
    stats: { targets: 0, actions: 0, clicks: 0, leads: 0, blocked: 0 },
    updatedAt: '3 days ago',
  },
]

export const SCRAPE_JOBS: ScrapeJob[] = [
  {
    id: 'j1',
    name: 'Crypto UA channels',
    platform: Platform.TELEGRAM,
    source: ScrapeSource.CHANNEL_SEARCH,
    query: ['крипта', 'біткоїн', 'трейдинг', 'crypto ua'],
    filters: ['≥ 1k subscribers', 'comments open', 'uk / ru', 'posted ≤ 7d'],
    account: '@vkhomyn',
    schedule: 'Daily · 03:00',
    status: JobStatus.SCHEDULED,
    found: 412,
    newLastRun: 18,
    lastRun: 'Today 03:00',
  },
  {
    id: 'j2',
    name: 'Similar to @marketing_ua',
    platform: Platform.TELEGRAM,
    source: ScrapeSource.SIMILAR,
    query: ['@marketing_ua', '@smm_hub'],
    filters: ['≥ 500 subscribers', 'depth 2'],
    account: '@growth_acc_2',
    schedule: 'Weekly · Mon',
    status: JobStatus.RUNNING,
    found: 236,
    newLastRun: 41,
    lastRun: 'Running · 64%',
  },
  {
    id: 'j3',
    name: 'TikTok #smm last 24h',
    platform: Platform.TIKTOK,
    source: ScrapeSource.HASHTAG,
    query: ['#smm', '#marketingtips', '#таргет'],
    filters: ['≥ 10k views', 'posted ≤ 24h', 'comments on'],
    account: 'sociallabs.tt',
    schedule: 'Every 2 h',
    status: JobStatus.RUNNING,
    found: 1_840,
    newLastRun: 72,
    lastRun: '12 min ago',
  },
  {
    id: 'j4',
    name: 'Members · @growth_chat',
    platform: Platform.TELEGRAM,
    source: ScrapeSource.CHAT_MEMBERS,
    query: ['@growth_chat'],
    filters: ['active ≤ 30d', 'has username', 'no bots'],
    account: '@vkhomyn',
    schedule: 'Once',
    status: JobStatus.FAILED,
    found: 1_950,
    newLastRun: 0,
    lastRun: 'Yesterday',
    note: 'FLOOD_WAIT 1840s — account rate-limited, resume later',
  },
  {
    id: 'j5',
    name: 'Instagram #coffeeshop posts',
    platform: Platform.INSTAGRAM,
    source: ScrapeSource.HASHTAG,
    query: ['#coffeeshop', '#кавʼярня'],
    filters: ['≥ 1k likes'],
    account: '—',
    schedule: 'Paused',
    status: JobStatus.PAUSED,
    found: 0,
    newLastRun: 0,
    lastRun: 'Never',
  },
]

export const TARGETS: Target[] = [
  t('t1', Platform.TELEGRAM, TargetKind.CHANNEL, 'Крипто Новини UA', '@crypto_news_ua', 48_200, true, 'uk', ['crypto', 'news'], 6.4, TargetStatus.IN_CAMPAIGN, 'Crypto UA channels', 'Nov 12', 31),
  t('t2', Platform.TELEGRAM, TargetKind.CHANNEL, 'Trading Room', '@trading_room', 21_900, true, 'uk', ['trading'], 9.1, TargetStatus.IN_CAMPAIGN, 'Crypto UA channels', 'Nov 12', 24),
  t('t3', Platform.TELEGRAM, TargetKind.GROUP, 'Маркетологи України', '@marketing_ua_chat', 12_400, true, 'uk', ['marketing', 'smm'], 4.2, TargetStatus.APPROVED, 'Similar to @marketing_ua', 'Nov 18', 0),
  t('t4', Platform.TELEGRAM, TargetKind.CHANNEL, 'Bitcoin Daily', '@btc_daily', 103_000, false, 'ru', ['crypto'], 2.1, TargetStatus.EXCLUDED, 'Crypto UA channels', 'Nov 12', 0),
  t('t5', Platform.TELEGRAM, TargetKind.GROUP, 'SMM Hub chat', '@smm_hub_chat', 8_300, true, 'uk', ['smm'], 7.8, TargetStatus.BLOCKED, 'Similar to @marketing_ua', 'Nov 15', 3),
  t('t6', Platform.TIKTOK, TargetKind.POST, '5 hooks for Reels that sell', '@growth.lab/video/7311', 184_000, true, 'en', ['smm', 'reels'], 11.3, TargetStatus.IN_CAMPAIGN, 'TikTok #smm last 24h', 'Today', 6),
  t('t7', Platform.TIKTOK, TargetKind.POST, 'Таргет за 10 хвилин', '@target.ua/video/7290', 62_500, true, 'uk', ['ads'], 8.7, TargetStatus.NEW, 'TikTok #smm last 24h', 'Today', 0),
  t('t8', Platform.TELEGRAM, TargetKind.CHANNEL, 'DeFi простими словами', '@defi_simple', 5_600, true, 'uk', ['crypto', 'defi'], 12.5, TargetStatus.NEW, 'Crypto UA channels', 'Today', 0),
  t('t9', Platform.TELEGRAM, TargetKind.PROFILE, 'Oksana M.', '@oksana_mkt', 0, false, 'uk', ['webinar'], 0, TargetStatus.APPROVED, 'Members · @growth_chat', 'Nov 20', 1),
]

function t(
  id: string,
  platform: Platform,
  kind: TargetKind,
  title: string,
  handle: string,
  audience: number,
  commentsOpen: boolean,
  language: string,
  topics: string[],
  er: number,
  status: TargetStatus,
  sourceJob: string,
  foundAt: string,
  leads: number,
): Target {
  return { id, platform, kind, title, handle, audience, commentsOpen, language, topics, er, status, sourceJob, foundAt, leads }
}

export const LINKS: TrackingLink[] = [
  { id: 'l1', url: 'sl.link/cr-news', kind: LinkKind.REDIRECT, campaign: 'AI comments · crypto channels', placement: '@crypto_news_ua', platform: Platform.TELEGRAM, clicks: 512, joins: 0, leads: 31, createdAt: 'Nov 12' },
  { id: 'l2', url: 't.me/+Xa9kQ2…', kind: LinkKind.INVITE, campaign: 'AI comments · crypto channels', placement: '@trading_room', platform: Platform.TELEGRAM, clicks: 0, joins: 288, leads: 24, createdAt: 'Nov 12' },
  { id: 'l3', url: 't.me/+Lm3pZ0…', kind: LinkKind.INVITE, campaign: 'Weekly ad post · marketing chats', placement: '@marketing_ua_chat', platform: Platform.TELEGRAM, clicks: 0, joins: 403, leads: 29, createdAt: 'Nov 3' },
  { id: 'l4', url: 'sl.link/tt-smm', kind: LinkKind.REDIRECT, campaign: '#smm comments under trending videos', placement: 'Bio link · sociallabs.tt', platform: Platform.TIKTOK, clicks: 340, joins: 0, leads: 21, createdAt: 'Nov 9' },
  { id: 'l5', url: 'sl.link/dm-web', kind: LinkKind.REDIRECT, campaign: 'Welcome DM · webinar members', placement: 'DM template v2', platform: Platform.TELEGRAM, clicks: 210, joins: 0, leads: 38, createdAt: 'Nov 19' },
]

/** Ідеї, які ще треба дослідити — показуються на сторінці Campaigns, щоб не загубились. */
export const ROADMAP_IDEAS: { title: string; text: string }[] = [
  { title: 'Account warm-up', text: 'New accounts act like humans for days before campaigns: read, react, join chats.' },
  { title: 'Proxies & rotation', text: 'One proxy per account, rotation of accounts inside a campaign, health score.' },
  { title: 'Anti-spam limits', text: 'Per-account daily caps, random delays, quiet hours, auto-pause on FLOOD_WAIT / spam block.' },
  { title: 'AI comment quality', text: 'Agent reads the post and writes a relevant comment; tone presets, A/B variants, banned words.' },
  { title: 'Inviting', text: 'Invite scraped users into own group / channel within platform limits.' },
  { title: 'Lead attribution', text: 'Unique link or invite per placement → lead in Dialogs carries the campaign and source channel.' },
]

// ── Broadcast ──

export const AUDIENCE_SOURCE_META: Record<AudienceSource, { label: string; hint: string }> = {
  [AudienceSource.GROUP_MEMBERS]: {
    label: 'Group members',
    hint: 'Every member of the group or supergroup who is visible in the member list.',
  },
  [AudienceSource.CHANNEL_COMMENTERS]: {
    label: 'Channel commenters',
    hint: 'Members of the channel\'s discussion group — works for any channel with comments enabled.',
  },
  [AudienceSource.CHANNEL_SUBSCRIBERS]: {
    label: 'Channel subscribers',
    hint: 'Full subscriber list. Telegram returns it only if the account is an admin of the channel.',
  },
  [AudienceSource.TARGETS_BASE]: {
    label: 'Profiles from Targets',
    hint: 'Profiles already collected by the scraper and approved in Targets.',
  },
}

export const RECIPIENT_STATUS_META: Record<RecipientStatus, { label: string; color: BadgeColor }> = {
  [RecipientStatus.QUEUED]: { label: 'Queued', color: 'gray' },
  [RecipientStatus.SENT]: { label: 'Sent', color: 'blue' },
  [RecipientStatus.READ]: { label: 'Read', color: 'primary' },
  [RecipientStatus.REPLIED]: { label: 'Replied', color: 'success' },
  [RecipientStatus.PRIVACY]: { label: 'DMs closed', color: 'warning' },
  [RecipientStatus.LIMITED]: { label: 'Rate-limited', color: 'error' },
  [RecipientStatus.SKIPPED]: { label: 'Skipped', color: 'gray' },
}

/** Змінні, які підставляються в текст; spintax {a|b|c} дає різний текст кожному. */
export const MESSAGE_VARIABLES = ['{first_name}', '{username}', '{source_chat}', '{link}']

export const BROADCAST_TEMPLATE = `{Привіт|Вітаю|Добрий день}, {first_name}! 👋

Бачу, ви теж у {source_chat}. Ми зробили інструмент, який сам відповідає клієнтам у Telegram і Viber — {можливо|напевно} буде корисно.

Коротко тут: {link}`

const r = (
  id: string,
  name: string,
  username: string,
  status: RecipientStatus,
  at: string,
  account = '@vkhomyn',
  source = '@growth_chat',
): BroadcastRecipient => ({ id, name, username, source, account, status, at })

export const BROADCAST_RECIPIENTS: BroadcastRecipient[] = [
  r('r1', 'Oksana M.', '@oksana_mkt', RecipientStatus.REPLIED, 'Nov 21 10:14'),
  r('r2', 'Andrii K.', '@andrii_k', RecipientStatus.READ, 'Nov 21 10:19', '@growth_acc_2'),
  r('r3', 'Iryna', '@iryna_smm', RecipientStatus.SENT, 'Nov 21 10:26', '@growth_acc_3'),
  r('r4', 'Taras B.', '@tarasb', RecipientStatus.PRIVACY, 'Nov 21 10:31'),
  r('r5', 'Marta', '@marta_design', RecipientStatus.REPLIED, 'Nov 21 10:37', '@growth_acc_2'),
  r('r6', 'Dmytro', '@dmytro_ads', RecipientStatus.LIMITED, 'Nov 21 10:44', '@growth_acc_3'),
  r('r7', 'Sofiia L.', '@sofi_l', RecipientStatus.READ, 'Nov 21 10:52'),
  r('r8', 'Max', '@max_growth', RecipientStatus.SKIPPED, '—', '—'),
  r('r9', 'Yulia P.', '@yulia_p', RecipientStatus.QUEUED, 'in ~4 min', '@growth_acc_2'),
  r('r10', 'Bohdan', '@bohdan_target', RecipientStatus.QUEUED, 'in ~9 min'),
]

/** Агреговані лічильники черги кампанії «Welcome DM · webinar members». */
export const BROADCAST_PROGRESS = {
  total: 1_950,
  skipped: 214,
  sent: 1_204,
  read: 812,
  replied: 96,
  privacy: 131,
  limited: 22,
}

// ── Commenting ──

export const COMMENT_STATUS_META: Record<CommentStatus, { label: string; color: BadgeColor }> = {
  [CommentStatus.POSTED]: { label: 'Posted', color: 'blue' },
  [CommentStatus.REPLIED]: { label: 'Got replies', color: 'success' },
  [CommentStatus.DELETED]: { label: 'Deleted by admin', color: 'error' },
  [CommentStatus.FAILED]: { label: 'Failed', color: 'warning' },
}

export const COMMENT_PROMPT = `Ти — досвідчений маркетолог, читач цього каналу.
Прочитай пост і напиши короткий (1–2 речення) живий коментар по суті: власна думка, доповнення або питання.
Не рекламуй напряму і не став посилань — людей має зацікавити твій профіль.
Пиши мовою поста, без емодзі на початку, без шаблонних «Дякую за пост».`

export const COMMENT_PROGRESS = { posts: 1_312, comments: 2_431, replies: 187, deleted: 64, profileVisits: 1_120 }

export const COMMENT_LOG: CommentLogEntry[] = [
  { id: 'cm1', target: '@crypto_news_ua', post: 'ETF на ефір схвалили — що далі для альтів?', comment: 'Цікаво, чи повториться сценарій з BTC: спершу «sell the news», а потім місяць росту. Хтось уже дивився на відтоки з бірж?', account: '@vkhomyn', status: CommentStatus.REPLIED, reactions: 14, at: '10:42' },
  { id: 'cm2', target: '@trading_room', post: 'Мій ризик-менеджмент на 2026', comment: 'Правило 1% на угоду рятувало мене не раз. А стоп ставите по ATR чи по рівнях?', account: '@growth_acc_2', status: CommentStatus.POSTED, reactions: 6, at: '10:31' },
  { id: 'cm3', target: '@defi_simple', post: 'Що таке restaking простими словами', comment: 'Дуже доступно пояснили. Додав би ще про ризик slashing — новачки часто про нього забувають.', account: '@vkhomyn', status: CommentStatus.POSTED, reactions: 3, at: '10:12' },
  { id: 'cm4', target: '@smm_hub_chat', post: 'Підбірка інструментів для SMM', comment: 'З цього списку реально щодня користуюсь лише двома 🙂 Решта — для великих команд.', account: '@growth_acc_3', status: CommentStatus.DELETED, reactions: 0, at: '09:55' },
  { id: 'cm5', target: '@growth.lab (TikTok)', post: '5 hooks for Reels that sell', comment: 'Hook #3 doubled my retention, tried it last week. Does it work for B2B too?', account: 'sociallabs.tt', status: CommentStatus.REPLIED, reactions: 41, at: '09:40' },
  { id: 'cm6', target: '@crypto_news_ua', post: 'Огляд ринку за тиждень', comment: '—', account: '@growth_acc_2', status: CommentStatus.FAILED, reactions: 0, at: '09:02' },
]

// ── Posting ──

export const POST_STATUS_META: Record<PostStatus, { label: string; color: BadgeColor }> = {
  [PostStatus.LIVE]: { label: 'Live', color: 'success' },
  [PostStatus.REPLACED]: { label: 'Replaced', color: 'gray' },
  [PostStatus.DELETED]: { label: 'Deleted by admin', color: 'error' },
  [PostStatus.FAILED]: { label: 'Failed', color: 'warning' },
  [PostStatus.SCHEDULED]: { label: 'Scheduled', color: 'blue' },
}

export const POST_VARIANTS = [
  { id: 'v1', name: 'Variant A · problem → solution', text: 'Клієнти пишуть у Telegram о 23:00, а менеджер спить? 😴\nSocialLabs відповідає за вас 24/7 — AI-агент знає ваш прайс і передає гарячих лідів у CRM.\n\n👉 {link}' },
  { id: 'v2', name: 'Variant B · case', text: 'Кавʼярня з Львова: +38% замовлень через Telegram за місяць, без нового менеджера.\nЯк — розповідаємо тут: {link}' },
]

export const POST_PROGRESS = { chats: 42, posts: 318, views: 61_400, clicks: 860, deleted: 11 }

export const POST_LOG: PostLogEntry[] = [
  { id: 'p1', chat: '@marketing_ua_chat', variant: 'A', account: '@vkhomyn', status: PostStatus.LIVE, views: 2_340, clicks: 41, at: 'Thu 10:00' },
  { id: 'p2', chat: '@smm_freelance', variant: 'B', account: '@growth_acc_2', status: PostStatus.LIVE, views: 1_180, clicks: 22, at: 'Thu 10:04' },
  { id: 'p3', chat: '@biz_lviv', variant: 'A', account: '@vkhomyn', status: PostStatus.DELETED, views: 120, clicks: 0, at: 'Thu 10:09', note: 'Removed by admin after 12 min' },
  { id: 'p4', chat: '@startups_ua', variant: 'B', account: '@growth_acc_2', status: PostStatus.FAILED, views: 0, clicks: 0, at: 'Thu 10:13', note: 'CHAT_WRITE_FORBIDDEN — posting closed' },
  { id: 'p5', chat: '@marketing_ua_chat', variant: 'B', account: '@vkhomyn', status: PostStatus.REPLACED, views: 2_010, clicks: 37, at: 'Mon 10:00' },
  { id: 'p6', chat: '@ecom_ukraine', variant: 'A', account: '@growth_acc_2', status: PostStatus.SCHEDULED, views: 0, clicks: 0, at: 'Mon 10:00' },
]

// ── Engagement ──

export const ENGAGEMENT_ACTION_META: Record<EngagementAction, { label: string; icon: SlbIconName; hint: string }> = {
  [EngagementAction.REACTION]: { label: 'Reactions on posts', icon: 'chat_thumbs_up', hint: 'React to new posts of target channels' },
  [EngagementAction.STORY_VIEW]: { label: 'Story views', icon: 'visibility_on', hint: 'View stories of the audience — they see your account in viewers' },
  [EngagementAction.STORY_REACTION]: { label: 'Story reactions', icon: 'chat_emoji', hint: 'Leave a reaction on a viewed story' },
  [EngagementAction.JOIN]: { label: 'Join chats', icon: 'object_user_plus', hint: 'Join target groups so that the account can comment and post there' },
  [EngagementAction.FOLLOW]: { label: 'Follow profiles', icon: 'object_users', hint: 'TikTok / Instagram: follow the audience, some follow back' },
  [EngagementAction.LIKE]: { label: 'Likes on videos', icon: 'action_star', hint: 'TikTok: like videos found by the hashtag search' },
}

export const ENGAGEMENT_PROGRESS = { actions: 18_420, reach: 9_870, profileVisits: 640, followsBack: 112, newDialogs: 38 }

export const ENGAGEMENT_LOG: EngagementLogEntry[] = [
  { id: 'e1', action: EngagementAction.STORY_VIEW, target: '@oksana_mkt', account: '@vkhomyn', at: '10:44' },
  { id: 'e2', action: EngagementAction.STORY_REACTION, target: '@oksana_mkt', account: '@vkhomyn', at: '10:44' },
  { id: 'e3', action: EngagementAction.REACTION, target: '@crypto_news_ua · post 8812', account: '@growth_acc_2', at: '10:41' },
  { id: 'e4', action: EngagementAction.STORY_VIEW, target: '@andrii_k', account: '@growth_acc_2', at: '10:39' },
  { id: 'e5', action: EngagementAction.JOIN, target: '@biz_lviv', account: '@growth_acc_3', at: '10:30' },
  { id: 'e6', action: EngagementAction.FOLLOW, target: '@target.ua (TikTok)', account: 'sociallabs.tt', at: '10:22' },
]
