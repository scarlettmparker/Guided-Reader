import { Component, createEffect, createSignal, onMount, Show } from "solid-js";
import { useUser } from "~/usercontext";
import { UserData, CACHE_DURATION, CACHE_KEY } from "~/utils/const";
import { get_user_data_from_session } from "~/utils/userutils";
import styles from './navbar.module.css';

/**
 * Sets the user status based on the local storage.
 * If the user is logged in, the user's username and user_id are set.
 * If the user is not logged in, the user's username and user_id are set to
 * empty string and -1 respectively.
 */
export async function set_user_status() {
  const { set_username, set_user_id, set_discord_id, set_avatar, set_logged_in } = useUser();

  if (localStorage.getItem('logged_in') === null || localStorage.getItem('logged_in') === 'false') {
    set_logged_in(false);
    return;
  }

  const user_data: UserData = await get_user_data_from_session(CACHE_DURATION, CACHE_KEY);

  if (user_data.username === "" || user_data.id === -1) {
    localStorage.setItem('logged_in', 'false');
    set_logged_in(false);
  } else {
    // ... update the user context ...
    set_username(user_data.username);
    set_user_id(user_data.id);
    set_discord_id(user_data.discord_id);
    set_avatar(user_data.avatar);

    set_logged_in(true);
  }
}

export function build_avatar_string(discord_id: string, avatar: string): string {
  return "https://cdn.discordapp.com/avatars/" + discord_id + "/" + avatar + ".png";
}

/**
 * Navbar component that displays the login button and a hide button.
 * Displays on every page.
 * 
 * @returns JSX element of the Navbar.
 */
const Navbar: Component = () => {
  const { username, set_username, avatar, discord_id } = useUser();
  const [avatar_url, set_avatar_url] = createSignal("-1");
  const [nav_hidden, set_nav_hidden] = createSignal(false);

  let MAX_USERNAME_LENGTH = 18;

  const set_user_details = () => {
    if (avatar() !== "-1" && discord_id() !== "-1") {
      set_avatar_url(build_avatar_string(discord_id(), avatar()));
    }

    if (username().length > MAX_USERNAME_LENGTH) {
      set_username(username().substring(0, MAX_USERNAME_LENGTH) + "...");
    }
  }

  onMount(async () => {
    await set_user_status();
  });

  createEffect(() => {
    set_user_details();
  })

  return (
    <Show when={username() !== ""} fallback={<LoginNavbar />} >
      {nav_hidden()
        ?
        <HideButton class={styles.show_button_container} hidden={true} set_nav_hidden={set_nav_hidden} />
        :
        <div class={styles.navbar}>
          <img src={avatar_url()} alt="Profile Picture" class={styles.profile_picture} />
          <span class={`${styles.body_text} ${styles.user_button}`}>{username()}</span>
          <a href="/logout" class={`${styles.body_text} ${styles.login_button}`}>Logout</a>
          <HideButton class={styles.hide_button_container} hidden={false} set_nav_hidden={set_nav_hidden} />
        </div>}
    </Show>
  )
}

const LoginNavbar: Component = () => {
  const [nav_hidden, set_nav_hidden] = createSignal(false);

  return (
    <>
      {nav_hidden()
        ?
        <HideButton class={styles.show_button_container} hidden={true} set_nav_hidden={set_nav_hidden} />
        :
        <div class={nav_hidden() ? styles.navbar_hidden : styles.navbar}>
          <a href="/login" class={`${styles.body_text} ${styles.login_button}`}>Login</a>
          <HideButton class={styles.hide_button_container} hidden={false} set_nav_hidden={set_nav_hidden} />
        </div>}
    </>
  )
}

interface HideButtonProps {
  class?: string;
  hidden: boolean;
  set_nav_hidden: (value: boolean) => void;
}

/**
 * A button that hides the navbar when clicked on. Appears when
 * hovering on the navbar.
 *
 * @returns JSX element of a hide button.
 */
const HideButton: Component<HideButtonProps> = ({ class: class_, hidden: nav_hidden, set_nav_hidden }) => {
  const [hidden, set_hidden] = createSignal(true);
  let hide_button: HTMLDivElement;

  onMount(() => {
    hide_button!.addEventListener('mouseover', () => {
      set_hidden(false);
    });
    hide_button!.addEventListener('mouseleave', () => {
      set_hidden(true);
    });
  })

  return (
    <div ref={hide_button!} class={class_!} onclick={() => set_nav_hidden(!nav_hidden)}>
      <div class={`${styles.alt_text} ${!hidden() ? styles.visible : ''}`}>{
        nav_hidden ? "Show Profile" : "Hide Profile"
      }</div>
      <div class={styles.hide_button} />
    </div>
  )
}

export default Navbar;