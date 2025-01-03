export const CACHE_DURATION = 5 * 60 * 1000;
export const CACHE_KEY = 'user_data_cache';

export const MAX_RETRIES = 3;
export const BASE_DELAY = 1000;

export const ENV = {
  VITE_SERVER_HOST: import.meta.env.VITE_SERVER_HOST,
  VITE_SERVER_PORT: import.meta.env.VITE_SERVER_PORT,
  VITE_SERVER_DEV: import.meta.env.VITE_SERVER_DEV,
  VITE_CLIENT_API_KEY: import.meta.env.VITE_CLIENT_API_KEY
};

export type UserData = {
  id: number;
  username: string;
  avatar: string;
  discord_id: string;
  nickname: string;
}

export interface CacheData {
  timestamp: number;
  data: UserData;
}