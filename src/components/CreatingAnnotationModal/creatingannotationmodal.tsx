import { Component, createEffect, createSignal } from "solid-js";
import { Annotation, Author } from "~/utils/types";
import { useUser } from "~/usercontext";
import { submit_new_annotation } from "~/utils/textutils";

import AnnotationModalProps from "./creatingannotationmodalprops";
import AnnotationItem from "../AnnotationItem";
import AnnotationModalHeader from "../AnnotationModalHeader";
import styles from "./creatingannotationmodal.module.css";

/**
 * Component for displaying an annotation modal. This modal will display the annotation data.
 * It will also allow the user to interact with the annotation, e.g. like or dislike or provide a correction.
 * This component specifically is for the creation of new annotations.
 * 
 * @param current_annotation_id Current annotation ID.
 * @param set_current_annotation_id Function to set the current annotation.
 * @param new_selected_data Accessor for the new selected data (where the user is looking to submit a new annotation).
 * @returns JSX Element for the annotation modal.
 */
const AnnotationModal: Component<AnnotationModalProps> = (props) => {
  const [response, set_response] = createSignal("");
  const [preview, set_preview] = createSignal(false);
  const [annotation_description, set_annotation_description] = createSignal("");
  const { user_id, username, discord_id, avatar } = useUser();

  // ... mock author object ...
  const author: Author = {
    id: user_id(),
    username: username(),
    discord_id: discord_id(),
    avatar: avatar()
  }

  // ... mock annotation object ...
  const annotation: Annotation = {
    id: 0,
    start: props.new_selected_data()!.text.start,
    end: props.new_selected_data()!.text.end,
    text_id: props.new_selected_data()!.text.text_id,
  }

  // ... mock annotation data object ...
  const annotation_data = {
    annotation: annotation,
    description: annotation_description(),
    dislikes: 0,
    likes: 0,
    created_at: Math.floor(Date.now() / 1000),
    author: author
  }

  const back = () => {
    if (props.current_annotation_id().toString().startsWith("-10")) {
      props.set_current_annotation_id(
        parseInt(props.current_annotation_id().toString().slice(3)
      ));
      /* TODO: Cache the annotation data to prevent an extra API call when returning to annotation modal */
    } else {
      props.set_current_annotation_id(-1);
    }
  }

  const create_annotation = async () => {
    // ... construct new annotation object ...
    set_response(await submit_new_annotation({
      text_id: props.new_selected_data()!.text.text_id,
      start: props.new_selected_data()!.text.start,
      end: props.new_selected_data()!.text.end,
      description: annotation_description(),
      user_id: user_id()
    }));

    if (response() == "Annotation created") {
      back();
    } else {
      // TODO: handle error
    }
  }

  createEffect(() => {
    const update_event = new CustomEvent("create-annotation", {
      bubbles: true,
      detail: { response: response() }
    });

    document.dispatchEvent(update_event);
  })

  return (
    <div class={styles.annotation_modal}>
      <AnnotationModalHeader title="Create Annotation" current_annotation_id={props.current_annotation_id}
        set_current_annotation_id={props.set_current_annotation_id} />
      {!preview() && <span class={styles.selected_text}>{props.new_selected_data()!.text.text}</span>}
      <div class={styles.annotation_modal_content}>
        {!preview() ?
          <textarea rows={12} class={styles.annotation_textarea}
            value={annotation_description()} oninput={(e) => set_annotation_description(e.target.value)} />
          :
          <div class={styles.annotation_preview}>
            <AnnotationItem annotation={{
              ...annotation_data,
              description: annotation_description().length > 0 ? annotation_description() : "Empty annotation"
            }} editing={true} />
          </div>
        }
      </div>
      <div class={styles.annotation_modal_footer}>
        <button class={`${styles.annotation_modal_button} ${styles.preview_button}`}
          onclick={() => set_preview(!preview())}>{!preview() ? "Preview" : "Edit"}</button>
        <button class={`${styles.annotation_modal_button} ${styles.cancel_button}`}
          onclick={back}>Cancel</button>
        <button class={styles.annotation_modal_button} onclick={
          async () => await create_annotation()
        }>Submit</button>
      </div>
    </div>
  )
}

export default AnnotationModal;