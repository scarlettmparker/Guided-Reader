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
};

export interface CacheData {
  timestamp: number;
  data: UserData;
}