import { useLocation } from "@solidjs/router";
import { Component, createSignal, onMount, Show } from "solid-js";
import { BASE_DELAY, ENV, MAX_RETRIES } from "~/utils/const";
import { delay } from '~/utils/userutils';
import { build_avatar_string } from "~/components/Navbar/navbar";
import { role_level_map } from "~/utils/levelconst/levelconst";
import { useUser } from "~/usercontext";
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

/**
 * Fetches the profile data of a user based on the user_id.
 * 
 * @param user_id User ID of the user to fetch the profile data for.
 * @return ProfileData object containing the user's levels and user data.
 */
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

/**
 * Helper function that iterates through the role_level_map map and returns the
 * value that corresponds to the highest index in the role_level_map.
 * 
 * @param levels Array of levels to compare.
 * @return Level with the highest index in the role_level_map.
 */
function get_best_user_level(levels: string[]): string {
  let best_level = "NL";
  let best_index = -1;


  // ... iterate through level map and find level with best index ...
  levels.forEach(level => {
    const index = Array.from(role_level_map.keys()).indexOf(level);
    if (index > best_index) {
      best_index = index;
      best_level = role_level_map.get(level) || "NL";
    }
  })

  return best_level;
}

function cut_username(username: string, max_length: number): string {
  if (username.length > max_length) {
    return username.substring(0, max_length) + "...";
  }
  return username;
}

/**
 * Profile component that displays the user's profile picture, nickname, username, and level.
 * 
 * @return JSX element of the Profile component.
 */

// Wow this is a complte mess right now i gotta clean up this shit
const Profile: Component = () => {
  const location = useLocation();
  const MAX_NICKNAME_LENGTH = 14;
  const MAX_USERNAME_LENGTH = 14;

  const [profile_user_id, set_profile_user_id] = createSignal<string>();
  const [profile_picture, set_profile_picture] = createSignal<string>();
  const [profile_data, set_profile_data] = createSignal<ProfileData>();
  const { user_id } = useUser();

  onMount(async () => {
    const params = new URLSearchParams(location.search);
    const user_id_value = params.get("user_id");

    if (user_id_value && !isNaN(parseInt(user_id_value))) {
      set_profile_user_id(user_id_value);
      const data = await fetch_profile_data(parseInt(user_id_value));

      // ... set user data if user exists, otherwise set user_id to -1 ...
      if (data) {
        set_profile_data(data);
        set_profile_picture(
          build_avatar_string(data.user.discord_id, data.user.avatar) + "?size=256"
        );
      } else {
        set_profile_user_id("-1");
      }
    } else {
      set_profile_user_id("-1");
    }
  })

  return (
    <Show when={profile_user_id() !== undefined} fallback={<div>Loading...</div>}>
      <Show when={profile_user_id() === ""} fallback={
        <Show when={profile_user_id() === "-1"} fallback={
          <Show when={profile_data() !== undefined} fallback={<div>Loading...</div>}>
            <div class={styles.profile_wrapper}>
              <img src={profile_picture()} alt="Profile Picture" class={styles.profile_picture} />
              <div class={styles.profile_info}>
                <div class={styles.profile_header}>
                  <span class={styles.header_text}>{
                    cut_username(profile_data()!.user.nickname, MAX_NICKNAME_LENGTH)
                  }</span>
                  <span class={`${styles.level_text} ${styles.body_text}`}>{get_best_user_level(profile_data()!.levels)}</span>
                </div>
                <div class={styles.profile_subheader}>
                  <span class={styles.body_text}>{
                    cut_username(profile_data()!.user.username, MAX_USERNAME_LENGTH)
                  }</span>
                  <VerifiedModule user_id={user_id()} profile_id={profile_data()!.user.id}
                    verified={profile_data()!.user.discord_status} />
                </div>
              </div>
            </div>
          </Show>
        }>
          <div>User not found</div>
        </Show>
      }>
        <div>Loading...</div>
      </Show>
    </Show>
  );
}

interface VerifiedModuleProps {
  user_id: number;
  profile_id: number;
  verified: boolean;
}

/**
 * Component that displays the verification status of a user.
 * If the profile belongs to the current logged in user, the user can verify their account.
 * 
 * @param user_id User ID of the current logged in user.
 * @param profile_id User ID of the profile being viewed.
 * @param verified Boolean value indicating if the user is verified.
 * @return JSX element of the VerifiedModule component.
 */
const VerifiedModule: Component<VerifiedModuleProps> = (props) => {
  return (
    <span class={`${styles.verified_text} ${styles.body_text}`}>
      {props.verified ? (
        "verified"
      ) : (
        <>
          {props.user_id == props.profile_id ? (
            <span class={styles.unverified_text}>
              <a href={ENV.VITE_DISCORD_LINK_REDIRECT_URI}>unverified</a>
            </span>
          ) : (
            <span class={styles.unverified_text}>unverified</span>
          )}
        </>
      )}
    </span>
  )
}
export default Profile;