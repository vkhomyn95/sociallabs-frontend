import {
  CredentialType,
  NodeCategory,
  type NodeDefinition,
  NodeDiscriminator,
  NodeType,
  ParameterType
} from '@/stores/node/types.ts'
import { NodeColors, NodeIcons } from '@/stores/node/constants.ts'

export const TelegramClientActionNodeDefinition: NodeDefinition = {
  // Metadata
  executor: NodeDiscriminator.TELEGRAM_CLIENT_ACTION,
  type: NodeType.ACTION,
  category: NodeCategory.COMMUNICATION,

  // Display
  name: 'Telegram Client',
  description: 'Send messages and media via Telegram Client API (MTProto)',
  icon: NodeIcons.TELEGRAM_CLIENT,
  color: NodeColors.TELEGRAM,

  // Configuration
  supportedCredentialTypes: [CredentialType.TELEGRAM_CLIENT],
  requiresCredentials: true,
  supportsMultipleItems: true,

  // Parameters
  parameters: [
    // ========== Resource & Operation ==========
    {
      name: 'resource',
      displayName: 'Resource',
      description: 'Type of content to work with',
      type: ParameterType.OPTIONS,
      required: true,
      default: TelegramClientResource.MESSAGE,
      options: [
        { value: TelegramClientResource.MESSAGE, name: 'Message' },
        { value: TelegramClientResource.PHOTO, name: 'Photo' },
        { value: TelegramClientResource.VIDEO, name: 'Video' },
        { value: TelegramClientResource.DOCUMENT, name: 'Document' },
        { value: TelegramClientResource.AUDIO, name: 'Audio' },
        { value: TelegramClientResource.VOICE, name: 'Voice' },
        { value: TelegramClientResource.VIDEO_NOTE, name: 'Video Note' },
        { value: TelegramClientResource.LOCATION, name: 'Location' },
        { value: TelegramClientResource.CONTACT, name: 'Contact' },
        { value: TelegramClientResource.VENUE, name: 'Venue' },
        { value: TelegramClientResource.POLL, name: 'Poll' },
        { value: TelegramClientResource.STICKER, name: 'Sticker' },
        { value: TelegramClientResource.ANIMATION, name: 'Animation' },
        { value: TelegramClientResource.DICE, name: 'Dice' },
        { value: TelegramClientResource.CHAT, name: 'Chat' },
        { value: TelegramClientResource.CHAT_MEMBER, name: 'Chat Member' }
      ]
    },
    {
      name: 'operation',
      displayName: 'Operation',
      description: 'Action to perform',
      type: ParameterType.OPTIONS,
      required: true,
      default: TelegramClientOperation.SEND,
      options: [
        { value: TelegramClientOperation.SEND, name: 'Send' },
        { value: TelegramClientOperation.EDIT, name: 'Edit' },
        { value: TelegramClientOperation.DELETE, name: 'Delete' },
        { value: TelegramClientOperation.FORWARD, name: 'Forward' },
        { value: TelegramClientOperation.PIN, name: 'Pin' },
        { value: TelegramClientOperation.UNPIN, name: 'Unpin' },
        { value: TelegramClientOperation.READ, name: 'Read' },
        { value: TelegramClientOperation.GET, name: 'Get' },
        { value: TelegramClientOperation.GET_HISTORY, name: 'Get History' },
        { value: TelegramClientOperation.SEND_TYPING, name: 'Send Typing' }
      ]
    },

    // ========== Basic Parameters ==========
    {
      name: 'chatId',
      displayName: 'Chat ID',
      description: 'Chat ID or variable ({{chatId}}). Use numeric ID.',
      type: ParameterType.STRING,
      required: true,
      placeholder: '123456789 or {{chatId}}'
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
        values: [TelegramClientResource.MESSAGE]
      }
    },
    {
      name: 'parseMode',
      displayName: 'Parse Mode',
      description: 'Text formatting mode',
      type: ParameterType.OPTIONS,
      required: false,
      default: 'TEXT',
      options: [
        { value: 'TEXT', name: 'Plain Text' },
        { value: 'MARKDOWN', name: 'Markdown' },
        { value: 'HTML', name: 'HTML' }
      ],
      displayCondition: {
        field: 'resource',
        values: [TelegramClientResource.MESSAGE]
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
        values: [TelegramClientResource.MESSAGE]
      }
    },
    {
      name: 'clearDraft',
      displayName: 'Clear Draft',
      description: 'Clear draft after sending',
      type: ParameterType.BOOLEAN,
      required: false,
      default: true,
      displayCondition: {
        field: 'resource',
        values: [TelegramClientResource.MESSAGE]
      }
    },

    // ========== Media Parameters ==========
    {
      name: 'attachmentType',
      displayName: 'Media Source',
      description: 'How to provide the media',
      type: ParameterType.OPTIONS,
      required: true,
      default: 'REMOTE',
      options: [
        { value: 'LOCAL', name: 'Local File' },
        { value: 'REMOTE', name: 'Remote URL' },
        { value: 'FILE_ID', name: 'File ID' }
      ],
      displayCondition: {
        field: 'resource',
        values: [
          TelegramClientResource.PHOTO,
          TelegramClientResource.VIDEO,
          TelegramClientResource.DOCUMENT,
          TelegramClientResource.AUDIO,
          TelegramClientResource.VOICE,
          TelegramClientResource.VIDEO_NOTE,
          TelegramClientResource.STICKER,
          TelegramClientResource.ANIMATION
        ]
      }
    },
    {
      name: 'localFilePath',
      displayName: 'Local File Path',
      description: 'Path to local file on server',
      type: ParameterType.STRING,
      required: true,
      placeholder: '/path/to/file.jpg',
      displayCondition: {
        field: 'attachmentType',
        values: ['LOCAL']
      }
    },
    {
      name: 'remoteFileUrl',
      displayName: 'Remote URL',
      description: 'URL of the remote file',
      type: ParameterType.STRING,
      required: true,
      placeholder: 'https://example.com/file.jpg',
      displayCondition: {
        field: 'attachmentType',
        values: ['REMOTE']
      }
    },
    {
      name: 'fileId',
      displayName: 'File ID',
      description: 'Telegram file ID',
      type: ParameterType.NUMBER,
      required: true,
      placeholder: '123456789',
      displayCondition: {
        field: 'attachmentType',
        values: ['FILE_ID']
      }
    },
    {
      name: 'caption',
      displayName: 'Caption',
      description: 'Media caption',
      type: ParameterType.MULTILINE,
      required: false,
      placeholder: 'Add a caption...',
      displayCondition: {
        field: 'resource',
        values: [
          TelegramClientResource.PHOTO,
          TelegramClientResource.VIDEO,
          TelegramClientResource.DOCUMENT,
          TelegramClientResource.AUDIO,
          TelegramClientResource.ANIMATION
        ]
      }
    },
    {
      name: 'hasSpoiler',
      displayName: 'Has Spoiler',
      description: 'Mark media as spoiler',
      type: ParameterType.BOOLEAN,
      required: false,
      default: false,
      displayCondition: {
        field: 'resource',
        values: [
          TelegramClientResource.PHOTO,
          TelegramClientResource.VIDEO
        ]
      }
    },
    {
      name: 'ttl',
      displayName: 'TTL (seconds)',
      description: 'Self-destruct timer in seconds',
      type: ParameterType.NUMBER,
      required: false,
      min: 1,
      max: 60,
      displayCondition: {
        field: 'resource',
        values: [
          TelegramClientResource.PHOTO,
          TelegramClientResource.VIDEO,
          TelegramClientResource.VIDEO_NOTE
        ]
      }
    },

    // ========== Photo Specific ==========
    {
      name: 'photoCompressionQuality',
      displayName: 'Compression Quality',
      description: 'Photo compression quality (1-100)',
      type: ParameterType.NUMBER,
      required: false,
      default: 85,
      min: 1,
      max: 100,
      displayCondition: {
        field: 'resource',
        values: [TelegramClientResource.PHOTO]
      }
    },

    // ========== Video Specific ==========
    {
      name: 'duration',
      displayName: 'Duration',
      description: 'Video duration in seconds',
      type: ParameterType.NUMBER,
      required: false,
      min: 0,
      displayCondition: {
        field: 'resource',
        values: [TelegramClientResource.VIDEO, TelegramClientResource.AUDIO]
      }
    },
    {
      name: 'width',
      displayName: 'Width',
      description: 'Video width in pixels',
      type: ParameterType.NUMBER,
      required: false,
      min: 1,
      displayCondition: {
        field: 'resource',
        values: [TelegramClientResource.VIDEO]
      }
    },
    {
      name: 'height',
      displayName: 'Height',
      description: 'Video height in pixels',
      type: ParameterType.NUMBER,
      required: false,
      min: 1,
      displayCondition: {
        field: 'resource',
        values: [TelegramClientResource.VIDEO]
      }
    },
    {
      name: 'supportsStreaming',
      displayName: 'Supports Streaming',
      description: 'Enable video streaming',
      type: ParameterType.BOOLEAN,
      required: false,
      default: false,
      displayCondition: {
        field: 'resource',
        values: [TelegramClientResource.VIDEO]
      }
    },

    // ========== Audio Specific ==========
    {
      name: 'performer',
      displayName: 'Performer',
      description: 'Audio performer/artist',
      type: ParameterType.STRING,
      required: false,
      placeholder: 'Artist Name',
      displayCondition: {
        field: 'resource',
        values: [TelegramClientResource.AUDIO]
      }
    },
    {
      name: 'title',
      displayName: 'Title',
      description: 'Audio track title',
      type: ParameterType.STRING,
      required: false,
      placeholder: 'Track Title',
      displayCondition: {
        field: 'resource',
        values: [TelegramClientResource.AUDIO]
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
        values: [TelegramClientResource.LOCATION, TelegramClientResource.VENUE]
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
        values: [TelegramClientResource.LOCATION, TelegramClientResource.VENUE]
      }
    },
    {
      name: 'livePeriod',
      displayName: 'Live Period',
      description: 'Live location period in seconds (60-86400)',
      type: ParameterType.NUMBER,
      required: false,
      min: 60,
      max: 86400,
      displayCondition: {
        field: 'resource',
        values: [TelegramClientResource.LOCATION]
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
        values: [TelegramClientResource.CONTACT]
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
        values: [TelegramClientResource.CONTACT]
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
        values: [TelegramClientResource.CONTACT]
      }
    },

    // ========== Venue Parameters ==========
    {
      name: 'venueName',
      displayName: 'Venue Name',
      description: 'Name of the venue',
      type: ParameterType.STRING,
      required: true,
      placeholder: 'Restaurant Name',
      displayCondition: {
        field: 'resource',
        values: [TelegramClientResource.VENUE]
      }
    },
    {
      name: 'address',
      displayName: 'Address',
      description: 'Venue address',
      type: ParameterType.STRING,
      required: true,
      placeholder: '123 Main St',
      displayCondition: {
        field: 'resource',
        values: [TelegramClientResource.VENUE]
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
        values: [TelegramClientResource.POLL]
      }
    },
    {
      name: 'pollOptions',
      displayName: 'Options',
      description: 'Poll options (JSON array)',
      type: ParameterType.JSON,
      required: true,
      placeholder: '["Red", "Blue", "Green"]',
      displayCondition: {
        field: 'resource',
        values: [TelegramClientResource.POLL]
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
        values: [TelegramClientResource.POLL]
      }
    },
    {
      name: 'pollType',
      displayName: 'Poll Type',
      description: 'Type of poll',
      type: ParameterType.OPTIONS,
      required: false,
      default: 'REGULAR',
      options: [
        { value: 'REGULAR', name: 'Regular' },
        { value: 'QUIZ', name: 'Quiz' }
      ],
      displayCondition: {
        field: 'resource',
        values: [TelegramClientResource.POLL]
      }
    },

    // ========== Dice Parameters ==========
    {
      name: 'diceEmoji',
      displayName: 'Dice Emoji',
      description: 'Emoji for dice animation',
      type: ParameterType.OPTIONS,
      required: false,
      default: '🎲',
      options: [
        { value: '🎲', name: 'Dice 🎲' },
        { value: '🎯', name: 'Dart 🎯' },
        { value: '🏀', name: 'Basketball 🏀' },
        { value: '⚽', name: 'Football ⚽' },
        { value: '🎰', name: 'Slot Machine 🎰' },
        { value: '🎳', name: 'Bowling 🎳' }
      ],
      displayCondition: {
        field: 'resource',
        values: [TelegramClientResource.DICE]
      }
    },

    // ========== Edit Parameters ==========
    {
      name: 'messageId',
      displayName: 'Message ID',
      description: 'ID of message to edit/delete/pin',
      type: ParameterType.STRING,
      required: true,
      placeholder: '123456',
      displayCondition: {
        field: 'operation',
        values: [
          TelegramClientOperation.EDIT,
          TelegramClientOperation.DELETE,
          TelegramClientOperation.PIN,
          TelegramClientOperation.GET
        ]
      }
    },

    // ========== Forward Parameters ==========
    {
      name: 'fromChatId',
      displayName: 'From Chat ID',
      description: 'Source chat ID for forwarding',
      type: ParameterType.STRING,
      required: true,
      placeholder: '123456789',
      displayCondition: {
        field: 'operation',
        values: [TelegramClientOperation.FORWARD]
      }
    },
    {
      name: 'messageIds',
      displayName: 'Message IDs',
      description: 'IDs of messages to forward (JSON array)',
      type: ParameterType.JSON,
      required: true,
      placeholder: '[123, 456, 789]',
      displayCondition: {
        field: 'operation',
        values: [TelegramClientOperation.FORWARD]
      }
    },
    {
      name: 'sendCopy',
      displayName: 'Send as Copy',
      description: 'Send without author info',
      type: ParameterType.BOOLEAN,
      required: false,
      default: false,
      displayCondition: {
        field: 'operation',
        values: [TelegramClientOperation.FORWARD]
      }
    },

    // ========== Typing Action ==========
    {
      name: 'chatAction',
      displayName: 'Chat Action',
      description: 'Type of action to send',
      type: ParameterType.OPTIONS,
      required: false,
      default: 'TYPING',
      options: [
        { value: 'TYPING', name: 'Typing' },
        { value: 'UPLOAD_PHOTO', name: 'Uploading Photo' },
        { value: 'RECORD_VIDEO', name: 'Recording Video' },
        { value: 'UPLOAD_VIDEO', name: 'Uploading Video' },
        { value: 'RECORD_VOICE', name: 'Recording Voice' },
        { value: 'UPLOAD_VOICE', name: 'Uploading Voice' },
        { value: 'UPLOAD_DOCUMENT', name: 'Uploading Document' },
        { value: 'CHOOSE_STICKER', name: 'Choosing Sticker' },
        { value: 'FIND_LOCATION', name: 'Finding Location' }
      ],
      displayCondition: {
        field: 'operation',
        values: [TelegramClientOperation.SEND_TYPING]
      }
    },

    // ========== Reply Markup ==========
    {
      name: 'replyMarkupType',
      displayName: 'Keyboard Type',
      description: 'Type of keyboard to attach',
      type: ParameterType.OPTIONS,
      required: false,
      default: 'INLINE',
      options: [
        { value: 'INLINE', name: 'Inline Keyboard' },
        { value: 'KEYBOARD', name: 'Reply Keyboard' },
        { value: 'REMOVE', name: 'Remove Keyboard' },
        { value: 'FORCE_REPLY', name: 'Force Reply' }
      ]
    },
    {
      name: 'buttons',
      displayName: 'Buttons',
      description: 'Keyboard buttons (JSON)',
      type: ParameterType.JSON,
      required: false,
      placeholder: '[[{"text": "Button 1", "callback_data": "data1"}]]'
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
      type: ParameterType.NUMBER,
      required: false,
      placeholder: '123456'
    },
    {
      name: 'messageThreadId',
      displayName: 'Message Thread ID',
      description: 'Thread/topic ID in supergroup',
      type: ParameterType.NUMBER,
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
    },
    {
      name: 'requestTimeout',
      displayName: 'Request Timeout',
      description: 'Timeout in seconds',
      type: ParameterType.NUMBER,
      required: false,
      default: 30,
      min: 5,
      max: 300
    }
  ],

  // Outputs
  outputs: {
    main: {
      name: 'main',
      displayName: 'Main Output',
      type: 'object',
      description: 'Response from Telegram Client API'
    }
  }
};

export enum TelegramClientResource {
  MESSAGE = 'MESSAGE',
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  AUDIO = 'AUDIO',
  VOICE = 'VOICE',
  VIDEO_NOTE = 'VIDEO_NOTE',
  LOCATION = 'LOCATION',
  CONTACT = 'CONTACT',
  VENUE = 'VENUE',
  POLL = 'POLL',
  STICKER = 'STICKER',
  ANIMATION = 'ANIMATION',
  DICE = 'DICE',
  CHAT = 'CHAT',
  CHAT_MEMBER = 'CHAT_MEMBER'
}

export enum TelegramClientOperation {
  SEND = 'SEND',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  FORWARD = 'FORWARD',
  PIN = 'PIN',
  UNPIN = 'UNPIN',
  READ = 'READ',
  GET = 'GET',
  GET_HISTORY = 'GET_HISTORY',
  SEND_TYPING = 'SEND_TYPING',
  SEARCH = 'SEARCH',
  GET_ME = 'GET_ME',
  GET_CHATS = 'GET_CHATS',
  SEARCH_MESSAGES = 'SEARCH_MESSAGES',
  ADD_MEMBER = 'ADD_MEMBER',
  REMOVE_MEMBER = 'REMOVE_MEMBER',
  PROMOTE_MEMBER = 'PROMOTE_MEMBER',
  RESTRICT_MEMBER = 'RESTRICT_MEMBER',
  BAN_MEMBER = 'BAN_MEMBER',
  UNBAN_MEMBER = 'UNBAN_MEMBER',
  GET_MEMBERS = 'GET_MEMBERS',
  UPDATE_CHAT = 'UPDATE_CHAT'
}
