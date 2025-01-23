import { Component, createSignal, onMount } from "solid-js";
import { login, register_user } from "~/utils/userutils";
import { ENV } from "~/utils/const";
import ButtonWithAlt from "~/components/ButtonWithAlt";
import styles from "./register_form.module.css";

/**
 * Register a new user, logging them in if successful. Has some validation in it for some reason.
 * 
 * @param username Username of the user.
 * @param email Email of the user.
 * @param password Password of the user.
 * @param set_error Function to set the error message.
 */
async function register(username: string, email: string, password: string, set_error: (error: string) => void) {
  if (!username || !password || !email) {
    set_error("Please fill in all fields");
    return;
  }

  const registered = await register_user(username, email, password, set_error);
  if (registered) {
    // ... should probably add some params here for onboarding ...
    login(username, password, set_error);
  }
}

/**
 * Helper function to validate an email input. Does not use regex as usually
 * that's far too restrictive of an approach and DOES NOT WORK.
 * 
 * @param email Email to validate.
 * @return true if the email is valid, false otherwise.
 */
function validate_email(email: string): boolean {
  if (!email) return false;

  if (email.length <= 2) return false;

  if (email.indexOf("@") === -1) return false;

  const parts = email.split("@");
  const dot = parts[1].indexOf(".");
  const dot_splits = parts[1].split(".");
  const dot_count = dot_splits.length - 1;

  if (dot == -1 || dot < 2 || dot_count > 2) {
    return false;
  }

  for (let i = 0; i < dot_splits.length; i++) {
    if (dot_splits[i].length == 0) {
      return false;
    }
  }

  return true;
}

const EYE_SIZE = 32;
const icon_path = "./assets/login/icons";

const LoginForm: Component = () => {
  const [username, set_username] = createSignal("");
  const [email, set_email] = createSignal("");
  const [password, set_password] = createSignal("");
  const [confirm_password, set_confirm_password] = createSignal("");
  const [error, set_error] = createSignal("");

  const DISCORD_REDIRECT = ENV.VITE_DISCORD_REDIRECT_URI;

  const handleKeyDown = async (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      await register_handler();
    }
  };

  // ... ensure the data inputted is correct (password & email val) ...
  const register_handler = async () => {
    if (password() !== confirm_password()) {
      set_error("Passwords do not match");
      return;
    } else if (password().length < 8) {
      set_error("Password too short");
      return;
    }

    if (!validate_email(email())) {
      set_error("Invalid email address");
      return;
    }

    await register(username(), email(), password(), set_error);
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    }
  });

  return (
    <div class={styles.login_container}>
      <span class={styles.welcome_text}>Welcome!</span>
      <span class={styles.body_text}>Register with your details below.</span>
      <div class={styles.login_form}>
        <input class={`${styles.input_text} ${styles.input_form}`} placeholder="Username"
          value={username()} oninput={(e) => set_username(e.target.value)} />
        <input class={`${styles.input_text} ${styles.input_form}`} placeholder="Email"
          value={email()} oninput={(e) => set_email(e.target.value)} />
      </div>
      <div class={styles.password_form_wrapper}>
        <PasswordInput placeholder={"Password"} password={password} set_password={set_password} />
        <PasswordInput placeholder={"Confirm Password"} password={confirm_password} set_password={set_confirm_password} />
      </div>
      <div class={styles.forgot_form}>
        <span class={`${styles.body_text} ${styles.error_text}`}>{error()}</span>
      </div>
      <button class={`${styles.form_button} ${styles.button_text}`} onclick={register_handler}>Register</button>
      <span class={`${styles.body_text} ${styles.discord_account_text}`}>
        <img src={`${icon_path}/discord.png`} class={styles.discord_icon}
          width={EYE_SIZE} height={EYE_SIZE} draggable={false} />
        <a class={styles.highlight_text} href={DISCORD_REDIRECT}>Register with Discord</a>
      </span>
      <span class={`${styles.body_text} ${styles.register_text}`}>
        or <a class={styles.highlight_text} href={"/login"}>Login to your account</a>
      </span>
    </div>
  )
}

interface PasswordInputProps {
  placeholder: string;
  password: () => string;
  set_password: (password: string) => void;
}

const PasswordInput: Component<PasswordInputProps> = (props) => {
  const [show_password, set_show_password] = createSignal(true);

  const ALT_TEXT = () => show_password() ? 'Show password' : 'Hide password';
  const EYE_SOURCE = () => show_password() ? `${icon_path}/eye.png` : `${icon_path}/eye_closed.png`;
  const ALT_ONCLICK = () => set_show_password(!show_password());

  return (
    <div class={styles.password_form}>
      {props.password() &&
        <ButtonWithAlt src={EYE_SOURCE} alt_text={ALT_TEXT} class={styles.show_password}
          button_class={styles.password_button} width={EYE_SIZE} height={EYE_SIZE} draggable={false} onclick={ALT_ONCLICK} />
      }
      <input class={`${styles.input_text} ${styles.input_form}`} placeholder={props.placeholder}
        type={show_password() ? "password" : "text"} value={props.password()} oninput={(e) => props.set_password(e.target.value)} />
    </div>
  )
}

export default LoginForm;