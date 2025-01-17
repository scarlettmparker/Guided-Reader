import { Component, createEffect, createSignal, onMount } from "solid-js";
import { TextBrief } from "~/utils/types";
import { get_text_brief } from "~/utils/textutils";
import { build_avatar_string } from "../Navbar/navbar";
import { level_map } from "~/utils/levelconst/levelconst";

import styles from "./textinfo.module.css";
import TextInfoProps from "./textinfoprops";

/**
 * The TextInfo component displays a brief about a text. This will include the title,
 * level, group, author, brief, languages, and audio availability of the text.
 * Positioning is based on the current position of the text display wrapper, which
 * I know is a little but jank but it's literally CSS so who cares.
 * 
 * @param text_id The ID of the text to fetch/display information for.
 * @returns JSX Element for the text info.
 */
const TextInfo: Component<TextInfoProps> = (props) => {
  const [text_brief, set_text_brief] = createSignal<TextBrief | null>(null);
  const [display_spacing, set_display_spacing] = createSignal(0);
  const [display_width, set_display_width] = createSignal(0);

  const brief_text = () => text_brief()?.brief || "No brief provided.";
  const group_text = () => text_brief()?.group?.group_name || null;
  const author_text = () => text_brief()?.author?.username || null;
  const audio_id = () => text_brief()?.audio_id ? "Yes" : "No";

  // ... update the spacing for the text info ...
  const update_display_spacing = () => {
    const reader_div = document.getElementById("text_display_wrapper");

    if (reader_div) {
      const rect = reader_div.getBoundingClientRect();
      const distance_to_right = window.innerWidth - rect.right;
      const space = rect.right + (distance_to_right / 2);

      // ... adjust position for smaller screen widths ...
      if (space <= 1294) {
        const bottom_space = rect.bottom + window.scrollY;
        set_display_spacing(bottom_space + 32); // ... + 2rem ...
        set_display_width(rect.right);
        return;
      }

      set_display_spacing(space);
    }
  }
  
  const spaced = () => {
    const spacing = display_spacing();
    return spacing > 1294;
  };

  onMount(() => {
    window.addEventListener("resize", update_display_spacing);
    update_display_spacing();

    return () => {
      window.removeEventListener("resize", update_display_spacing);
    }
  });

  createEffect(async () => {
    set_text_brief(await get_text_brief(props.text_id(), "GR"));
  })

  return (
    <>
      {text_brief() ? (
        <div class={`${(spaced() ? styles.text_info_absolute : styles.text_info_relative)} ${styles.text_info}`}
          style={spaced() ? { "left": `${display_spacing()}px` } : {
            "top": `${display_spacing()}px`,
            "width": `${display_width() - 50}px`
            }}>
          <span class={`${styles.body_text} ${styles.header_text}`}>{text_brief()?.title}</span>
          <div class={styles.header}>
            <span class={`${styles.body_text}`} style={{ "color": level_map.get(text_brief()?.level!) }}>{text_brief()?.level}</span>
            {group_text() != "User submitted" &&
              <span class={styles.body_text}>
                <a href={text_brief()?.group?.group_url} target="_blank">{group_text()}</a>
              </span>
            }
            {author_text() &&
              <MiniUserProfile discord_id={text_brief()?.author?.discord_id!}
                username={author_text()!} avatar={text_brief()?.author?.avatar!} />
            }
          </div>
          <span class={`${styles.body_text} ${styles.brief_text}`}>{brief_text()}</span>
          <div class={styles.footer}>
            <span class={styles.body_text}>
              Languages: <span class={styles.heavy_text}>{text_brief()?.languages.join(", ")}</span>
            </span>
            <span class={`${styles.body_text}`}>
              Audio: {
                audio_id() == "Yes" ?
                  <a>{audio_id()}</a> :
                  <span class={styles.heavy_text}>{audio_id()}</span>
              }
            </span>
          </div>
        </div>
      ) : null}
    </>
  )
}

interface MiniUserProfileProps {
  discord_id: string;
  username: string;
  avatar: string;
}

const MiniUserProfile: Component<MiniUserProfileProps> = (props) => {
  return (
    <div class={styles.mini_user_profile}>
      <img src={build_avatar_string(props.discord_id, props.avatar)} alt="User Avatar" />
      <a><span class={styles.user_profile_text}>{props.username}</span></a>
    </div>
  )
}

export default TextInfo;