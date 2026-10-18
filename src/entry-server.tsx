import React, { Suspense } from "react";
import { StaticRouter } from "react-router-dom/server";
import { matchRoutes } from "react-router-dom";
import { Router, routes, routeMeta } from "./router";
import Layout from "./components/layout";
import NotFound from "./routes/not-found";
import type { Resource } from "i18next";
import { createRenderer, type RouteMeta } from "@sun/ssr/renderer";
import { autoDiscoverRegistrations } from "@sun/ssr/server";
import { sharedCall, SHARED_TTL } from "@sun/ssr";
import { createI18nInstance } from "./utils/i18n";
import { setI18n } from "@sun/i18n";
import { fetchPropertySet } from "./utils/api";
import { configureApi } from "@sun/api";
import { AUTH_COOKIE } from "./utils/auth";
import { clientId, clientSecret, base } from "../config.js";
import "./utils/configure-framework";

configureApi({
  authCookie: AUTH_COOKIE,
  clientId,
  clientSecret,
  appBaseUrl: base,
});

// Colocated loaders and mutation handlers self-register at boot.
autoDiscoverRegistrations(import.meta.glob("./**/*-data.ts", { eager: true }));
autoDiscoverRegistrations(
  import.meta.glob("./**/*-mutations.ts", { eager: true }),
);

function matchMeta(
  matches: ReturnType<typeof matchRoutes>,
): RouteMeta | undefined {
  if (!matches) return undefined;
  const composed = matches
    .map((m) => m.route.path ?? "")
    .join("/")
    .replace(/\/{2,}/g, "/");
  return routeMeta[composed === "" ? "/" : composed];
}

const i18nByLocale = new Map<
  string,
  Promise<ReturnType<typeof createI18nInstance>>
>();

const renderer = createRenderer({
  title: "Guided Reader | Scarlet Sun",
  /**
   * Initialises the i18n instance for the render's locale, reusing one per locale.
   *
   * @param locale The resolved locale code.
   * @param translations The parsed messages for the locale.
   * @returns A promise that resolves once the instance is ready.
   */
  initI18n(locale, translations) {
    let pending = i18nByLocale.get(locale);
    if (!pending) {
      const instance = createI18nInstance();
      pending = Promise.resolve(
        instance.init({
          lng: locale,
          fallbackLng: "en",
          resources: { [locale]: translations } as Resource,
          interpolation: { escapeValue: false },
          react: { useSuspense: true },
        }),
      ).then(() => instance);
      i18nByLocale.set(locale, pending);
    }
    return pending.then((instance) => {
      setI18n(instance);
    });
  },
  /**
   * Loads the cached theme set from gaia.
   *
   * @returns The current theme and all themes.
   */
  async resolveTheme() {
    return sharedCall("shared:themes", SHARED_TTL.CONFIG, async () => {
      const result = await fetchPropertySet("ReactApp", "themes");
      if (!result?.success) {
        throw new Error("themes unavailable");
      }
      const map = (result.data as { gaiaQueries?: { propertySet?: unknown } })
        ?.gaiaQueries?.propertySet;
      if (map && typeof map === "object") {
        const themeMap = map as Record<string, Record<string, string>>;
        const entries = Object.entries(themeMap);
        return {
          current: entries[0]?.[1] ?? null,
          all: entries.map(([name, values]) => ({
            name,
            values,
          })),
        };
      }
      return { current: null, all: [] };
    }).catch(() => ({ current: null, all: [] }));
  },
});

export async function render(options: {
  url: string;
  locale: string;
  pageName: string;
  clientJs: string;
  clientCss: string[];
  isProduction: boolean;
  nonce?: string;
  frontendMode?: string;
}) {
  const matches = matchRoutes(routes, options.url);
  const didMatch = Boolean(matches);
  const App = (
    <StaticRouter location={options.url}>
      <Layout>
        <Suspense fallback={null}>
          <Router />
        </Suspense>
      </Layout>
    </StaticRouter>
  );

  const tree = options.isProduction ? (
    App
  ) : (
    <React.StrictMode>{App}</React.StrictMode>
  );

  return renderer.render({
    app: didMatch ? tree : <NotFound />,
    didMatch,
    meta: matchMeta(matches),
    url: options.url,
    locale: options.locale,
    pageName: options.pageName,
    clientJs: options.clientJs,
    clientCss: options.clientCss,
    isProduction: options.isProduction,
    nonce: options.nonce,
    frontendMode: options.frontendMode,
  });
}
