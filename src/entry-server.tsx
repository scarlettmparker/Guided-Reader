import React, { Suspense } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { Router, routes } from "./router";
import Layout from "./components/layout";
import NotFound from "./routes/not-found";
import { matchRoutes } from "react-router-dom";
import { inlineCss, generateCssTag } from "@sun/utils";
import "./utils/register-loaders";
import { suspenseCache, invalidateCache, type MutationResult } from "@sun/ssr";
import { createI18nInstance } from "./utils/i18n";
import { fetchPropertySet } from "./utils/api";
import fs from "fs";
import path from "path";

/**
 * Namespaces loaded on every render, regardless of route.
 */
const GLOBAL_NAMESPACES = ["nav"];

type RenderProps = {
  url: string;
  locale: string;
  pageName: string;
  clientJs: string;
  clientCss: string[];
  isProduction: boolean;
  mutationPayload: MutationResult;
  invalidateCacheCookie?: string;
  frontendMode: string;
};

export async function render({
  url,
  locale,
  pageName,
  clientJs,
  clientCss,
  isProduction,
  mutationPayload: _mutationPayload,
  invalidateCacheCookie,
}: RenderProps) {
  if (!clientJs) {
    throw new Error("Missing required clientJs path");
  }

  let shouldDeleteCookie = false;
  if (invalidateCacheCookie) {
    shouldDeleteCookie = invalidateCache(invalidateCacheCookie);
  }

  for (const [key, record] of suspenseCache.entries()) {
    if (record.status === "rejected") {
      suspenseCache.delete(key);
    }
  }

  const i18n = createI18nInstance();
  await i18n.init({
    lng: locale,
    fallbackLng: "en",
    resources: {},
    interpolation: { escapeValue: false },
  });

  const translations: Record<string, Record<string, unknown>> = {};
  for (const ns of [pageName, ...GLOBAL_NAMESPACES]) {
    try {
      const filePath = path.resolve(
        process.cwd(),
        `messages/${ns}/${locale}.json`,
      );
      if (fs.existsSync(filePath)) {
        const bundle = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        translations[ns] = bundle;
        i18n.addResourceBundle(locale, ns, bundle, true, true);
      }
    } catch {
      // namespace optional; fall back to empty
    }
  }

  let theme: Record<string, string> | null = null;

  // Fetch all themes and map them to an array of { name, values } objects. The "greek" theme is the default.
  let themes: { name: string; values: Record<string, string> }[] = [];
  try {
    const result = await fetchPropertySet("ReactApp", "themes");
    const map = result?.success
      ? (result.data as { gaiaQueries?: { propertySet?: unknown } })
          ?.gaiaQueries?.propertySet
      : null;
    if (map && typeof map === "object") {
      const themeMap = map as Record<string, Record<string, string>>;
      themes = Object.entries(themeMap).map(([name, values]) => ({
        name,
        values,
      }));
      theme = themeMap["greek"] ?? null;
    }
  } catch {
    // Theme is optional; fall back to the persisted or default theme.
  }

  // Inline the theme as CSS custom-property overrides in the document head so
  // the first server-rendered paint is already themed.
  const themeStyle = theme
    ? `<style>:root{${Object.entries(theme)
        .map(([key, value]) => `--${key}:${value};`)
        .join("")}}</style>`
    : "";

  const matches = matchRoutes(routes, url);
  const didMatch = Boolean(matches);

  const App = (
    <React.StrictMode>
      <StaticRouter location={url}>
        <Layout>
          <Suspense fallback={null}>
            <Router />
          </Suspense>
        </Layout>
      </StaticRouter>
    </React.StrictMode>
  );

  const cssContent = await inlineCss(isProduction, clientCss);

  return new Promise((resolve) => {
    let resolved = false;
    let postludeData = "";

    const stream = renderToPipeableStream(didMatch ? App : <NotFound />, {
      bootstrapModules: [clientJs],
      onShellReady() {
        const cssTag = generateCssTag(isProduction, cssContent, clientCss);
        const headers: Record<string, string> = { "Content-Type": "text/html" };
        if (shouldDeleteCookie) {
          headers["Set-Cookie"] =
            "invalidate_cache=; Path=/; Max-Age=0; SameSite=Lax;";
        }
        const prelude = `<!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              ${cssTag}
              ${themeStyle}
              <title>Guided Reader | Scarlet Sun</title>
            </head>
            <script>
              window.__translations__ = ${JSON.stringify(translations)};
              window.__locale__ = '${locale}';
              window.__theme__ = ${JSON.stringify(theme)};
              window.__themes__ = ${JSON.stringify(themes)};
              window.__serverCacheData__ = {};
            </script>
            <body>
              <div id="app">`;
        if (!resolved) {
          resolved = true;
          resolve({
            statusCode: didMatch ? 200 : 404,
            headers,
            prelude,
            postlude: () => postludeData,
            stream,
          });
        }
      },
      onAllReady() {
        const serverCacheData: Record<string, unknown> = {};
        for (const [key, record] of suspenseCache.entries()) {
          if (record.status === "resolved") {
            serverCacheData[key] = record.result;
          }
        }
        postludeData = `</div>
          <script>
          if (window.__serverCacheData__ !== undefined) {
            Object.assign(window.__serverCacheData__, ${JSON.stringify(serverCacheData)});
            if (window.hydratePageDataFromPostlude) {
              window.hydratePageDataFromPostlude(window.__serverCacheData__);
            }
          }
          </script>
          <script type="module" src="${clientJs}"></script>
        </body>
      </html>`;
      },
    });
  });
}
