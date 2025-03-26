/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
declare global {
  interface ImportMetaEnv {
    readonly VITE_BASE_URL: string;
    readonly VITE_BASE_URL_KEYCLOAK: string;
    readonly VITE_KEYCLOAK_REALM: string;
    readonly VITE_KEYCLOAK_CLIENT_ID: string;
  }
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
