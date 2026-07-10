/**
 * @fileoverview Defines and sets up all application routes.
 * @module routes
 */
import { renderApp } from "../utils/ssr.js";
import { base, isProduction } from "../config.js";
import { Buffer } from "buffer";
import {
  AUTH_COOKIE,
  OAUTH_STATE_COOKIE,
  getCookieValue,
  getCurrentUser,
  loginViaGaia,
  discordLoginViaCode,
  buildAuthCookie,
  clearAuthCookie,
  buildStateCookie,
  buildDiscordAuthUrl,
  newOAuthState,
} from "../src/utils/auth.ts";
import { seedPageData } from "../src/utils/seed-page-data.ts";

/** Pages that do not require an authenticated session. */
const PUBLIC_PAGES = new Set(["/login", "/register"]);

/** Strips a trailing slash (except for the root). */
function normalizePath(pathname) {
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.replace(/\/+$/, "")
    : pathname;
}

/**
 * Sets up routes for the Fastify application.
 *
 * @param {import("fastify").FastifyInstance} app - The Fastify application instance.
 * @param {object} vite - The Vite dev server instance (optional, only in development).
 */
export function setupRoutes(app, vite) {
  /**
   * Login via PRG: validate against gaia, set the httpOnly cookie, redirect.
   */
  app.post("/__login", async (request, reply) => {
    const { username, password } = request.body ?? {};
    const token = await loginViaGaia(username, password);
    if (!token) return reply.redirect("/login?error=1");
    reply.header("Set-Cookie", buildAuthCookie(token));
    return reply.redirect("/");
  });

  /**
   * Logout via PRG: clear the cookie, redirect to /login.
   */
  app.post("/__logout", async (_request, reply) => {
    reply.header("Set-Cookie", clearAuthCookie());
    return reply.redirect("/login");
  });

  /**
   * Starts Discord OAuth: set a state cookie, redirect to the authorize URL.
   */
  app.get("/auth/discord", async (_request, reply) => {
    const state = newOAuthState();
    reply.header("Set-Cookie", buildStateCookie(state));
    return reply.redirect(buildDiscordAuthUrl(state));
  });

  /**
   * Discord OAuth callback: verify state, swap the code, set the cookie.
   */
  app.get("/auth/discord/callback", async (request, reply) => {
    const { code, state } = request.query ?? {};
    const expected = getCookieValue(request.headers.cookie, OAUTH_STATE_COOKIE);
    reply.header(
      "Set-Cookie",
      `${OAUTH_STATE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    );

    if (!code || !state || !expected || state !== expected) {
      return reply.redirect("/login?error=discord");
    }
    const token = await discordLoginViaCode(code, state);
    if (!token) return reply.redirect("/login?error=discord");

    reply.header("Set-Cookie", buildAuthCookie(token));
    return reply.redirect("/");
  });

  /**
   * Catch-all SSR, gated on a session.
   */
  app.setNotFoundHandler({ method: ["GET"] }, async (request, reply) => {
    const requestUrl = new URL(request.raw.url, "http://localhost");
    const pathname = normalizePath(requestUrl.pathname);

    if (/\.[^/]+$/.test(pathname)) {
      return reply.callNotFound();
    }

    const token = getCookieValue(request.headers.cookie, AUTH_COOKIE);
    const user = await getCurrentUser(token);
    const isPublic = PUBLIC_PAGES.has(pathname);

    if (!user && !isPublic) return reply.redirect("/login");
    if (user && isPublic) return reply.redirect("/");

    await seedPageData(user);

    const mutationPayloadCookie = getCookieValue(
      request.headers.cookie,
      "mutation_payload",
    );
    const invalidateCacheCookie = getCookieValue(
      request.headers.cookie,
      "invalidate_cache",
    );
    let mutationPayload = null;
    if (mutationPayloadCookie) {
      try {
        mutationPayload = JSON.parse(
          Buffer.from(mutationPayloadCookie, "base64").toString("utf-8"),
        );
      } catch (_) {
        // Do nothing
      }
    }

    let url = pathname.replace(base, "");
    if (!url.startsWith("/")) url = "/" + url;
    if (requestUrl.search) url += requestUrl.search;

    const langHeader = request.headers["accept-language"] || "en";
    const locale = langHeader.split(",")[0] || "en";

    const pathOnly = url.split("?")[0];
    const pageName =
      pathOnly === "/" ? "library" : pathOnly.split("/")[1] || "library";
    const frontendMode = "reader";

    try {
      await renderApp(
        {
          vite,
          isProduction,
          url,
          locale,
          pageName,
          frontendMode,
          mutationPayload,
          invalidateCacheCookie,
        },
        reply.raw,
      );
    } catch (e) {
      console.error("Error during route handling:", e);
      reply.status(500).send("Internal Server Error: " + e.message);
    }
  });
}
