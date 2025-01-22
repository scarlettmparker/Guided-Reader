import { UserData } from "./types";

export const CACHE_DURATION = 5 * 60 * 1000;
export const CACHE_KEY = 'user_data_cache';

export const MAX_RETRIES = 3;
export const BASE_DELAY = 1000;

export const ENV = {
  VITE_SERVER_HOST: import.meta.env.VITE_SERVER_HOST,
  VITE_SERVER_PORT: import.meta.env.VITE_SERVER_PORT,
  VITE_SERVER_DEV: import.meta.env.VITE_SERVER_DEV,
  VITE_DISCORD_REDIRECT_URI: import.meta.env.VITE_DISCORD_REDIRECT_URI,
  VITE_DISCORD_LINK_REDIRECT_URI: import.meta.env.VITE_DISCORD_LINK_REDIRECT_URI,
  VITE_CLIENT_CERT: import.meta.env.VITE_CLIENT_CERT,
  VITE_CLIENT_KEY: import.meta.env.VITE_CLIENT_KEY,
  VITE_CLIENT_CA: import.meta.env.VITE_CLIENT_CA,
};

export interface CacheData {
  timestamp: number;
  data: UserData;
}