import { Component } from "solid-js";
import styles from './toolbar.module.css';

const Toolbar: Component<ToolbarProps> = (props) => {
  return (
    <div class={styles.toolbar}>
      hey
    </div>
  );
}

export default Toolbar;