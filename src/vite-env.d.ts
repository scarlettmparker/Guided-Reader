/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export declare global {
  interface Window {
    hydratePageDataFromPostlude?: (
      initialData: Record<string, Record<string, unknown>>,
    ) => void;
    __serverCacheData__?: Record<string, Record<string, unknown>>;
    __locale__?: string;
    /**
     * Current loaded translations.
     */
    __translations__?: Record<string, unknown>;
    /**
     * Server-rendered theme values keyed by property name.
     */
    __theme__?: Record<string, string>;
    /**
     * Whether the Vite React refresh preamble has been installed.
     */
    __vite_plugin_react_preamble_installed__?: boolean;
  }
}
