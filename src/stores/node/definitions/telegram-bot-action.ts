import {
  CredentialType,
  NodeCategory,
  type NodeDefinition,
  NodeDiscriminator,
  NodeType,
  ParameterType
} from '@/stores/node/types.ts'
import { NodeColors, NodeIcons } from '@/stores/node/constants.ts'

export const TelegramBotActionNodeDefinition: NodeDefinition = {
  // Metadata
  executor: NodeDiscriminator.TELEGRAM_BOT_ACTION,
  type: NodeType.ACTION,
  category: NodeCategory.COMMUNICATION,

  // Display
  name: 'Telegram Bot',
  description: 'Send messages and media via Telegram Bot API',
  icon: NodeIcons.TELEGRAM_BOT,
  color: NodeColors.TELEGRAM,

  // Configuration
  supportedCredentialTypes: [CredentialType.API_KEY],
  requiresCredentials: true,
  supportsMultipleItems: true,

  // Parameters
  parameters: [
    // ========== Resource & Operation ==========
    {
      name: 'resource',
      displayName: 'Resource',
      description: 'Type of content to send',
      type: ParameterType.OPTIONS,
      required: true,
      default: TelegramResource.MESSAGE,
      options: [
        { value: TelegramResource.MESSAGE, name: 'Message' },
        { value: TelegramResource.PHOTO, name: 'Photo' },
        { value: TelegramResource.VIDEO, name: 'Video' },
        { value: TelegramResource.DOCUMENT, name: 'Document' },
        { value: TelegramResource.AUDIO, name: 'Audio' },
        { value: TelegramResource.VOICE, name: 'Voice' },
        { value: TelegramResource.LOCATION, name: 'Location' },
        { value: TelegramResource.CONTACT, name: 'Contact' },
        { value: TelegramResource.VENUE, name: 'Venue' },
        { value: TelegramResource.POLL, name: 'Poll' }
      ]
    },
    {
      name: 'operation',
      displayName: 'Operation',
      description: 'Action to perform',
      type: ParameterType.OPTIONS,
      required: true,
      default: TelegramOperation.SEND,
      options: [
        { value: TelegramOperation.SEND, name: 'Send' },
        { value: TelegramOperation.EDIT, name: 'Edit' },
        { value: TelegramOperation.DELETE, name: 'Delete' },
        { value: TelegramOperation.FORWARD, name: 'Forward' },
        { value: TelegramOperation.PIN, name: 'Pin' },
        { value: TelegramOperation.UNPIN, name: 'Unpin' }
      ]
    },

    // ========== Basic Parameters ==========
    {
      name: 'chatId',
      displayName: 'Chat ID',
      description: 'Chat ID, username (@username), or variable ({{chatId}})',
      type: ParameterType.STRING,
      required: true,
      placeholder: '@username or 123456789'
    },

    // ========== Message Parameters ==========
    {
      name: 'text',
      displayName: 'Message',
      description: 'Text of the message',
      type: ParameterType.MULTILINE,
      required: true,
      placeholder: 'Enter your message...',
      displayCondition: {
        field: 'resource',
        values: [TelegramResource.MESSAGE]
      }
    },
    {
      name: 'parseMode',
      displayName: 'Parse Mode',
      description: 'Text formatting mode',
      type: ParameterType.OPTIONS,
      required: false,
      default: 'none',
      options: [
        { value: 'none', name: 'None' },
        { value: 'MARKDOWN', name: 'Markdown' },
        { value: 'MARKDOWN_V2', name: 'MarkdownV2' },
        { value: 'HTML', name: 'HTML' }
      ],
      displayCondition: {
        field: 'resource',
        values: [TelegramResource.MESSAGE]
      }
    },
    {
      name: 'disableWebPagePreview',
      displayName: 'Disable Link Preview',
      description: 'Disable preview for links',
      type: ParameterType.BOOLEAN,
      required: false,
      default: false,
      displayCondition: {
        field: 'resource',
        values: [TelegramResource.MESSAGE]
      }
    },

    // ========== Photo Parameters ==========
    {
      name: 'attachmentType',
      displayName: 'Photo Source',
      description: 'How to provide the photo',
      type: ParameterType.OPTIONS,
      required: true,
      default: 'url',
      options: [
        { value: 'url', name: 'URL' },
        { value: 'FILE_ID', name: 'File ID' },
        { value: 'BINARY', name: 'Binary Data' }
      ],
      displayCondition: {
        field: 'resource',
        values: [TelegramResource.PHOTO, TelegramResource.VIDEO, TelegramResource.DOCUMENT, TelegramResource.AUDIO, TelegramResource.VOICE]
      }
    },
    {
      name: 'photoUrl',
      displayName: 'Photo URL',
      description: 'URL of the photo',
      type: ParameterType.STRING,
      required: false,
      placeholder: 'https://example.com/photo.jpg',
      displayCondition: {
        field: 'attachmentType',
        values: ['url']
      }
    },
    {
      name: 'photoFileId',
      displayName: 'Photo File ID',
      description: 'Telegram file ID',
      type: ParameterType.STRING,
      required: true,
      placeholder: 'AgACAgIAAxkBAAI...',
      displayCondition: {
        field: 'attachmentType',
        values: ['FILE_ID']
      }
    },
    {
      name: 'caption',
      displayName: 'Caption',
      description: 'Photo caption',
      type: ParameterType.MULTILINE,
      required: false,
      placeholder: 'Add a caption...',
      displayCondition: {
        field: 'resource',
        values: [TelegramResource.PHOTO, TelegramResource.VIDEO, TelegramResource.DOCUMENT, TelegramResource.AUDIO]
      }
    },

    // ========== Location Parameters ==========
    {
      name: 'latitude',
      displayName: 'Latitude',
      description: 'Latitude (-90 to 90)',
      type: ParameterType.NUMBER,
      required: true,
      min: -90,
      max: 90,
      displayCondition: {
        field: 'resource',
        values: [TelegramResource.LOCATION, TelegramResource.VENUE]
      }
    },
    {
      name: 'longitude',
      displayName: 'Longitude',
      description: 'Longitude (-180 to 180)',
      type: ParameterType.NUMBER,
      required: true,
      min: -180,
      max: 180,
      displayCondition: {
        field: 'resource',
        values: [TelegramResource.LOCATION, TelegramResource.VENUE]
      }
    },

    // ========== Contact Parameters ==========
    {
      name: 'phoneNumber',
      displayName: 'Phone Number',
      description: 'Contact phone number',
      type: ParameterType.STRING,
      required: true,
      placeholder: '+1234567890',
      displayCondition: {
        field: 'resource',
        values: [TelegramResource.CONTACT]
      }
    },
    {
      name: 'firstName',
      displayName: 'First Name',
      description: 'Contact first name',
      type: ParameterType.STRING,
      required: true,
      placeholder: 'John',
      displayCondition: {
        field: 'resource',
        values: [TelegramResource.CONTACT]
      }
    },
    {
      name: 'lastName',
      displayName: 'Last Name',
      description: 'Contact last name',
      type: ParameterType.STRING,
      required: false,
      placeholder: 'Doe',
      displayCondition: {
        field: 'resource',
        values: [TelegramResource.CONTACT]
      }
    },

    // ========== Poll Parameters ==========
    {
      name: 'question',
      displayName: 'Question',
      description: 'Poll question',
      type: ParameterType.STRING,
      required: true,
      placeholder: 'What is your favorite color?',
      displayCondition: {
        field: 'resource',
        values: [TelegramResource.POLL]
      }
    },
    {
      name: 'pollOptions',
      displayName: 'Options',
      description: 'Poll options (one per line)',
      type: ParameterType.MULTILINE,
      required: true,
      placeholder: 'Red\nBlue\nGreen',
      displayCondition: {
        field: 'resource',
        values: [TelegramResource.POLL]
      }
    },
    {
      name: 'isAnonymous',
      displayName: 'Anonymous',
      description: 'Make poll anonymous',
      type: ParameterType.BOOLEAN,
      required: false,
      default: true,
      displayCondition: {
        field: 'resource',
        values: [TelegramResource.POLL]
      }
    },

    // ========== General Options ==========
    {
      name: 'disableNotification',
      displayName: 'Silent',
      description: 'Send silently without notification',
      type: ParameterType.BOOLEAN,
      required: false,
      default: false
    },
    {
      name: 'protectContent',
      displayName: 'Protect Content',
      description: 'Protect from forwarding and saving',
      type: ParameterType.BOOLEAN,
      required: false,
      default: false
    },
    {
      name: 'replyToMessageId',
      displayName: 'Reply To Message ID',
      description: 'ID of message to reply to',
      type: ParameterType.STRING,
      required: false,
      placeholder: '123'
    },

    // ========== Advanced Options ==========
    {
      name: 'continueOnFail',
      displayName: 'Continue on Fail',
      description: 'Continue workflow if this node fails',
      type: ParameterType.BOOLEAN,
      required: false,
      default: false
    },
    {
      name: 'retryAttempts',
      displayName: 'Retry Attempts',
      description: 'Number of retry attempts on failure',
      type: ParameterType.NUMBER,
      required: false,
      default: 0,
      min: 0,
      max: 5
    }
  ],

  // Outputs
  outputs: {
    main: {
      name: 'main',
      displayName: 'Main Output',
      type: 'object',
      description: 'Response from Telegram API'
    }
  }
};

export enum TelegramResource {
  MESSAGE = 'message',
  PHOTO = 'phone',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  STICKER = 'sticker',
  LOCATION = 'location',
  CONTACT = 'contact',
  VENUE = 'venue',
  ANIMATION = 'animation',
  VOICE = 'voice',
  POLL = 'poll',
}

export enum TelegramOperation {
  SEND = 'send',
  EDIT = 'edit',
  DELETE = 'delete',
  PIN = 'pin',
  UNPIN = 'unpin',
  GET = 'get',
  FORWARD = 'forward',
}
