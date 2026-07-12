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
     * Loaded translation bundles keyed by namespace (page namespace + globals).
     */
    __translations__?: Record<string, Record<string, unknown>>;
    /**
     * Server-rendered theme values keyed by property name.
     */
    __theme__?: Record<string, string>;
    /**
     * All available themes for the switcher.
     */
    __themes__?: { name: string; values: Record<string, string> }[];
    /**
     * Posthog API key, baked into the HTML at render time.
     */
    __posthog_key__?: string;
    /**
     * Posthog host, baked into the HTML at render time.
     */
    __posthog_host__?: string;
    /**
     * Whether the Vite React refresh preamble has been installed.
     */
    __vite_plugin_react_preamble_installed__?: boolean;
  }
}
