import { Component } from "solid-js";
import styles from './toolbar.module.css';

const Toolbar: Component<ToolbarProps> = (props) => {
  return (
    <div class={styles.toolbar}>
      <button class={styles.toolbar_button}>
        T
      </button>
    </div>
  );
}

export default Toolbar;