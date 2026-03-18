/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PROJECT_TOKEN: string;
  readonly VITE_DEPLOYMENT_NAME: string;
  readonly VITE_MCP_CLIENT_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
