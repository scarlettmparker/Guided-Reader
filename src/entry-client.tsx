import { BrowserRouter } from "react-router-dom";
import { Router } from "./router";
import { initReactI18next } from "react-i18next";
import ReactDOM from "react-dom/client";
import i18n from "i18next";
import { Suspense } from "react";

import Layout from "./components/layout";
import { initClientBootstrap } from "@sun/ssr";
import { loadPersistedTheme, applyTheme } from "@sun/themes";
import "./utils/configure-framework";
import "@sun/components/style.css";
import "@sun/themes/style.css";

// Apply the server-rendered theme before mount so there is no flash; a
// persisted user choice takes precedence.
if (window.localStorage.getItem("sun:theme")) {
  loadPersistedTheme();
} else if (window.__theme__) {
  applyTheme(window.__theme__);
}

i18n.use(initReactI18next);

initClientBootstrap({ i18n }).then(() => {
  ReactDOM.hydrateRoot(
    document.getElementById("app") as HTMLElement,
    <BrowserRouter>
      <Layout>
        <Suspense fallback={null}>
          <Router />
        </Suspense>
      </Layout>
    </BrowserRouter>,
  );
});
