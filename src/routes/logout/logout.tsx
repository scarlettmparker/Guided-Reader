import { useNavigate } from "@solidjs/router";
import { Component, onMount } from "solid-js";
import { CACHE_KEY } from "~/const";
import { useUser } from "~/usercontext";
import { logout } from "~/utils/userutils";
import Index from "..";

const Logout: Component = () => {
  const { user_id, set_user_id, set_username, logged_in, set_logged_in } = useUser();
  const navigate = useNavigate();

  onMount(async () => {
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

    await logout(CACHE_KEY, user_id());
    
    set_logged_in(false);
    set_user_id(-1);
    set_username("");

    navigate("/");
  });

  return (
    <Index />
  )
}

export default Logout;