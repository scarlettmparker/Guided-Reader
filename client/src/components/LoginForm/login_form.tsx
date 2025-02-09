import { Component, createSignal, onMount } from "solid-js";
import { login } from "~/utils/userutils";
import { ENV } from "~/utils/const";
import ButtonWithAlt from "~/components/ButtonWithAlt";
import styles from "./login_form.module.css";

const LoginForm: Component = () => {
  const [username, set_username] = createSignal("");
  const [password, set_password] = createSignal("");
  const [show_password, set_show_password] = createSignal(true);
  const [error, set_error] = createSignal("");

  const icon_path = "./assets/login/icons";

  const EYE_SIZE = 32;
  const EYE_SOURCE = () => show_password() ? `${icon_path}/eye.png` : `${icon_path}/eye_closed.png`;
  const ALT_TEXT = () => show_password() ? 'Show password' : 'Hide password';
  const ALT_ONCLICK = () => set_show_password(!show_password());
  const DISCORD_REDIRECT = ENV.VITE_DISCORD_REDIRECT_URI;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      login(username(), password(), set_error);
    }
  };

  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    }
  });

  return (
    <div class={styles.wrapper}>
      <div class={styles.login_container}>
        <span class={styles.welcome_text}>Welcome back!</span>
        <span class={styles.body_text}>Login with your details below.</span>
        <div class={styles.login_form}>
          <input class={`${styles.input_text} ${styles.input_form}`} placeholder="Username"
            value={username()} oninput={(e) => set_username(e.target.value)} />
          <div class={styles.password_form}>
            {password() &&
              <ButtonWithAlt src={EYE_SOURCE} alt_text={ALT_TEXT} class={styles.show_password}
                button_class={styles.password_button} width={EYE_SIZE} height={EYE_SIZE} draggable={false} onclick={ALT_ONCLICK} />
            }
            <input class={`${styles.input_text} ${styles.input_form}`} placeholder="Password" type={show_password() ? "password" : "text"}
              value={password()} oninput={(e) => set_password(e.target.value)} />
          </div>
        </div>
        <div class={styles.forgot_form}>
          <span class={`${styles.body_text} ${styles.error_text}`}>{error()}</span>
          <span class={`${styles.body_text} ${styles.forgot_text}`}>
            Forgot <a class={styles.highlight_text}>username</a> / <a class={styles.highlight_text}>password</a>
          </span>
        </div>
        <button class={`${styles.form_button} ${styles.button_text}`} onclick={() => login(username(), password(), set_error)}>Login</button>
        <span class={`${styles.body_text} ${styles.discord_account_text}`}>
          <img src={`${icon_path}/discord.png`} class={styles.discord_icon}
            width={EYE_SIZE} height={EYE_SIZE} draggable={false} />
          <a class={styles.highlight_text} href={DISCORD_REDIRECT}>Authenticate with Discord</a>
        </span>
        <span class={`${styles.body_text} ${styles.register_text}`}>
          or <a class={styles.highlight_text} href={"/register"}>Register an account</a>
        </span>
      </div>
    </div>
  )
}

export default LoginForm;