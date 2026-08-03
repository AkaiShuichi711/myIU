/// <reference types='vite/client' />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_ENV: string
  readonly VITE_APP_URL: string
  readonly VITE_AD_CLIENT_ID: string
  readonly VITE_AD_TENANT_ID: string
  readonly VITE_REDIRECT_URI: string
  readonly VITE_OAUTH_BACKEND_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'swiper/css';
declare module 'swiper/css/pagination';