import type { BotFacts } from './telegramBot.types'

/** Metadata keys the backend writes after checking a bot token (TelegramBotFacts). */
export enum BotMetadataKey {
  USERNAME = 'username',
  BOT_ID = 'botId',
  CAN_JOIN_GROUPS = 'canJoinGroups',
  READS_ALL_GROUP_MESSAGES = 'canReadAllGroupMessages',
  SUPPORTS_INLINE_QUERIES = 'supportsInlineQueries',
}

const flag = (metadata: Readonly<Record<string, string>>, key: BotMetadataKey): boolean => metadata[key] === 'true'

/** @returns the bot's facts, null when the token was never checked */
export function botFactsOf(metadata: Readonly<Record<string, string>>): BotFacts | null {
  if (!metadata[BotMetadataKey.BOT_ID]) return null
  return {
    username: metadata[BotMetadataKey.USERNAME] ?? null,
    botId: metadata[BotMetadataKey.BOT_ID] ?? null,
    canJoinGroups: flag(metadata, BotMetadataKey.CAN_JOIN_GROUPS),
    readsAllGroupMessages: flag(metadata, BotMetadataKey.READS_ALL_GROUP_MESSAGES),
    supportsInlineQueries: flag(metadata, BotMetadataKey.SUPPORTS_INLINE_QUERIES),
  }
}
