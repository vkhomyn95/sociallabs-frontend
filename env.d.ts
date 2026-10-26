/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  /** `v2` opens workflows in the new editor by default; the legacy editor stays reachable either way. */
  readonly VITE_WORKFLOW_EDITOR?: 'legacy' | 'v2'
}
