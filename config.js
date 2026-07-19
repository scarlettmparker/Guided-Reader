/**
 * @fileoverview Configuration settings for the server, loaded from environment variables.
 * @module config
 */

import { config } from "dotenv";

export const isProduction = process.env.NODE_ENV === "production";

config({
  path: `.env${isProduction ? ".production" : ""}`,
});

export const port = parseInt(process.env.SERVER_PORT || "5177", 10);

export const host = process.env.SERVER_HOST || "0.0.0.0";

export const base = process.env.VITE_SERVER_BASE || "/";

export const backendHost = process.env.BACKEND_HOST || "0.0.0.0";

export const backendPort = parseInt(process.env.BACKEND_PORT || "443", 10);

/**
 * Per-app credentials forwarded to the gateway as X-Client-Id / X-Client-Secret.
 */
export const clientId = process.env.CLIENT_ID || "guided-reader";
export const clientSecret = process.env.CLIENT_SECRET || "";

export const manifestPath = "./dist/client/.vite/manifest.json";

/**
 * Discord OAuth client id and the guild members must belong to.
 */
export const discordClientId = process.env.DISCORD_CLIENT_ID || "";
export const discordGuildId = process.env.DISCORD_GUILD_ID || "";

/**
 * The OAuth callback route registered with Discord.
 */
export const discordRedirectUri =
  process.env.DISCORD_REDIRECT_URI ||
  "http://localhost:5178/auth/discord/callback";

/** OAuth scopes requested on authorization. Non-secret. */
export const discordScopes =
  process.env.DISCORD_SCOPES || "identify guilds guilds.members.read";
