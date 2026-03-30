// src/stores/node/definitions/http-request.ts

import {
  NodeCategory,
  type NodeDefinition,
  NodeDiscriminator,
  NodeType,
  ParameterType
} from '@/stores/node/types'
import { NodeColors, NodeIcons } from '@/stores/node/constants'

// ── Shared option lists ──────────────────────────────────────────

const HTTP_METHODS = [
  { value: 'GET',     name: 'GET' },
  { value: 'POST',    name: 'POST' },
  { value: 'PUT',     name: 'PUT' },
  { value: 'PATCH',   name: 'PATCH' },
  { value: 'DELETE',  name: 'DELETE' },
  { value: 'HEAD',    name: 'HEAD' },
  { value: 'OPTIONS', name: 'OPTIONS' },
]

const AUTH_TYPES = [
  { value: 'NONE',   name: 'None' },
  { value: 'BASIC',  name: 'Basic Auth' },
  { value: 'BEARER', name: 'Bearer Token' },
  { value: 'HEADER', name: 'Header Auth' },
  { value: 'QUERY',  name: 'Query Auth' },
  { value: 'OAUTH2', name: 'OAuth2 (via Credential)' },
]

const INPUT_MODES = [
  { value: 'KEY_VALUE', name: 'Using Fields Below' },
  { value: 'JSON',      name: 'Using JSON' },
]

const BODY_TYPES = [
  { value: 'JSON',             name: 'JSON' },
  { value: 'FORM_URL_ENCODED', name: 'Form URLencoded' },
  { value: 'FORM_DATA',        name: 'Form-Data (multipart)' },
  { value: 'BINARY',           name: 'n8n Binary File' },
  { value: 'RAW',              name: 'Raw' },
]

const RESPONSE_FORMATS = [
  { value: 'AUTODETECT', name: 'Autodetect' },
  { value: 'JSON',       name: 'JSON' },
  { value: 'TEXT',       name: 'Text' },
  { value: 'FILE',       name: 'File' },
]

const PAGINATION_MODES = [
  { value: 'OFF',          name: 'Off' },
  { value: 'UPDATE_PARAM', name: 'Update a Parameter in Each Request' },
  { value: 'RESPONSE_URL', name: 'Response Contains Next URL' },
]

// ── Definition ───────────────────────────────────────────────────

export const HttpRequestNodeDefinition: NodeDefinition = {
  executor: NodeDiscriminator.HTTP_REQUEST,
  type: NodeType.ACTION,
  category: NodeCategory.CORE,

  name: 'HTTP Request',
  description: 'Make HTTP requests to any REST API or web service',

  requiresCredentials: false,
  supportsMultipleItems: true,

  parameters: [

    // ── Method & URL ────────────────────────────────────────────
    {
      name: 'method',
      displayName: 'Method',
      type: ParameterType.OPTIONS,
      required: true,
      default: 'GET',
      options: HTTP_METHODS,
    },
    {
      name: 'url',
      displayName: 'URL',
      description: 'Endpoint to call. Supports expressions: {{$json.url}}',
      type: ParameterType.STRING,
      required: true,
      placeholder: 'https://api.example.com/endpoint',
    },

    // ── Authentication ──────────────────────────────────────────
    {
      name: 'authType',
      displayName: 'Authentication',
      type: ParameterType.OPTIONS,
      default: 'NONE',
      options: AUTH_TYPES,
    },
    {
      name: 'basicUsername',
      displayName: 'Username',
      type: ParameterType.STRING,
      placeholder: 'user@example.com',
      displayCondition: { field: 'authType', values: ['BASIC'] },
    },
    {
      name: 'basicPassword',
      displayName: 'Password',
      type: ParameterType.STRING,
      placeholder: '••••••••',
      displayCondition: { field: 'authType', values: ['BASIC'] },
    },
    {
      name: 'bearerToken',
      displayName: 'Token',
      type: ParameterType.STRING,
      placeholder: 'eyJhbGci...',
      displayCondition: { field: 'authType', values: ['BEARER'] },
    },
    {
      name: 'headerAuthName',
      displayName: 'Header Name',
      type: ParameterType.STRING,
      placeholder: 'X-Api-Key',
      displayCondition: { field: 'authType', values: ['HEADER'] },
    },
    {
      name: 'headerAuthValue',
      displayName: 'Header Value',
      type: ParameterType.STRING,
      placeholder: 'your-api-key',
      displayCondition: { field: 'authType', values: ['HEADER'] },
    },
    {
      name: 'queryAuthName',
      displayName: 'Query Param Name',
      type: ParameterType.STRING,
      placeholder: 'api_key',
      displayCondition: { field: 'authType', values: ['QUERY'] },
    },
    {
      name: 'queryAuthValue',
      displayName: 'Query Param Value',
      type: ParameterType.STRING,
      displayCondition: { field: 'authType', values: ['QUERY'] },
    },

    // ── Query Parameters ─────────────────────────────────────────
    {
      name: 'sendQueryParams',
      displayName: 'Send Query Parameters',
      type: ParameterType.BOOLEAN,
      default: false,
    },
    {
      name: 'queryParamsInputMode',
      displayName: 'Specify Query Parameters',
      type: ParameterType.OPTIONS,
      default: 'KEY_VALUE',
      options: INPUT_MODES,
      displayCondition: { field: 'sendQueryParams', values: [true] },
    },
    {
      name: 'queryParams',
      displayName: 'Parameters',
      description: 'Add Name/Value pairs',
      type: ParameterType.JSON,
      placeholder: '[{"name": "page", "value": "1"}]',
      displayCondition: { field: 'queryParamsInputMode', values: ['KEY_VALUE'] },
    },
    {
      name: 'queryParamsJson',
      displayName: 'JSON',
      type: ParameterType.JSON,
      placeholder: '{"page": 1, "limit": 20}',
      displayCondition: { field: 'queryParamsInputMode', values: ['JSON'] },
    },

    // ── Headers ──────────────────────────────────────────────────
    {
      name: 'sendHeaders',
      displayName: 'Send Headers',
      type: ParameterType.BOOLEAN,
      default: false,
    },
    {
      name: 'headersInputMode',
      displayName: 'Specify Headers',
      type: ParameterType.OPTIONS,
      default: 'KEY_VALUE',
      options: INPUT_MODES,
      displayCondition: { field: 'sendHeaders', values: [true] },
    },
    {
      name: 'headers',
      displayName: 'Headers',
      type: ParameterType.JSON,
      placeholder: '[{"name": "Accept", "value": "application/json"}]',
      displayCondition: { field: 'headersInputMode', values: ['KEY_VALUE'] },
    },
    {
      name: 'headersJson',
      displayName: 'JSON',
      type: ParameterType.JSON,
      placeholder: '{"Accept": "application/json"}',
      displayCondition: { field: 'headersInputMode', values: ['JSON'] },
    },

    // ── Body ─────────────────────────────────────────────────────
    {
      name: 'sendBody',
      displayName: 'Send Body',
      type: ParameterType.BOOLEAN,
      default: false,
    },
    {
      name: 'bodyContentType',
      displayName: 'Body Content Type',
      type: ParameterType.OPTIONS,
      default: 'JSON',
      options: BODY_TYPES,
      displayCondition: { field: 'sendBody', values: [true] },
    },
    {
      name: 'bodyInputMode',
      displayName: 'Specify Body',
      type: ParameterType.OPTIONS,
      default: 'KEY_VALUE',
      options: INPUT_MODES,
      displayCondition: { field: 'bodyContentType', values: ['JSON', 'FORM_URL_ENCODED', 'FORM_DATA'] },
    },
    {
      name: 'bodyParams',
      displayName: 'Body Parameters',
      type: ParameterType.JSON,
      placeholder: '[{"name": "field", "value": "val"}]',
      displayCondition: { field: 'bodyInputMode', values: ['KEY_VALUE'] },
    },
    {
      name: 'bodyJson',
      displayName: 'JSON Body',
      type: ParameterType.JSON,
      placeholder: '{"key": "value"}',
      displayCondition: { field: 'bodyInputMode', values: ['JSON'] },
    },
    {
      name: 'rawBody',
      displayName: 'Body',
      type: ParameterType.MULTILINE,
      placeholder: 'Raw body content',
      displayCondition: { field: 'bodyContentType', values: ['RAW'] },
    },
    {
      name: 'rawContentType',
      displayName: 'Content Type',
      type: ParameterType.STRING,
      placeholder: 'text/xml',
      displayCondition: { field: 'bodyContentType', values: ['RAW'] },
    },
    {
      name: 'binaryFieldName',
      displayName: 'Input Data Field Name',
      type: ParameterType.STRING,
      placeholder: 'data',
      displayCondition: { field: 'bodyContentType', values: ['BINARY', 'FORM_DATA'] },
    },

    // ── Options ──────────────────────────────────────────────────
    {
      name: 'responseFormat',
      displayName: 'Response Format',
      type: ParameterType.OPTIONS,
      default: 'AUTODETECT',
      options: RESPONSE_FORMATS,
    },
    {
      name: 'responseOutputField',
      displayName: 'Put Output in Field',
      type: ParameterType.STRING,
      default: 'data',
      displayCondition: { field: 'responseFormat', values: ['FILE', 'TEXT'] },
    },
    {
      name: 'includeResponseMetadata',
      displayName: 'Include Response Headers & Status',
      type: ParameterType.BOOLEAN,
      default: false,
    },
    {
      name: 'neverError',
      displayName: 'Never Error',
      description: 'Return success even on 4xx/5xx responses',
      type: ParameterType.BOOLEAN,
      default: false,
    },
    {
      name: 'followRedirects',
      displayName: 'Follow Redirects',
      type: ParameterType.BOOLEAN,
      default: true,
    },
    {
      name: 'ignoreSslIssues',
      displayName: 'Ignore SSL Issues',
      description: 'Accept invalid certificates',
      type: ParameterType.BOOLEAN,
      default: false,
    },
    {
      name: 'timeout',
      displayName: 'Timeout (ms)',
      type: ParameterType.NUMBER,
      default: 30000,
      min: 0,
    },
    {
      name: 'proxy',
      displayName: 'Proxy',
      type: ParameterType.STRING,
      placeholder: 'http://proxy.example.com:3128',
    },

    // ── Pagination ───────────────────────────────────────────────
    {
      name: 'paginationMode',
      displayName: 'Pagination',
      type: ParameterType.OPTIONS,
      default: 'OFF',
      options: PAGINATION_MODES,
    },
    {
      name: 'paginationParamName',
      displayName: 'Parameter Name',
      description: 'Query/body parameter to increment (e.g. "page", "offset")',
      type: ParameterType.STRING,
      placeholder: 'page',
      displayCondition: { field: 'paginationMode', values: ['UPDATE_PARAM'] },
    },
    {
      name: 'paginationStartValue',
      displayName: 'Start Value',
      type: ParameterType.NUMBER,
      default: 0,
      displayCondition: { field: 'paginationMode', values: ['UPDATE_PARAM'] },
    },
    {
      name: 'paginationIncrement',
      displayName: 'Increment',
      type: ParameterType.NUMBER,
      default: 1,
      displayCondition: { field: 'paginationMode', values: ['UPDATE_PARAM'] },
    },
    {
      name: 'nextUrlExpression',
      displayName: 'Next URL Expression',
      description: 'SpEL expression over response. E.g. #body.meta.next',
      type: ParameterType.STRING,
      placeholder: '#body.links.next',
      displayCondition: { field: 'paginationMode', values: ['RESPONSE_URL'] },
    },
    {
      name: 'paginationMaxRequests',
      displayName: 'Max Pages',
      type: ParameterType.NUMBER,
      default: 100,
      min: 1,
      displayCondition: {
        field: 'paginationMode',
        values: ['UPDATE_PARAM', 'RESPONSE_URL'],
      },
    },

    // ── Batching ─────────────────────────────────────────────────
    {
      name: 'batchSize',
      displayName: 'Items per Batch',
      type: ParameterType.NUMBER,
      default: 1,
      min: 1,
    },
    {
      name: 'batchInterval',
      displayName: 'Batch Interval (ms)',
      type: ParameterType.NUMBER,
      default: 0,
      min: 0,
    },

    // ── Error ────────────────────────────────────────────────────
    {
      name: 'continueOnFail',
      displayName: 'Continue on Fail',
      type: ParameterType.BOOLEAN,
      default: false,
    },
  ],

  outputs: {
    main: {
      name: 'main',
      displayName: 'Response',
      type: 'object',
      description: 'HTTP response data',
    },
  },
}
