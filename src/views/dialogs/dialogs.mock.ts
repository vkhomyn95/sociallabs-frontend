import type { SlbIconName } from '@sociallabs/frontend-components'

// ── Domain (mirrors the sociallabs backend: accounts = credentials, AI agent memory, executions) ──

export type ChannelId = 'viber' | 'telegram' | 'whatsapp' | 'instagram' | 'facebook'

export interface Channel {
  id: ChannelId
  label: string
  icon: SlbIconName
  color: string
  /** false → shown as "Незабаром" (Instagram, Facebook). */
  available: boolean
}

/** personal = client account (Viber Desktop via shim, Telegram client, WhatsApp); bot = bot API. */
export type AccountKind = 'personal' | 'bot'

export interface Account {
  id: string
  channel: ChannelId
  kind: AccountKind
  name: string
  handle: string
  status: 'online' | 'offline' | 'syncing'
}

/** Who drives the conversation right now. */
export type Handler = 'ai' | 'workflow' | 'operator' | 'none'

export type MessageAuthor = 'contact' | 'ai' | 'workflow' | 'operator' | 'system' | 'tool'

export interface Message {
  id: string
  author: MessageAuthor
  text: string
  time: string
  status?: 'sent' | 'delivered' | 'read'
  /** Who exactly: agent name, workflow · node, or contact name in a group. */
  meta?: string
  tool?: { name: string; input: string; output: string }
  /** System line link, e.g. "#4821". */
  link?: string
}

export type ExecutionStatus = 'success' | 'running' | 'error' | 'waiting'

export interface Execution {
  id: string
  workflow: string
  status: ExecutionStatus
  startedAt: string
  duration: string
}

/** inbox = active; snoozed = hidden until a time (Viber "snooze" + note); archived = done. */
export type Folder = 'inbox' | 'snoozed' | 'archived'

export const FOLDER_META: Record<Folder, { title: string; empty: string; icon: SlbIconName }> = {
  inbox: { title: 'Діалоги', empty: 'Діалогів за цими фільтрами немає', icon: 'object_comments' },
  snoozed: { title: 'Відкладені', empty: 'Немає відкладених діалогів. Відкладіть діалог — і він повернеться в «Діалоги» у вказаний час.', icon: 'object_clock' },
  archived: { title: 'Архів', empty: 'Архів порожній. Сюди потрапляють завершені діалоги.', icon: 'chat_archive' },
}

export const SNOOZE_OPTIONS = [
  { key: '1h', label: 'На 1 годину', until: 'Сьогодні, 15:30' },
  { key: 'evening', label: 'До вечора', until: 'Сьогодні, 18:00' },
  { key: 'tomorrow', label: 'До завтра', until: 'Завтра, 09:00' },
  { key: 'monday', label: 'До понеділка', until: 'Пн, 09:00' },
  { key: 'week', label: 'На тиждень', until: '27 жов, 09:00' },
]

export interface Dialog {
  id: string
  folder: Folder
  snoozedUntil?: string
  snoozeNote?: string
  archivedAt?: string
  accountId: string
  contact: { name: string; handle: string; phone?: string }
  isGroup?: boolean
  handler: Handler
  agent?: string
  workflow?: string
  unread: number
  lastAt: string
  pinned?: boolean
  muted?: boolean
  /** AI/workflow handed the dialog over to a human. */
  needsAttention?: string
  tags: string[]
  messages: Message[]
  executions: Execution[]
}

export const CHANNELS: Channel[] = [
  { id: 'viber', label: 'Viber', icon: 'brand_viber', color: '#7360f2', available: true },
  { id: 'telegram', label: 'Telegram', icon: 'brand_telegram', color: '#229ed9', available: true },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'brand_whatsapp', color: '#25d366', available: true },
  { id: 'instagram', label: 'Instagram', icon: 'brand_instagram', color: '#e1306c', available: false },
  { id: 'facebook', label: 'Facebook', icon: 'brand_messenger', color: '#1877f2', available: false },
]

export const ACCOUNTS: Account[] = [
  { id: 'viber-me', channel: 'viber', kind: 'personal', name: 'Volodymyr', handle: '+380 67 123 45 67', status: 'online' },
  { id: 'viber-shop', channel: 'viber', kind: 'bot', name: 'SocialLabs Shop', handle: 'sociallabs.shop', status: 'online' },
  { id: 'tg-me', channel: 'telegram', kind: 'personal', name: 'Volodymyr', handle: '@vkhomyn', status: 'online' },
  { id: 'tg-bot', channel: 'telegram', kind: 'bot', name: 'Support bot', handle: '@sociallabs_support_bot', status: 'online' },
  { id: 'wa-me', channel: 'whatsapp', kind: 'personal', name: 'Volodymyr', handle: '+380 50 765 43 21', status: 'syncing' },
]

export const AGENTS = ['Менеджер продажів', 'Підтримка L1', 'Рекрутер']
export const WORKFLOWS = ['Кваліфікація лідів', 'Підтримка FAQ', 'Статус замовлення', 'Нагадування про оплату']

export const HANDLER_META: Record<Handler, { label: string; icon: SlbIconName; color: 'violet' | 'blue' | 'primary' | 'gray' }> = {
  ai: { label: 'AI', icon: 'ai_sparkle', color: 'violet' },
  workflow: { label: 'Workflow', icon: 'dev_nodes', color: 'blue' },
  operator: { label: 'Оператор', icon: 'object_user', color: 'primary' },
  none: { label: 'Без обробки', icon: 'chat_bubble', color: 'gray' },
}

export const EXEC_META: Record<ExecutionStatus, { label: string; color: 'success' | 'sky' | 'error' | 'warning' }> = {
  success: { label: 'Успішно', color: 'success' },
  running: { label: 'Виконується', color: 'sky' },
  error: { label: 'Помилка', color: 'error' },
  waiting: { label: 'Очікує', color: 'warning' },
}

export const accountById = (id: string): Account => ACCOUNTS.find((a) => a.id === id)!
export const channelById = (id: ChannelId): Channel => CHANNELS.find((c) => c.id === id)!

let seq = 0
const m = (author: MessageAuthor, text: string, time: string, extra: Partial<Message> = {}): Message => ({
  id: `m${++seq}`,
  author,
  text,
  time,
  ...extra,
})

export const DIALOGS: Dialog[] = [
  {
    folder: 'inbox',
    id: 'd1',
    accountId: 'viber-me',
    contact: { name: 'Олена Коваленко', handle: '+380 93 555 12 40', phone: '+380 93 555 12 40' },
    handler: 'ai',
    agent: 'Менеджер продажів',
    workflow: 'Кваліфікація лідів',
    unread: 2,
    lastAt: '14:32',
    tags: ['лід', 'тариф Team'],
    messages: [
      m('system', 'Workflow «Кваліфікація лідів» запущено тригером «Viber: нове повідомлення»', '14:02', { link: '#4821' }),
      m('contact', 'Добрий день! Скільки коштує підключення для 3 менеджерів?', '14:02'),
      m('tool', 'search_knowledge_base', '14:02', {
        tool: { name: 'search_knowledge_base', input: '{ "query": "тарифи для команди 3 місця" }', output: 'Тариф Team — 3 місця, 1 200 грн/міс; тріал 14 днів' },
      }),
      m('ai', 'Вітаю, Олено! Для команди з 3 менеджерів підійде тариф Team — 1 200 грн/міс. До нього входять спільні діалоги, AI-агенти та 5 workflow.', '14:03', { meta: 'Менеджер продажів', status: 'read' }),
      m('contact', 'А можна спробувати безкоштовно?', '14:10'),
      m('ai', 'Так, є 14 днів тріалу без картки. Залиште email — і я створю для вас тестовий акаунт 🙌', '14:10', { meta: 'Менеджер продажів', status: 'read' }),
      m('contact', 'olena.k@agency.ua', '14:12'),
      m('workflow', 'Дякуємо! Тестовий акаунт створено. Посилання для входу надіслали на olena.k@agency.ua', '14:12', { meta: 'Кваліфікація лідів · Viber: надіслати повідомлення', status: 'read' }),
      m('contact', 'А як підключити сюди Telegram?', '14:31'),
      m('contact', 'І чи можна кілька номерів Viber?', '14:32'),
    ],
    executions: [
      { id: '#4821', workflow: 'Кваліфікація лідів', status: 'running', startedAt: 'Сьогодні, 14:02', duration: '30 хв' },
      { id: '#4710', workflow: 'Нагадування про оплату', status: 'success', startedAt: 'Вчора, 09:00', duration: '2 с' },
    ],
  },
  {
    folder: 'inbox',
    id: 'd2',
    accountId: 'tg-me',
    contact: { name: 'Андрій Мельник', handle: '@a_melnyk' },
    handler: 'operator',
    agent: 'Підтримка L1',
    unread: 1,
    lastAt: '14:05',
    needsAttention: 'AI передав діалог: клієнт просить повернення коштів',
    tags: ['повернення'],
    messages: [
      m('contact', 'Мені двічі списали оплату за жовтень', '13:58'),
      m('ai', 'Перепрошую за незручності! Перевіряю платежі за вашим акаунтом…', '13:58', { meta: 'Підтримка L1', status: 'read' }),
      m('tool', 'billing_lookup', '13:59', { tool: { name: 'billing_lookup', input: '{ "user": "@a_melnyk", "month": "2026-10" }', output: '2 транзакції по 1 200 грн (01.10, 01.10)' } }),
      m('system', 'AI-агент «Підтримка L1» передав діалог оператору — повернення коштів потребує підтвердження людини', '13:59'),
      m('contact', 'Коли повернете гроші?', '14:05'),
    ],
    executions: [{ id: '#4818', workflow: 'Підтримка FAQ', status: 'waiting', startedAt: 'Сьогодні, 13:58', duration: '—' }],
  },
  {
    folder: 'inbox',
    id: 'd3',
    accountId: 'tg-bot',
    contact: { name: 'Ірина Бондар', handle: '@iryna_b' },
    handler: 'workflow',
    workflow: 'Підтримка FAQ',
    unread: 0,
    lastAt: '13:40',
    tags: [],
    messages: [
      m('system', 'Користувач натиснув /start', '13:38'),
      m('workflow', 'Привіт! Я бот підтримки SocialLabs. Оберіть тему: 1) Оплата 2) Підключення каналів 3) Інше', '13:38', { meta: 'Підтримка FAQ · Telegram Bot: надіслати', status: 'read' }),
      m('contact', '2', '13:39'),
      m('workflow', 'Інструкція з підключення Telegram: Облікові дані → Додати → Telegram Client. Потрібні api_id та api_hash.', '13:40', { meta: 'Підтримка FAQ · Switch → Telegram Bot: надіслати', status: 'delivered' }),
    ],
    executions: [{ id: '#4802', workflow: 'Підтримка FAQ', status: 'success', startedAt: 'Сьогодні, 13:38', duration: '1.4 с' }],
  },
  {
    folder: 'inbox',
    id: 'd4',
    accountId: 'viber-shop',
    contact: { name: 'Максим Ткаченко', handle: 'Viber user' },
    handler: 'workflow',
    workflow: 'Статус замовлення',
    unread: 0,
    lastAt: '12:15',
    tags: ['замовлення #1093'],
    messages: [
      m('contact', 'Де моє замовлення 1093?', '12:14'),
      m('workflow', 'Замовлення №1093 передано в Нову пошту. ТТН 20450000123456, очікувана доставка — завтра.', '12:15', { meta: 'Статус замовлення · HTTP → Viber Bot: надіслати', status: 'read' }),
    ],
    executions: [{ id: '#4790', workflow: 'Статус замовлення', status: 'success', startedAt: 'Сьогодні, 12:14', duration: '0.8 с' }],
  },
  {
    folder: 'inbox',
    id: 'd5',
    accountId: 'tg-me',
    contact: { name: 'Марія Шевчук', handle: '@mariia_sh' },
    handler: 'ai',
    agent: 'Рекрутер',
    unread: 0,
    lastAt: '11:02',
    pinned: true,
    tags: ['кандидат', 'Frontend'],
    messages: [
      m('ai', 'Доброго дня, Маріє! Бачу ваше резюме на позицію Frontend (Vue). Чи зручно поспілкуватися в четвер о 15:00?', '10:40', { meta: 'Рекрутер', status: 'read' }),
      m('contact', 'Так, зручно', '10:58'),
      m('tool', 'calendar_create_event', '10:59', { tool: { name: 'calendar_create_event', input: '{ "title": "Інтерв\'ю: Марія Шевчук", "at": "2026-10-22T15:00" }', output: 'event_id=ev_81ac' } }),
      m('ai', 'Чудово! Надіслала запрошення в календар. До зустрічі в четвер 🙂', '11:02', { meta: 'Рекрутер', status: 'read' }),
    ],
    executions: [],
  },
  {
    folder: 'inbox',
    id: 'd6',
    accountId: 'wa-me',
    contact: { name: 'Олег Савчук', handle: '+380 66 300 11 22', phone: '+380 66 300 11 22' },
    handler: 'ai',
    agent: 'Менеджер продажів',
    workflow: 'Кваліфікація лідів',
    unread: 0,
    lastAt: 'Вчора',
    needsAttention: 'Помилка виконання: LLM timeout',
    tags: [],
    messages: [
      m('contact', 'Цікавить інтеграція з CRM', '18:20'),
      m('system', 'Виконання #4766 завершилось помилкою: LLM provider timeout (30 с)', '18:21', { link: '#4766' }),
    ],
    executions: [{ id: '#4766', workflow: 'Кваліфікація лідів', status: 'error', startedAt: 'Вчора, 18:20', duration: '30 с' }],
  },
  {
    folder: 'inbox',
    id: 'd7',
    accountId: 'viber-me',
    contact: { name: 'Команда продажів', handle: '6 учасників' },
    isGroup: true,
    handler: 'none',
    unread: 5,
    lastAt: 'Вчора',
    muted: true,
    tags: [],
    messages: [
      m('contact', 'Хто бере дзвінок о 16:00?', '17:02', { meta: 'Ігор' }),
      m('operator', 'Я візьму', '17:05', { status: 'read' }),
      m('contact', 'Ок, дякую!', '17:06', { meta: 'Світлана' }),
    ],
    executions: [],
  },
  {
    folder: 'inbox',
    id: 'd8',
    accountId: 'wa-me',
    contact: { name: 'Сервісний центр «Техно»', handle: '+380 44 222 33 44', phone: '+380 44 222 33 44' },
    handler: 'operator',
    unread: 0,
    lastAt: 'Пн',
    tags: [],
    messages: [
      m('operator', 'Добрий день! Чи готовий ноутбук за заявкою 5521?', '10:00', { status: 'read' }),
      m('contact', 'Так, можна забирати після 14:00', '10:30'),
    ],
    executions: [],
  },
  // ── Відкладені ──
  {
    folder: 'snoozed',
    snoozedUntil: 'Сьогодні, 18:00',
    snoozeNote: 'Передзвонити після наради з директором',
    id: 's1',
    accountId: 'viber-me',
    contact: { name: 'Тарас Гнатюк', handle: '+380 97 410 22 85', phone: '+380 97 410 22 85' },
    handler: 'operator',
    unread: 0,
    lastAt: '11:20',
    tags: ['B2B', 'договір'],
    messages: [
      m('contact', 'Договір погодимо після обіду, зараз нарада', '11:18'),
      m('operator', 'Добре, напишу вам ближче до вечора 👍', '11:20', { status: 'read' }),
      m('system', 'Діалог відкладено до 18:00 · «Передзвонити після наради з директором»', '11:20'),
    ],
    executions: [],
  },
  {
    folder: 'snoozed',
    snoozedUntil: 'Завтра, 09:00',
    snoozeNote: 'Чекаємо оплату рахунку №214',
    id: 's2',
    accountId: 'tg-me',
    contact: { name: 'Наталія Литвин', handle: '@n_lytvyn' },
    handler: 'ai',
    agent: 'Менеджер продажів',
    workflow: 'Нагадування про оплату',
    unread: 0,
    lastAt: '10:05',
    tags: ['рахунок №214'],
    messages: [
      m('contact', 'Рахунок отримала, оплатимо завтра зранку', '10:02'),
      m('ai', 'Дякую, Наталіє! Нагадаю завтра о 9:00, якщо оплата ще не надійде.', '10:03', { meta: 'Менеджер продажів', status: 'read' }),
      m('tool', 'snooze_dialog', '10:05', { tool: { name: 'snooze_dialog', input: '{ "until": "tomorrow 09:00", "note": "Чекаємо оплату рахунку №214" }', output: 'ok' } }),
    ],
    executions: [{ id: '#4799', workflow: 'Нагадування про оплату', status: 'waiting', startedAt: 'Сьогодні, 10:05', duration: '—' }],
  },
  {
    folder: 'snoozed',
    snoozedUntil: 'Пн, 09:00',
    id: 's3',
    accountId: 'tg-bot',
    contact: { name: 'Денис Коваль', handle: '@denys_koval' },
    handler: 'workflow',
    workflow: 'Підтримка FAQ',
    unread: 0,
    lastAt: 'Пт',
    tags: ['feature request'],
    messages: [
      m('contact', 'Коли буде інтеграція з Instagram?', '16:40'),
      m('workflow', 'Дякуємо за питання! Передали команді — повернемося з відповіддю на початку тижня.', '16:41', { meta: 'Підтримка FAQ · Telegram Bot: надіслати', status: 'read' }),
    ],
    executions: [{ id: '#4650', workflow: 'Підтримка FAQ', status: 'success', startedAt: 'Пт, 16:40', duration: '1.1 с' }],
  },
  {
    folder: 'snoozed',
    snoozedUntil: '27 жов, 09:00',
    snoozeNote: 'Кандидат у відпустці до 26.10',
    id: 's4',
    accountId: 'wa-me',
    contact: { name: 'Юлія Романенко', handle: '+380 63 120 77 01', phone: '+380 63 120 77 01' },
    handler: 'ai',
    agent: 'Рекрутер',
    unread: 0,
    lastAt: 'Чт',
    tags: ['кандидат', 'QA'],
    messages: [
      m('ai', 'Юліє, вітаю! Чи актуальний для вас пошук роботи QA-інженером?', '12:00', { meta: 'Рекрутер', status: 'read' }),
      m('contact', 'Так, але я у відпустці до 26-го, напишіть після', '12:30'),
    ],
    executions: [],
  },
  // ── Архів ──
  {
    folder: 'archived',
    archivedAt: '18 жов',
    id: 'a1',
    accountId: 'viber-shop',
    contact: { name: 'Вікторія Олійник', handle: 'Viber user' },
    handler: 'workflow',
    workflow: 'Статус замовлення',
    unread: 0,
    lastAt: '18 жов',
    tags: ['замовлення #1071', 'доставлено'],
    messages: [
      m('contact', 'Отримала замовлення, дякую!', '15:10'),
      m('workflow', 'Раді, що все дійшло! Оцініть, будь ласка, покупку від 1 до 5 ⭐', '15:10', { meta: 'Статус замовлення · Viber Bot: надіслати', status: 'read' }),
      m('contact', '5', '15:12'),
      m('system', 'Workflow позначив діалог завершеним і переніс в архів', '15:12'),
    ],
    executions: [{ id: '#4512', workflow: 'Статус замовлення', status: 'success', startedAt: '18 жов, 15:10', duration: '0.6 с' }],
  },
  {
    folder: 'archived',
    archivedAt: '16 жов',
    id: 'a2',
    accountId: 'tg-me',
    contact: { name: 'Роман Кравець', handle: '@r_kravets' },
    handler: 'none',
    agent: 'Підтримка L1',
    unread: 0,
    lastAt: '16 жов',
    tags: ['вирішено'],
    messages: [
      m('contact', 'Не приходять повідомлення з Viber у workflow', '09:12'),
      m('ai', 'Перевірте, будь ласка, чи активний workflow і чи увімкнено тригер «Viber: нове повідомлення».', '09:13', { meta: 'Підтримка L1', status: 'read' }),
      m('contact', 'Точно, був вимкнений. Все працює!', '09:20'),
      m('system', 'Ви архівували діалог', '09:21'),
    ],
    executions: [],
  },
  {
    folder: 'archived',
    archivedAt: '12 жов',
    id: 'a3',
    accountId: 'wa-me',
    contact: { name: 'Кав\'ярня «Зерно»', handle: '+380 32 255 00 11', phone: '+380 32 255 00 11' },
    handler: 'none',
    unread: 0,
    lastAt: '12 жов',
    tags: ['партнер'],
    messages: [
      m('operator', 'Надсилаю макет банера для акції', '13:00', { status: 'read' }),
      m('contact', 'Чудово, погоджено ✅', '13:40'),
    ],
    executions: [],
  },
  {
    folder: 'archived',
    archivedAt: '2 жов',
    id: 'a4',
    accountId: 'viber-me',
    contact: { name: 'Батьківський чат 5-Б', handle: '24 учасники' },
    isGroup: true,
    handler: 'none',
    unread: 0,
    lastAt: '2 жов',
    muted: true,
    tags: [],
    messages: [
      m('contact', 'Нагадую: завтра екскурсія, збір о 8:30', '19:00', { meta: 'Класна керівниця' }),
    ],
    executions: [],
  },
]
