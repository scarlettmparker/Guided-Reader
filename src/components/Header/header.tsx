import { Component } from "solid-js";
import HeaderProps from "./headerprops";
import styles from "./header.module.css";

const Header: Component<HeaderProps> = (props) => {
  return (
    <div class={styles.header}>
      {props.children}
    </div>
  )
};

export default Header;