import { Component, createSignal, onMount } from "solid-js";
import { marked } from 'marked';
import AnnotationItemProps from "./annotationitemprops";
import styles from "./annotationitem.module.css";
import { build_avatar_string } from "../Navbar/navbar";

/**
 * Calculate the time ago from a given timestamp.
 * 
 * @param timestamp Timestamp to calculate time ago from.
 * @returns String representing the time ago.
 */
function calculate_time_ago(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);

  if (seconds >= 31536000) {
    const years = Math.floor(seconds / 31536000);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  } else if (seconds >= 2592000) {
    const months = Math.floor(seconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else if (seconds >= 86400) {
    const days = Math.floor(seconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  return `${seconds} second${seconds > 1 ? 's' : ''} ago` || 'just now';
}
/**
 * Component for displaying an individual annotation item.
 * Annotation items include the annotation description, likes, dislikes, creation date, and username.
 * 
 * @param annotation Annotation data to display.
 * @returns JSX Element for the annotation item.
 */
const AnnotationItem: Component<AnnotationItemProps> = ({ annotation }) => {
  const [html_content, set_html_content] = createSignal("");

  onMount(async () => {
    const renderer = new marked.Renderer();
  
    // ... add target="_blank" to all links (opens in new tab) ...
    renderer.link = function ({ href, title, text }) {
      const target = '_blank';
      const rel = 'noopener noreferrer';
      return `<a href="${href}" title="${title || ''}" target="${target}" rel="${rel}">${text}</a>`;
    };
  
    marked.setOptions({
      breaks: true,
      renderer: renderer,
    });
  
    const html = await marked(annotation.description);
    set_html_content(html);
  });
  return (
    <div class={styles.annotation_item}>
      <div class={styles.annotation_item_header}>
        <AnnotationProfile username={annotation.author.username} discord_id={annotation.author.discord_id}
          avatar={annotation.author.avatar} />
        <span>{calculate_time_ago(annotation.created_at)}</span>
      </div>
      <div class={styles.annotation_item_description} innerHTML={html_content()}>
      </div>
      <div class={styles.annotation_item_footer}>
        <span>{annotation.likes}</span>
      </div>
    </div>
  )
}

interface AnnotationProfileProps {
  username: string;
  discord_id: string;
  avatar: string;
}

const AnnotationProfile: Component<AnnotationProfileProps> = (props) => {
  const avatar_url = build_avatar_string(props.discord_id, props.avatar);

  return (
    <div class={styles.annotation_profile}>
      <img src={avatar_url} class={styles.annotation_profile_avatar} alt="User avatar" />
      <span class={styles.annotation_profile_name}>{props.username}</span>
    </div>
  );
}

export default AnnotationItem;