import { Component, createEffect, createSignal, onCleanup } from "solid-js";
import HeaderProps from "./headerprops";
import styles from "./header.module.css";

const Header: Component<HeaderProps> = (props) => {
  const [left_radius, set_left_radius] = createSignal(15);
  const [right_radius, set_right_radius] = createSignal(15);

  const RIGHT_COLLISION = 1550;
  const LEFT_COLLISION = 780;

  const handle_resize = () => {
    const width = window.innerWidth;
    if (props.left) {
      set_left_radius(width <= LEFT_COLLISION ? Math.max(0, 15 - (LEFT_COLLISION - width)) : 15);
      set_right_radius(width <= RIGHT_COLLISION ? Math.max(0, 15 - (RIGHT_COLLISION - width)) : 15);
    }
  };

  createEffect(() => {
    window.addEventListener('resize', handle_resize);
    handle_resize();

    onCleanup(() => {
      window.removeEventListener('resize', handle_resize);
    });
  })
  return (
    <div class={styles.header} style={{ "border-radius": `${left_radius()}px ${right_radius()}px 0px 0px` }}>
      {props.children}
    </div>
  )
};

export default Header;