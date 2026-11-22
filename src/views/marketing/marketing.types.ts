import type { SlbIconName } from '@sociallabs/frontend-components'

/**
 * Макет розділу «Marketing» — усе тут поки моки (marketing.mock.ts), бекенду ще немає.
 *
 * Конвеєр, який описують чотири вкладки:
 *   Scraper  — пошукові задачі: акаунт ходить у платформу і збирає канали / чати / пости за налаштуваннями;
 *   Targets  — база знайдених цілей (дедуплікована), яку можна схвалювати / виключати;
 *   Campaigns — що робимо з цілями: коментарі під новими постами, рекламні пости, розсилки, реакції;
 *               виконавець — воркфлоу або AI-агент, дії йдуть від підключених акаунтів у межах лімітів;
 *   Links    — трекінгові посилання (redirect / invite-link на кожне розміщення), з яких рахуються переходи й ліди.
 * Statistics → Marketing збирає цифри з усіх чотирьох.
 */

export enum Platform {
  TELEGRAM = 'telegram',
  TIKTOK = 'tiktok',
  INSTAGRAM = 'instagram',
  X = 'x',
  YOUTUBE = 'youtube',
}

export enum CampaignType {
  /** Коментар (часто AI-згенерований під зміст поста) під кожним новим постом цілі. */
  COMMENTING = 'commenting',
  /** Рекламний пост у канал / групу за розкладом (свої канали, групи з відкритим постингом, обмін). */
  POSTING = 'posting',
  /** Розсилка в особисті повідомлення або групи. */
  BROADCAST = 'broadcast',
  /** Реакції, перегляди сторіс, підписки — «прогрів» уваги до акаунта. */
  ENGAGEMENT = 'engagement',
}

export enum CampaignStatus {
  RUNNING = 'running',
  PAUSED = 'paused',
  DRAFT = 'draft',
  FINISHED = 'finished',
}

export enum ExecutorKind {
  WORKFLOW = 'workflow',
  AGENT = 'agent',
}

export interface Campaign {
  id: string
  name: string
  type: CampaignType
  platform: Platform
  status: CampaignStatus
  executor: { kind: ExecutorKind; name: string }
  /** Скільки акаунтів ротується для дій. */
  accounts: number
  targetList: string
  schedule: string
  /** Людський опис лімітів: «≤ 20 comments / account / day, 3–9 min delay». */
  limits: string
  stats: { targets: number; actions: number; clicks: number; leads: number; blocked: number }
  updatedAt: string
}

export enum ScrapeSource {
  /** Глобальний пошук каналів / чатів за ключовими словами. */
  CHANNEL_SEARCH = 'channel_search',
  /** «Схожі канали» від уже відомих — розширення бази. */
  SIMILAR = 'similar',
  /** Пости за хештегами (TikTok, Instagram, X). */
  HASHTAG = 'hashtag',
  /** Пости / повідомлення за ключовими словами. */
  KEYWORD_POSTS = 'keyword_posts',
  /** Учасники чату — аудиторія для розсилки. */
  CHAT_MEMBERS = 'chat_members',
}

export enum JobStatus {
  RUNNING = 'running',
  SCHEDULED = 'scheduled',
  PAUSED = 'paused',
  FAILED = 'failed',
}

export interface ScrapeJob {
  id: string
  name: string
  platform: Platform
  source: ScrapeSource
  query: string[]
  filters: string[]
  account: string
  schedule: string
  status: JobStatus
  found: number
  newLastRun: number
  lastRun: string
  /** Чому впало / що обмежило — FLOOD_WAIT, капча, бан акаунта. */
  note?: string
}

export enum TargetKind {
  CHANNEL = 'channel',
  GROUP = 'group',
  POST = 'post',
  PROFILE = 'profile',
}

export enum TargetStatus {
  NEW = 'new',
  APPROVED = 'approved',
  IN_CAMPAIGN = 'in_campaign',
  EXCLUDED = 'excluded',
  /** Нас заблокували: бан у чаті, коментарі видаляють, акаунт у чорному списку. */
  BLOCKED = 'blocked',
}

export interface Target {
  id: string
  platform: Platform
  kind: TargetKind
  title: string
  handle: string
  audience: number
  commentsOpen: boolean
  language: string
  topics: string[]
  /** Engagement rate, % — перегляди / реакції відносно аудиторії. */
  er: number
  status: TargetStatus
  sourceJob: string
  foundAt: string
  leads: number
}

export enum LinkKind {
  /** Наш короткий redirect з UTM — рахує кліки. */
  REDIRECT = 'redirect',
  /** Окремий invite-link Telegram на кожне розміщення — рахує вступи. */
  INVITE = 'invite',
}

export interface TrackingLink {
  id: string
  url: string
  kind: LinkKind
  campaign: string
  placement: string
  platform: Platform
  clicks: number
  joins: number
  leads: number
  createdAt: string
}

export interface PlatformMeta {
  label: string
  icon: SlbIconName
  color: string
}

// ── Broadcast: розсилка в особисті учасникам каналів / груп ──

/**
 * Звідки брати отримувачів. Нюанс Telegram: повний список підписників КАНАЛУ віддається лише адміну,
 * тож для чужих каналів беремо тих, хто коментує (учасники прив'язаної discussion-групи).
 */
export enum AudienceSource {
  GROUP_MEMBERS = 'group_members',
  CHANNEL_COMMENTERS = 'channel_commenters',
  CHANNEL_SUBSCRIBERS = 'channel_subscribers',
  TARGETS_BASE = 'targets_base',
}

export enum RecipientStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  READ = 'read',
  REPLIED = 'replied',
  /** Користувач закрив вхідні від незнайомців. */
  PRIVACY = 'privacy',
  /** PEER_FLOOD / FLOOD_WAIT — повторимо з іншого акаунта. */
  LIMITED = 'limited',
  SKIPPED = 'skipped',
}

export interface BroadcastRecipient {
  id: string
  name: string
  username: string
  source: string
  account: string
  status: RecipientStatus
  at: string
}

// ── Commenting / Posting / Engagement: журнали активності ──

export enum CommentStatus {
  POSTED = 'posted',
  /** Під коментарем відповіли — далі розмову веде агент. */
  REPLIED = 'replied',
  /** Перевірка через годину не знайшла коментар — його видалив адмін. */
  DELETED = 'deleted',
  FAILED = 'failed',
}

export interface CommentLogEntry {
  id: string
  target: string
  post: string
  comment: string
  account: string
  status: CommentStatus
  reactions: number
  at: string
}

export enum PostStatus {
  LIVE = 'live',
  /** Попередній пост видалено перед новим (щоб не засмічувати чат). */
  REPLACED = 'replaced',
  DELETED = 'deleted',
  FAILED = 'failed',
  SCHEDULED = 'scheduled',
}

export interface PostLogEntry {
  id: string
  chat: string
  variant: string
  account: string
  status: PostStatus
  views: number
  clicks: number
  at: string
  note?: string
}

export enum EngagementAction {
  REACTION = 'reaction',
  STORY_VIEW = 'story_view',
  STORY_REACTION = 'story_reaction',
  JOIN = 'join',
  FOLLOW = 'follow',
  LIKE = 'like',
}

export interface EngagementLogEntry {
  id: string
  action: EngagementAction
  target: string
  account: string
  at: string
}
