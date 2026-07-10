import { BrowserRouter, useLocation, matchRoutes } from "react-router-dom";
import { Router, routes } from "./router";
import { initReactI18next } from "react-i18next";
import ReactDOM from "react-dom/client";
import i18n from "i18next";
import { Suspense, useEffect } from "react";

import Layout from "./components/layout";
import { hydratePageData } from "@sun/ssr";
import { loadPersistedTheme, applyTheme } from "@sun/themes";
import "./utils/configure-framework";
import "@sun/components/style.css";
import "@sun/themes/style.css";

window.hydratePageDataFromPostlude = hydratePageData;

// Apply the server-rendered theme (window.__theme__) before the app mounts so
// there is no flash. A persisted user choice takes precedence.
if (window.localStorage.getItem("sun:theme")) {
  loadPersistedTheme();
} else if (window.__theme__) {
  applyTheme(window.__theme__);
}

/**
 * Computes the message namespace for a path (its first segment).
 */
function getPageName(pathname: string) {
  if (pathname === "/") return "library";
  const page = pathname.split("/")[1];
  return page || "library";
}

/**
 * Dynamically loads the translations for a page/locale.
 */
async function loadTranslations(page: string, locale: string) {
  try {
    const res = await fetch(`/messages/${page}/${locale}.json`);
    if (!res.ok) throw new Error("Not found");
    return await res.json();
  } catch {
    const res = await fetch(`/messages/${page}/en.json`);
    return await res.json();
  }
}

/**
 * Loads translations on route change.
 */
function AppWithI18n() {
  const location = useLocation();

  useEffect(() => {
    const locale = window.__locale__ || "en";
    const matches = matchRoutes(routes, location.pathname);
    const page =
      matches && matches[0].route.path === "*"
        ? "not-found"
        : getPageName(location.pathname);
    loadTranslations(page, locale).then((translations) => {
      i18n.addResourceBundle(locale, page, translations, true, true);
      i18n.changeLanguage(locale);
    });
  }, [location.pathname]);

  return (
    <Suspense fallback={null}>
      <Router />
    </Suspense>
  );
}

const locale = window.__locale__ || "en";
const initialPage = getPageName(window.location.pathname);
const NAMESPACES = [
  "library",
  "reader",
  "annotation",
  "thread",
  "auth",
  "create",
];

i18n
  .use(initReactI18next)
  .init({
    lng: locale,
    resources: {
      [locale]: {
        [initialPage]: window.__translations__ || {},
      },
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
  })
  .then(() => {
    const serverCacheData = window.__serverCacheData__ || {};
    if (Object.keys(serverCacheData).length > 0) {
      hydratePageData(serverCacheData);
      window.__serverCacheData__ = {};
    }

    ReactDOM.hydrateRoot(
      document.getElementById("app") as HTMLElement,
      <BrowserRouter>
        <Layout>
          <AppWithI18n />
        </Layout>
      </BrowserRouter>,
    );

    for (const ns of NAMESPACES) {
      if (ns === initialPage || i18n.hasResourceBundle(locale, ns)) continue;
      fetch(`/messages/${ns}/${locale}.json`)
        .then((res) => (res.ok ? res.json() : null))
        .then((translations) => {
          if (translations) {
            i18n.addResourceBundle(locale, ns, translations, true, true);
          }
        })
        .catch(() => {
          // namespace optional; ignore fetch failures
        });
    }
  });
