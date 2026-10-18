/**
 * @fileoverview Main entry point for the Fastify server application.
 * Sets up middleware, Vite integration (for development), and routes, then starts the server.
 */

import { createServer } from "@sun/ssr/server";
import { configureApi } from "@sun/api";
import {
  port,
  host,
  base,
  isProduction,
  backendHost,
  backendPort,
  clientId,
  clientSecret,
  allowedOrigins,
} from "./config.js";
import { setupRoutes } from "./routes/index.js";
import { AUTH_COOKIE } from "./src/utils/auth.ts";

configureApi({
  authCookie: AUTH_COOKIE,
  clientId,
  clientSecret,
  appBaseUrl: base,
});

// Parse native form POST bodies (login/logout use PRG so the browser stores the
// httpOnly auth cookie, which it won't for a fetch + JS-redirect).
const configure = async (app) => {
  const { default: formbody } = await import("@fastify/formbody");
  await app.register(formbody);
};

await createServer({
  config: {
    port,
    host,
    base,
    isProduction,
    backendHost,
    backendPort,
    clientId,
    clientSecret,
    allowedOrigins,
  },
  setupRoutes,
  configure,
  analytics: {
    app: "guided-reader",
    authCookie: AUTH_COOKIE,
    consentCookie: "cookie_consent",
  },
});
