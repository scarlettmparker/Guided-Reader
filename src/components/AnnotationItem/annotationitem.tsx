import { Component, createEffect, createSignal, onMount } from "solid-js";
import { marked } from 'marked';
import { build_avatar_string } from "../Navbar/navbar";
import { AnnotationData, Interaction } from "~/utils/types";
import { delete_annotation } from "~/utils/textutils";
import AnnotationItemProps from "./annotationitemprops";
import styles from "./annotationitem.module.css";
import { get_interactions, post_interaction } from "~/utils/interactionutils";
import { useUser } from "~/usercontext";

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
const AnnotationItem: Component<AnnotationItemProps> = ({ annotation, editing }) => {
  const { user_id } = useUser();
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
          avatar={annotation.author.avatar} editing={editing} />
        <span>{calculate_time_ago(annotation.created_at)}</span>
      </div>
      <div class={styles.annotation_item_description} innerHTML={html_content()}>
      </div>
      {!editing &&
        <AnnotationFooter annotation={annotation} editing={editing} is_author={annotation.author.id == user_id()} />
      }
    </div>
  )
}

interface AnnotationProfileProps {
  username: string;
  discord_id: string;
  avatar: string;
  editing: boolean;
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

interface AnnotationFooterProps {
  annotation: AnnotationData;
  editing: boolean;
  is_author: boolean;
}

/**
 * Component for displaying the footer of an annotation item.
 * This includes the like and dislike buttons, as well as the edit and delete buttons for the author.
 * 
 * @param annotation Annotation data to display.
 * @param editing Boolean indicating if the annotation is being edited.
 * @param is_author Boolean indicating if the current user is the author of the annotation.
 * @returns JSX Element for the annotation footer.
 */
const AnnotationFooter: Component<AnnotationFooterProps> = (props) => {
  const { user_id } = useUser();

  const [response, set_response] = createSignal("");
  const [interaction_data, set_interaction_data] = createSignal<Interaction[] | null>(null);
  const [user_interaction, set_user_interaction] = createSignal<string>("");

  const [likes, set_likes] = createSignal(0);
  const [dislikes, set_dislikes] = createSignal(0);

  const icon_path = "./assets/annotation/icons";

  const like_path = () => user_interaction() == "LIKE" ? `${icon_path}/voted.png` : `${icon_path}/unvoted.png`;
  const dislike_path = () => user_interaction() == "DISLIKE" ? `${icon_path}/voted.png` : `${icon_path}/unvoted.png`;

  // ... open the editing annotation modal ...
  const set_editing_annotation = () => {
    const event = new CustomEvent("edit-annotation", {
      bubbles: true,
      detail: { annotation_data: props.annotation }
    });
    document.dispatchEvent(event);
  }

  // ... delete the annotation ...
  const set_delete_annotation = async () => {
    set_response(await delete_annotation(props.annotation));

    const event = new CustomEvent("delete-annotation", {
      bubbles: true,
      detail: { response: response() + ` [ID: ${props.annotation.annotation.id}]` }
    });

    document.dispatchEvent(event);
  }

  const update_interaction = async (type: "LIKE" | "DISLIKE", value: number) => {
    if (user_id() == -1) {
      window.location.href = "/login";
    } 

    if ((await post_interaction(user_id(), props.annotation.annotation.id, value)).success) {
      const current_interaction = user_interaction();

      // ... update the interaction data and user interaction state ...
      set_user_interaction(current_interaction === type ? "" : type);
      set_likes(likes() + (current_interaction === "LIKE" ? -1 : type === "LIKE" ? 1 : 0));
      set_dislikes(dislikes() + (current_interaction === "DISLIKE" ? -1 : type === "DISLIKE" ? 1 : 0));
    }
  };

  const like_annotation = () => update_interaction("LIKE", 1);
  const dislike_annotation = () => update_interaction("DISLIKE", -1);

  // ... get and set interaction data for the annotation ...
  onMount(async () => {
    set_interaction_data(await get_interactions(props.annotation.annotation.id));
    set_user_interaction(interaction_data()?.find(interaction => interaction.user_id === user_id())?.type || "");
    set_likes(interaction_data()?.filter(interaction => interaction.type === "LIKE").length || 0);
    set_dislikes(interaction_data()?.filter(interaction => interaction.type === "DISLIKE").length || 0);
  });

  return (
    <div class={styles.annotation_footer}>
      <img src={like_path()} alt="Like" onclick={like_annotation} class={styles.annotation_footer_icon} />
      <span class={styles.annotation_footer_votes}>{likes() - dislikes()}</span>
      <img src={dislike_path()} alt="Dislike" onclick={dislike_annotation}
        class={`${styles.annotation_footer_icon_dislike} ${styles.annotation_footer_icon}`} />
      {props.is_author &&
        <>
          <span class={styles.annotation_footer_edit}>
            <a onclick={set_editing_annotation}>Edit</a>
          </span>
          <span class={styles.annotation_footer_delete}>
            <a onclick={set_delete_annotation}>Delete</a>
          </span>
        </>
      }
    </div>
  )
};

export default AnnotationItem;