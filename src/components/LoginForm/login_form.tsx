import { Component, createSignal, onMount } from "solid-js";
import { ENV } from "~/utils/const";
import ButtonWithAlt from "~/components/ButtonWithAlt";
import styles from "./login_form.module.css";

/**
 * Logs in the user with the given username and password.
 * 
 * @param username Username of the user.
 * @param password Password of the user.
 * @param set_error Function to set the error message.
 * @returns Redirects to the home page if the login is successful.
 */
async function login(username: string, password: string, set_error: (error: string) => void) {
  const response = await fetch(`http://${ENV.VITE_SERVER_HOST}:${ENV.VITE_SERVER_PORT}/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    credentials: 'include',
    body: JSON.stringify({
      username: username, password: password
    })
  });

  const data = await response.json();
  if (data.status == 'ok') {
    localStorage.setItem('logged_in', 'true');
    window.location.href = '/';
  } else {
    set_error(data.message);
  }
}

const LoginForm: Component = () => {
  const [username, set_username] = createSignal("");
  const [password, set_password] = createSignal("");
  const [show_password, set_show_password] = createSignal(true);
  const [error, set_error] = createSignal("");

  const EYE_SIZE = 32;
  const EYE_SOURCE = () => show_password() ? './assets/eye.png' : './assets/eye_closed.png';
  const ALT_TEXT = () => show_password() ? 'Show password' : 'Hide password';
  const ALT_ONCLICK = () => set_show_password(!show_password());

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
    <>
      <div class={styles.login_container}>
        <span class={styles.welcome_text}>Welcome back!</span>
        <span class={styles.body_text}>Enter your details below to login to your account.</span>
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
        <span class={`${styles.body_text} ${styles.no_account_text}`}>
          Don't have an account? <a class={styles.highlight_text}>Register</a>
        </span>
      </div>
    </>
  )
}

export default LoginForm;