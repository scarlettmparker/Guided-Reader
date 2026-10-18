import React, { Suspense } from "react";
import { StaticRouter } from "react-router-dom/server";
import { matchRoutes } from "react-router-dom";
import { Router, routes, routeMeta } from "./router";
import Layout from "./components/layout";
import NotFound from "./routes/not-found";
import {
  createRenderer,
  autoDiscoverRegistrations,
  type RouteMeta,
} from "@sun/ssr/server";
import { sharedCall, SHARED_TTL } from "@sun/ssr";
import { createI18nInstance } from "./utils/i18n";
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

function matchMeta(url: string): RouteMeta | undefined {
  const matches = matchRoutes(routes, url);
  if (!matches) return undefined;
  const composed = matches
    .map((m) => m.route.path ?? "")
    .join("/")
    .replace(/\/{2,}/g, "/");
  return routeMeta[composed === "" ? "/" : composed];
}

const renderer = createRenderer({
  title: "Guided Reader | Scarlet Sun",
  initI18n(locale, translations) {
    const i18n = createI18nInstance();
    return i18n.init({
      lng: locale,
      fallbackLng: "en",
      resources: { [locale]: translations } as never,
      interpolation: { escapeValue: false },
      react: { useSuspense: true },
    });
  },
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
  frontendMode?: string;
}) {
  const matches = matchRoutes(routes, options.url);
  const didMatch = Boolean(matches);
  const App = (
    <React.StrictMode>
      <StaticRouter location={options.url}>
        <Layout>
          <Suspense fallback={null}>
            <Router />
          </Suspense>
        </Layout>
      </StaticRouter>
    </React.StrictMode>
  );

  return renderer.render({
    app: didMatch ? App : <NotFound />,
    didMatch,
    meta: matchMeta(options.url),
    url: options.url,
    locale: options.locale,
    pageName: options.pageName,
    clientJs: options.clientJs,
    clientCss: options.clientCss,
    isProduction: options.isProduction,
    frontendMode: options.frontendMode,
  });
}
