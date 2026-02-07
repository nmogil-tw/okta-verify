/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string
  readonly VITE_OKTA_ORG_URL: string
  readonly VITE_OKTA_CLIENT_ID: string
  readonly VITE_OKTA_REDIRECT_URI: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
