import { useLocation } from "@solidjs/router";
import { Component, createSignal, onMount, Show } from "solid-js";
import { BASE_DELAY, MAX_RETRIES } from "~/utils/const";
import { delay } from '~/utils/userutils';
import styles from './profile.module.css';

type ProfileData = {
  levels: string[];
  user: UserProfileData;
}

type UserProfileData = {
  id: number;
  username: string;
  nickname: string;
  discord_id: string;
  avatar: string;
  discord_status: boolean;
}

async function fetch_profile_data(user_id: number): Promise<ProfileData | null> {
  const REQUEST_TIMEOUT = 5000;

  const fetch_options: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Connection': 'keep-alive',
    },
    credentials: 'include'
  };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout_id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(
        `/api/profile?user_id=${user_id}`,
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
      if (data.status == 'ok') {
        const profile_data = data.message[0] as ProfileData;
        return profile_data;
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

const Profile: Component = () => {
  const location = useLocation();
  const [user_id, set_user_id] = createSignal<string>();
  const [profile_data, set_profile_data] = createSignal<ProfileData>();

  onMount(async () => {
    const params = new URLSearchParams(location.search);
    const user_id_value = params.get("user_id");

    if (user_id_value && !isNaN(parseInt(user_id_value))) {
      set_user_id(user_id_value);
      const data = await fetch_profile_data(parseInt(user_id_value));

      // ... set user data if user exists, otherwise set user_id to -1 ...
      if (data) {
        set_profile_data(data);
        console.log(data);
      } else {
        set_user_id("-1");
      }
    } else {
      set_user_id("-1");
    }
  })

  return (
    <Show when={user_id() === ""} fallback={
      <Show when={user_id() === "-1"} fallback={
        <div class={styles.profile_wrapper}>
          Profile for user {user_id()}
        </div>
      }>
        <div>User not found</div>
      </Show>
    }>
      <div>Loading...</div>
    </Show>
  );
}

export default Profile;