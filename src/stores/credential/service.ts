import { EventSourcePolyfill } from 'event-source-polyfill'
import api, { API_URL } from '@/core/services/api'
import { getAccessToken } from '@/core/services/auth-token'
import type { SlbDataSource, SlbQuery } from '@sociallabs/frontend-components'
import type {
  ConnectEvent,
  ConnectInput,
  ConnectStartRequest,
  Credential,
  CredentialCreateRequest,
  CredentialKind,
  CredentialPage,
  CredentialQuery,
  CredentialSummary,
  CredentialTestResult,
  CredentialType,
  CredentialTypeDescriptor,
  CredentialUpdateRequest,
} from './types'
import { ConnectEventType } from './types'

const BASE = '/credentials'

/**
 * Serialize a list query into URL params; `types` is sent as repeated `type` params.
 *
 * @param query list query
 * @returns URLSearchParams understood by GET /credentials
 */
function toParams(query: CredentialQuery): URLSearchParams {
  const params = new URLSearchParams()
  params.set('page', String(query.page))
  params.set('pageSize', String(query.pageSize))
  if (query.kind) params.set('kind', query.kind)
  query.types?.forEach((type) => params.append('type', type))
  if (query.status) params.set('status', query.status)
  if (query.search?.trim()) params.set('search', query.search.trim())
  if (query.sort) params.set('sort', query.sort)
  if (query.direction) params.set('direction', query.direction)
  return params
}

export const CredentialService = {
  async search(query: CredentialQuery): Promise<CredentialPage> {
    const { data } = await api.get<CredentialPage>(BASE, { params: toParams(query) })
    return data
  },

  async get(id: number): Promise<Credential> {
    const { data } = await api.get<Credential>(`${BASE}/${id}`)
    return data
  },

  async types(kind?: CredentialKind): Promise<CredentialTypeDescriptor[]> {
    const { data } = await api.get<CredentialTypeDescriptor[]>(`${BASE}/types`, { params: { kind } })
    return data
  },

  async summary(): Promise<CredentialSummary> {
    const { data } = await api.get<CredentialSummary>(`${BASE}/summary`)
    return data
  },

  async create(request: CredentialCreateRequest): Promise<Credential> {
    // Creation may run a live connection test against the provider — allow more time.
    const { data } = await api.post<Credential>(BASE, request, { timeout: 30_000 })
    return data
  },

  async update(id: number, request: CredentialUpdateRequest): Promise<Credential> {
    const { data } = await api.put<Credential>(`${BASE}/${id}`, request, { timeout: 30_000 })
    return data
  },

  async remove(id: number): Promise<void> {
    await api.delete(`${BASE}/${id}`)
  },

  async test(id: number): Promise<CredentialTestResult> {
    const { data } = await api.post<CredentialTestResult>(`${BASE}/${id}/test`, null, { timeout: 30_000 })
    return data
  },

  /**
   * Data source for SlbSelect: searches credentials restricted to the given types.
   *
   * @param types accepted credential types
   * @returns paginated source
   */
  sourceForTypes(types: CredentialType[]): SlbDataSource<Credential> {
    return (query: SlbQuery) =>
      CredentialService.search({
        types,
        search: query.search,
        page: query.page,
        pageSize: query.pageSize,
        sort: 'name',
        direction: 'asc',
      })
  },

  // ─── Interactive connection ─────────────────────────────────────────

  async startConnect(request: ConnectStartRequest): Promise<string> {
    const { data } = await api.post<{ sessionId: string }>(`${BASE}/connect`, request)
    return data.sessionId
  },

  async submitConnectInput(sessionId: string, input: ConnectInput, value: string): Promise<void> {
    await api.post(`${BASE}/connect/${sessionId}/input`, { input, value })
  },

  async cancelConnect(sessionId: string): Promise<void> {
    await api.delete(`${BASE}/connect/${sessionId}`)
  },

  /**
   * Subscribe to connection events. Native EventSource cannot send the bearer token,
   * hence the polyfill.
   *
   * @param sessionId connection session id
   * @param onEvent   called for every event
   * @param onError   called when the stream breaks before the flow finished
   * @returns function that closes the stream
   */
  subscribeConnect(
    sessionId: string,
    onEvent: (event: ConnectEvent) => void,
    onError: () => void,
  ): () => void {
    const source = new EventSourcePolyfill(`${API_URL}${BASE}/connect/${sessionId}/events`, {
      headers: { Authorization: `Bearer ${getAccessToken()}` },
      heartbeatTimeout: 60_000,
    })

    let finished = false
    const handle = (raw: MessageEvent): void => {
      const event = JSON.parse(raw.data) as ConnectEvent
      if (event.type === ConnectEventType.SUCCESS || event.type === ConnectEventType.ERROR) {
        finished = true
        source.close()
      }
      onEvent(event)
    }

    // The backend names each SSE event after its type.
    Object.values(ConnectEventType).forEach((type) =>
      source.addEventListener(type, handle as unknown as EventListener),
    )
    source.onerror = () => {
      if (finished) return
      source.close()
      onError()
    }

    return () => {
      finished = true
      source.close()
    }
  },
}
