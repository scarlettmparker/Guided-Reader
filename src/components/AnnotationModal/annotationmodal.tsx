import { Component, createEffect, createSignal } from "solid-js";
import { get_annotation_data } from "~/utils/textutils";
import { Annotation, AnnotationData } from "~/utils/types";
import { useUser } from "~/usercontext";

import AnnotationModalProps from "./annotationmodalprops";
import AnnotationItem from "../AnnotationItem";
import AnnotationModalHeader from "../AnnotationModalHeader";
import styles from "./annotationmodal.module.css";

/**
 * Component for displaying an annotation modal. This modal will display the annotation data.
 * It will also allow the user to interact with the annotation, e.g. like or dislike or provide a correction.
 * 
 * @param set_current_annotation Function to set the current annotation.
 * @param annotation_data Current annotation data.
 * @param set_annotation_data Function to set the annotation data.
 * @param update_response Response from the server.
 * @param set_update_response Function to set the response from the server.
 * @param set_new_selected_data Function to set the new selected data for creating new annotations.
 * @returns JSX Element for the annotation modal.
 */
const AnnotationModal: Component<AnnotationModalProps> = (props) => {
  const {user_id} = useUser();

  // ... filtered by discord verified accounts ...
  const [verified_annotations, set_verified_annotations] = createSignal<AnnotationData[]>([]);
  const [unverified_annotations, set_unverified_annotations] = createSignal<AnnotationData[]>([]);
  const [show_verified_annotations, set_show_verified_annotations] = createSignal(true);

  const [first_non_null_annotation, set_first_non_null_annotation] = createSignal<Annotation | null>(null);
  const [new_selected_data, set_new_selected_data] = createSignal({ text: { text_id: -1, start: -1, end: -1 } });
  const [updating, set_updating] = createSignal(false);

  const text_content_div = document.getElementById("text_content");

  // ... remove the response message after 5 seconds ...
  const clear_update_response = () => {
    set_updating(false);
    props.set_update_response("");
  }

  // ... set mock selected data for new annotations ...
  const set_new_annotation = () => {
    if (user_id() == -1) {
      window.location.href = "/login";
    } else {
      props.set_new_selected_data(new_selected_data());
      const annotation_id = first_non_null_annotation()?.id ?? 0;
      props.set_current_annotation(parseInt(`-10${annotation_id}`)); // -10 is the edit key

      /* TODO: Cache the annotation data to prevent an extra API call when returning to annotation modal */
    }
  }

  const delete_annotated_data = (updated_data: AnnotationData[], message: string) => {
    if (message.toLowerCase().startsWith("annotation deleted")) {
      props.set_annotation_data(updated_data);
    }
  }

  // ... filter the annotations by verified and unverified ...
  createEffect(() => {
    if (props.annotation_data().length == 0) return;
    const verified = props.annotation_data().filter(annotation => annotation.author.discord_status === true);
    const unverified = props.annotation_data().filter(annotation => annotation.author.discord_status === false);

    // ... set the verified and unverified annotations ...
    set_verified_annotations(verified);
    set_unverified_annotations(unverified);

    if (verified.length == 0) {
      set_show_verified_annotations(false);
    } else if (unverified.length == 0) {
      set_show_verified_annotations(true);
    }
  })

  createEffect(async () => {
    const annotation = first_non_null_annotation();
    if (!updating()) {
      const start = first_non_null_annotation()?.start ?? -1;
      const end = first_non_null_annotation()?.end ?? -1;

      // .. find the first non-null annotation and create mock selected data ...
      set_first_non_null_annotation(props.annotation_data().find(annotation => annotation !== null)?.annotation ?? null);
      set_new_selected_data({
        text: {
          text_id: first_non_null_annotation()?.text_id ?? -1,
          text: text_content_div?.textContent!.substring(start, end),
          start: start,
          end: end,
        }
      });
    } else if (annotation) {
      props.set_annotation_data(await get_annotation_data(
        annotation.text_id, annotation.start, annotation.end
      ));
    }
  });

  createEffect(async () => {
    if (props.update_response().length > 0) {
      set_updating(true);
      clearTimeout(window.update_response_timeout);

      // ... extract id from response message ...
      const id_match = props.update_response().match(/\[ID:\s+(\d+)\]/);
      const deleted_id = id_match ? parseInt(id_match[1]) : null;
      const current_data = props.annotation_data();
      const updated_data = current_data.filter(a => a.annotation.id !== deleted_id);

      if (deleted_id && updated_data.length !== current_data.length) {
        delete_annotated_data(updated_data, props.update_response());
      }

      window.update_response_timeout = setTimeout(clear_update_response, 5000);
    }
  })

  createEffect(() => {
    // ... if there are no more annotations, close the annotation modal ...
    if (props.annotation_data().length == 0 && props.update_response().length > 0) {
      props.set_current_annotation(-1);
      const event = new CustomEvent("delete-no-annotations",
        { bubbles: true }
      );

      clear_update_response();
      document.dispatchEvent(event);
    }
  })

  return (
    <div class={styles.annotation_modal}>
      <div class={styles.annotation_header}>
        <AnnotationModalHeader type={0} style={styles.annotation_modal_header} title="Annotations" set_current_annotation_id={props.set_current_annotation} />
        {verified_annotations().length > 0 && unverified_annotations().length > 0 &&
          <div class={styles.verified_header}>
            <button class={styles.verified_button} onclick={() => set_show_verified_annotations(!show_verified_annotations())}>
              {show_verified_annotations() ? "Verified" : "Unverified"}
            </button>
            <button class={styles.info_button}>?</button>
          </div>
        }
      </div>
      <div class={styles.annotation_modal_content}>
        {(show_verified_annotations() ? verified_annotations() : unverified_annotations())
          .sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes))
          .map(annotation => (
            <AnnotationItem annotation={annotation} editing={false} />
          ))
        }
      </div>
      <div class={styles.new_annotation}>
        <span class={styles.new_annotation_button} onclick={set_new_annotation}>
          Think you can provide a better annotation?
        </span>
      </div>
      {
        props.update_response().length > 0 &&
        <div class={styles.response} onclick={clear_update_response}>
          {props.update_response()}
        </div>
      }
    </div>
  )
}

export default AnnotationModal;