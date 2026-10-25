// Minimal typings for event-source-polyfill (no @types package): an EventSource that accepts headers.
declare module 'event-source-polyfill' {
  export interface EventSourcePolyfillInit {
    headers?: Record<string, string>
    heartbeatTimeout?: number
    withCredentials?: boolean
  }

  export class EventSourcePolyfill extends EventSource {
    constructor(url: string, init?: EventSourcePolyfillInit)
  }
}
