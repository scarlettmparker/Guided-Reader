import { MAX_RETRIES, BASE_DELAY, CacheData, CACHE_KEY } from "./const";
import { UserData } from "./types";

/**
 * Delay the execution of a function.
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get the user data from the session.
 * @return UserData object.
 */
function get_cached_user_data(CACHE_DURATION: number): UserData | null {
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
 * @return UserData object.
 */
export async function fetch_user_data(): Promise<UserData | null> {
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
        `/api/user`,
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

        // ... set the cache (used for navbar/session) ...
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
 * 
 * @param CACHE_DURATION Duration to cache the user data.
 * @param CACHE_KEY Cache key to store the user data.
 * @return UserData object containing username and user ID.
 */
export async function get_user_data_from_session(CACHE_DURATION: number): Promise<UserData> {
  const cached_data = get_cached_user_data(CACHE_DURATION);
  if (cached_data) return cached_data;

  const fetched_data = await fetch_user_data();
  if (fetched_data) return fetched_data;

  return { id: -1, username: "", avatar: "", discord_id: "", nickname: "", accepted_policy: false };
}

/**
 * Logs in the user with the given Discord code from the OAuth2 flow.
 * 
 * @param code Discord code from the OAuth2 flow.
 * @return True if the login is successful, false otherwise.
 */
export async function discord_login(code: string): Promise<boolean> {
  const fetch_options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    credentials: 'include',
    body: JSON.stringify({
      code: code,
    }),
  };

  const response = await fetch(`/api/discord`, {
    ...fetch_options,
  });

  const data = await response.json();
  if (data.status === 'ok') {
    localStorage.setItem('logged_in', 'true');
    return true;
  }

  return false;
}

/**
 * Logs in the user with the given username and password.
 * 
 * @param username Username of the user.
 * @param password Password of the user.
 * @param set_error Function to set the error message.
 * @return Redirects to the home page if the login is successful.
 */
export async function login(username: string, password: string, set_error: (error: string) => void) {
  const fetch_options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    credentials: 'include',
    body: JSON.stringify({
      username: username, password: password
    })
  }

  const response = await fetch(`/api/user`, {
    ...fetch_options
  });

  const data = await response.json();
  if (data.status == 'ok') {
    localStorage.setItem('logged_in', 'true');
    window.location.href = '/';
  } else {
    set_error(data.message);
  }
}

/**
 * Registers a new user with the given username, email, and password.
 * 
 * @param username Username of the user.
 * @param email Email of the user.
 * @param password Password of the user.
 * @param set_error Function to set the error message.
 * @return true if the registration is successful, false otherwise.
 */
export async function register_user(
  username: string, email: string, password: string, set_error: (error: string) => void
): Promise<boolean> {
  const fetch_options: RequestInit = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    credentials: 'include',
    body: JSON.stringify({
      username: username, email: email, password: password
    })
  }

  const response = await fetch(`/api/user`, {
    ...fetch_options
  });

  const data = await response.json();
  if (data.status == 'ok') {
    return true;
  } else {
    set_error(data.message);
  }
  return false;
}

/**
 * Logs out the user.
 * 
 * @param CACHE_KEY Cache key to store the user data.
 * @param user_id User ID of the user.
 * @return true if the logout is successful, false otherwise.
 */
export async function logout(CACHE_KEY: string) {
  try {
    const response = await fetch(
      `/api/logout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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