import { Component, createEffect, createSignal } from "solid-js";
import { useUser } from "~/usercontext";
import { UserData } from "~/utils/types";
import { CACHE_KEY, MAX_RETRIES } from "~/utils/const";
import styles from './policyaccept.module.css';

/**
 * Send a POST request to the server to accept the policy.
 * 
 * @param user_id User ID of the user accepting the policy.
 * @return true if the policy was accepted, false otherwise.
 */
async function post_policy_accept(user_id: number): Promise<boolean> {
  const REQUEST_TIMEOUT = 5000;

  const fetch_options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: user_id }),
    credentials: 'include',
  };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout_id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
      const response = await fetch(
        `/api/policy`,
        {
          ...fetch_options,
          signal: controller.signal,
        }
      );
      if (response.status == 401) {
        console.error('Unauthorized');
        return false;
      }
      const data = await response.json();
      if (data.status === 'ok') {
        return true;
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      clearTimeout(timeout_id);
    }
  }
  return false;
}

const PolicyAccept: Component = () => {
  const [privacy_policy, set_privacy_policy] = createSignal(false);
  const [terms_of_service, set_terms_of_service] = createSignal(false);
  const { user_id, accepted_policy, set_accepted_policy } = useUser();

  const accept_policy = async () => {
    set_accepted_policy(true);

    const stored = localStorage.getItem(CACHE_KEY);
    const current = stored ? JSON.parse(stored) : {};
    const user_data: UserData = current.data || {};

    if (await post_policy_accept(user_id())) {
      // ... update the user data changing only the accepted_policy field ...
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: {
          ...user_data,
          accepted_policy: true
        },
        timestamp: Date.now()
      })
      );
    } else {
      // TODO: add actual error here
      window.location.reload();
    }
  };

  return (
    <>
      {(user_id() !== -1 && !accepted_policy()) && (
        <div class={styles.page_wrapper}>
          <div class={styles.policy_accept}>
            <div class={styles.header}>
              Important
            </div>
            <span class={styles.body_text}>
              Before continuing, please accept the <a href="/policy">Privacy Policy</a> and <a href="/tos">Terms of Service</a>.
            </span>
            <div class={styles.accept}>
              <label>
                <input type="checkbox" onchange={() => set_privacy_policy(!privacy_policy())}
                  checked={privacy_policy()} />
                <span class={styles.accept_text}>
                  I have read the Privacy Policy
                </span>
              </label>
              <label>
                <input type="checkbox" onchange={() => set_terms_of_service(!terms_of_service())}
                  checked={terms_of_service()} />
                <span class={styles.accept_text}>
                  I have read the Terms of Service
                </span>
              </label>
            </div>
            <button class={styles.accept_button} disabled={!privacy_policy() || !terms_of_service()}
              onclick={accept_policy}>
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PolicyAccept;