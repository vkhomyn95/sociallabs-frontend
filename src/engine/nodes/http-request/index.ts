export enum HttpMethod {
  GET     = 'GET',
  POST    = 'POST',
  PUT     = 'PUT',
  PATCH   = 'PATCH',
  DELETE  = 'DELETE',
  HEAD    = 'HEAD',
  OPTIONS = 'OPTIONS',
}

export enum AuthType {
  NONE   = 'NONE',
  BASIC  = 'BASIC',
  BEARER = 'BEARER',
  HEADER = 'HEADER',
  QUERY  = 'QUERY',
}

export enum BodyContentType {
  JSON             = 'JSON',
  FORM_URL_ENCODED = 'FORM_URL_ENCODED',
  FORM_DATA        = 'FORM_DATA',
  RAW              = 'RAW',
}

export enum ResponseFormat {
  AUTODETECT = 'AUTODETECT',
  JSON       = 'JSON',
  TEXT       = 'TEXT',
  FILE       = 'FILE',
}

export interface HttpRequestParams {
  // Request
  method:  HttpMethod
  url:     string
  // Auth
  authType:        AuthType
  basicUsername:   string
  basicPassword:   string
  bearerToken:     string
  headerAuthName:  string
  headerAuthValue: string
  queryAuthName:   string
  queryAuthValue:  string
  // Query params
  sendQueryParams:    boolean
  queryParamsJson:    string
  // Headers
  sendHeaders:  boolean
  headersJson:  string
  // Body
  sendBody:          boolean
  bodyContentType:   BodyContentType
  bodyJson:          string
  rawBody:           string
  rawContentType:    string
  binaryFieldName:   string
  // Options
  responseFormat:          ResponseFormat
  includeResponseMetadata: boolean
  neverError:              boolean
  followRedirects:         boolean
  ignoreSslIssues:         boolean
  timeout:                 number
  continueOnFail:          boolean
}

export function defaultHttpRequestParams(): HttpRequestParams {
  return {
    method:                  HttpMethod.GET,
    url:                     '',
    authType:                AuthType.NONE,
    basicUsername:           '',
    basicPassword:           '',
    bearerToken:             '',
    headerAuthName:          '',
    headerAuthValue:         '',
    queryAuthName:           '',
    queryAuthValue:          '',
    sendQueryParams:         false,
    queryParamsJson:         '{}',
    sendHeaders:             false,
    headersJson:             '{}',
    sendBody:                false,
    bodyContentType:         BodyContentType.JSON,
    bodyJson:                '{}',
    rawBody:                 '',
    rawContentType:          '',
    binaryFieldName:         '',
    responseFormat:          ResponseFormat.AUTODETECT,
    includeResponseMetadata: false,
    neverError:              false,
    followRedirects:         true,
    ignoreSslIssues:         false,
    timeout:                 30_000,
    continueOnFail:          false,
  }
}

import type { SelectOption } from '@/components/ui/select/useSelect'

export const METHOD_OPTIONS: SelectOption[] = Object.values(HttpMethod).map(v => ({ label: v, value: v }))

export const AUTH_OPTIONS: SelectOption[] = [
  { label: 'None',         value: AuthType.NONE   },
  { label: 'Basic Auth',   value: AuthType.BASIC  },
  { label: 'Bearer Token', value: AuthType.BEARER },
  { label: 'Header Auth',  value: AuthType.HEADER },
  { label: 'Query Auth',   value: AuthType.QUERY  },
]

export const BODY_TYPE_OPTIONS: SelectOption[] = [
  { label: 'JSON',                  value: BodyContentType.JSON             },
  { label: 'Form URLencoded',       value: BodyContentType.FORM_URL_ENCODED },
  { label: 'Form-Data (multipart)', value: BodyContentType.FORM_DATA        },
  { label: 'Raw',                   value: BodyContentType.RAW              },
]

export const RESPONSE_FORMAT_OPTIONS: SelectOption[] = [
  { label: 'Autodetect', value: ResponseFormat.AUTODETECT },
  { label: 'JSON',       value: ResponseFormat.JSON       },
  { label: 'Text',       value: ResponseFormat.TEXT       },
  { label: 'File',       value: ResponseFormat.FILE       },
]
