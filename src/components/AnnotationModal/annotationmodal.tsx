import { Component, createEffect, createSignal, onMount } from "solid-js";
import { get_annotation_data } from "~/utils/textutils";
import { Annotation } from "~/utils/types";

import AnnotationModalProps from "./annotationmodalprops";
import AnnotationItem from "../AnnotationItem";
import styles from "./annotationmodal.module.css";

const SUCCESS_MESSAGES = ["Annotation updated", "Annotation deleted"];

/**
 * Component for displaying an annotation modal. This modal will display the annotation data.
 * It will also allow the user to interact with the annotation, e.g. like or dislike or provide a correction.
 * 
 * @param set_current_annotation Function to set the current annotation.
 * @param annotation_data Current annotation data.
 * @param set_annotation_data Function to set the annotation data.
 * @param update_response Response from the server.
 * @returns JSX Element for the annotation modal.
 */
const AnnotationModal: Component<AnnotationModalProps> = (props) => {
  const [first_annotation, set_first_annotation] = createSignal<Annotation | null>(null);
  const [show_response, set_show_response] = createSignal(false);

  onMount(() => {
    if (props.annotation_data().length > 0) {
      set_first_annotation(props.annotation_data()[0].annotation as Annotation || null);
    }
  })

  createEffect(async () => {
    const annotation = first_annotation();
    if (SUCCESS_MESSAGES  .includes(props.update_response()) && annotation != null) {
      /* re-load the annotation data */
      props.set_annotation_data(await get_annotation_data(
        annotation.text_id, annotation.start, annotation.end
      ));
      
      set_show_response(true);
      setTimeout(() => set_show_response(false), 5000); // after 5 seconds
    }
  })

  return (
    <div class={styles.annotation_modal}>
      <div class={styles.annotation_modal_header}>
        <span class={styles.close} onclick={() => props.set_current_annotation(-1)}>X</span>
        <span class={styles.header_text}>Annotations</span>
      </div>
      <div class={styles.annotation_modal_content}>
        {props.annotation_data()
          .sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes))
          .map(annotation => (
            <AnnotationItem annotation={annotation} editing={false} />
          ))}
      </div>
      {
        show_response() &&
        <div class={styles.response} onclick={() => set_show_response(false)}>
          {props.update_response()}
        </div>
      }
    </div>
  )
}

export default AnnotationModal;