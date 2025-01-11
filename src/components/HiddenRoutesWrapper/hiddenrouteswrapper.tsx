import { Component, createEffect, createSignal, Show } from "solid-js";
import HiddenRoutesWrapperProps from "./hiddenrouteswrapperprops";

/**
 * Wrapper component that hides the children if the current path is in the hidden routes list.
 * 
 * @param props Props of the HiddenRoutesWrapper component.
 * @returns JSX element of the children if the current path is not in the hidden routes list.
 */
const HiddenRoutesWrapper: Component<HiddenRoutesWrapperProps> = (props) => {
  const HIDDEN_ROUTES = ["/auth_discord", "/login", "/logout", "/register"];
  const [current_path, set_current_path] = createSignal(window.location.pathname);

  const handle_location_change = () => {
    set_current_path(window.location.pathname);
  }

  createEffect(() => {
    window.addEventListener('popstate', handle_location_change);
    const original_push_state = history.pushState;
    const original_replace_state = history.replaceState;

    // ... handle location change on push and replace state ...
    history.pushState = function (data: any, unused: string, url?: string | URL | null) {
      original_push_state.apply(history, [data, unused, url]);
      handle_location_change();
    }

    history.replaceState = function (data: any, unused: string, url?: string | URL | null) {
      original_replace_state.apply(history, [data, unused, url]);
      handle_location_change();
    }

    return () => {
      window.removeEventListener('popstate', handle_location_change);
      history.pushState = original_push_state;
      history.replaceState = original_replace_state;
    }
  })

  return (
    <Show when={!HIDDEN_ROUTES.includes(current_path())}>
      {props.children}
    </Show>
  )
}

export default HiddenRoutesWrapper;