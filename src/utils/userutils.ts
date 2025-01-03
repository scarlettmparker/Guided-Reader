import { UserData, MAX_RETRIES, ENV, BASE_DELAY, CacheData } from "./const";

/**
 * Delay the execution of a function.
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get the user data from the session.
 * @returns UserData object.
 */
function get_cached_user_data(CACHE_DURATION: number, CACHE_KEY: string): UserData | null {
  const cached_data = localStorage.getItem(CACHE_KEY);

  if (!cached_data) return null;

  const cache: CacheData = JSON.parse(cached_data);
  if (Date.now() - cache.timestamp < CACHE_DURATION) {
    return cache.data;
  }

  return null;
}

/**
 * Fetch the user data from the server.
 * This function sends a GET request to the server to get the user data.
 * @param CACHE_KEY Cache key to store the user data.
 * @returns UserData object.
 */
async function fetch_user_data(CACHE_KEY: string): Promise<UserData | null> {
  const REQUEST_TIMEOUT = 1000;

  const fetch_options: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Connection': 'keep-alive',
    },
    credentials: 'include',
  };


  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout_id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      const response = await fetch(
        `https://${ENV.VITE_SERVER_HOST}:${ENV.VITE_SERVER_PORT}/user`,
        {
          ...fetch_options,
          signal: controller.signal,
        }
      );
      if (response.status == 401) {
        console.error('Unauthorized');
        return null;
      }
      const data = await response.json();
      if (data.status === 'ok') {
        const user_data = data.message as UserData;
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: user_data, timestamp: Date.now() })
        );
        return user_data;
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`, error);
      if (attempt < MAX_RETRIES) {
        const backoff_delay = BASE_DELAY * Math.pow(2, attempt);
        await delay(backoff_delay);
      }
    } finally {
      clearTimeout(timeout_id);
    }
  }
  return null;
}

/**
 * Get the user data from the session.
 * @returns UserData object containing username and user ID.
 */
export async function get_user_data_from_session(CACHE_DURATION: number, CACHE_KEY: string): Promise<UserData> {
  const cached_data = get_cached_user_data(CACHE_DURATION, CACHE_KEY);
  if (cached_data) return cached_data;

  const fetched_data = await fetch_user_data(CACHE_KEY);
  if (fetched_data) return fetched_data;

  return { id: -1, username: "", avatar: "", discord_id: "", nickname: "" };
}

export async function logout(CACHE_KEY: string, user_id: number) {
  try {
    const response = await fetch(
      `https://${ENV.VITE_SERVER_HOST}:${ENV.VITE_SERVER_PORT}/logout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ user_id: user_id }),
        credentials: 'include',
      }
    );

    if (response.status == 401) {
      console.error('Unauthorized');
      return false;
    }

    const data = await response.json();
    if (data.status === 'ok') {
      localStorage.setItem('logged_in', 'false');
      localStorage.removeItem(CACHE_KEY);

      document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      return true;
    }
  } catch (error) {
    console.error('Logout failed:', error);
  }

  return false;
}