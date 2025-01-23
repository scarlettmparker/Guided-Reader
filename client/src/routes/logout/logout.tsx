import { useNavigate } from "@solidjs/router";
import { Component, onMount } from "solid-js";
import { CACHE_KEY } from "~/utils/const";
import { useUser } from "~/usercontext";
import { logout } from "~/utils/userutils";
import Index from "..";

const Logout: Component = () => {
  const { set_user_id, set_username, logged_in, set_logged_in } = useUser();
  const navigate = useNavigate();

  const handle_storage_change = () => {
    if (!logged_in()) {
      navigate("/");
    }
  };

  onMount(async () => {
    // ... allow logging out from other tabs ...
    window.addEventListener("storage", handle_storage_change);

    if (!logged_in()) {
      navigate("/");
    }
    if (localStorage.getItem('logged_in') === null || localStorage.getItem('logged_in') === 'false') {
      navigate("/");
    }
    if (localStorage.getItem(CACHE_KEY) === null) {
      navigate("/");
    } else {
      localStorage.removeItem(CACHE_KEY);
    }

    await logout(CACHE_KEY).then(() => {
      set_logged_in(false);
      set_user_id(-1);
      set_username("");

      // ... update the local storage for all tabs ...
      localStorage.setItem('logged_in', 'false');
      localStorage.removeItem(CACHE_KEY);

      navigate("/");
    });
  });

  return (
    <Index />
  );
};

export default Logout;
