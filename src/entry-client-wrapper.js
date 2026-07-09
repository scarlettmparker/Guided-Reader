import { loadPersistedTheme, applyTheme } from "@sun/themes";

// Apply the server-rendered theme (injected into window.__theme__ by the SSR
// prelude) before the app mounts so there is no flash.
const persistedTheme = window.localStorage.getItem("sun:theme");
if (persistedTheme) {
  loadPersistedTheme();
} else if (window.__theme__) {
  applyTheme(window.__theme__);
}

if (import.meta.env.DEV) {
  const serverBase = import.meta.env.VITE_SERVER_BASE || "localhost";

  if (!window.__vite_plugin_react_preamble_installed__) {
    window.__vite_plugin_react_preamble_installed__ = true;

    import(/* @vite-ignore */ `${serverBase}/@react-refresh`).then(
      (RefreshRuntimeModule) => {
        const RefreshRuntime = RefreshRuntimeModule.default;

        RefreshRuntime.injectIntoGlobalHook(window);
        window.$RefreshReg$ = () => {};
        window.$RefreshSig$ = () => (type) => type;

        import("./entry-client.tsx");
      },
    );
  } else {
    import("./entry-client.tsx");
  }
} else {
  import("./entry-client.tsx");
}
