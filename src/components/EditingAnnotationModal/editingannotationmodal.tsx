import { Component, createEffect, createSignal } from "solid-js";
import { submit_annotation_edit } from "~/utils/textutils";

import AnnotationModalProps from "./editingannotationmodalprops";
import AnnotationItem from "../AnnotationItem";
import AnnotationModalHeader from "../AnnotationModalHeader";
import styles from "./editingannotationmodal.module.css";

/**
 * Component for displaying an annotation modal. This modal will display the annotation data.
 * It will also allow the user to interact with the annotation, e.g. like or dislike or provide a correction.
 * 
 * @param current_annotation_data Current annotation data.
 * @param set_current_annotation_data Function to set the current annotation.
 * @returns JSX Element for the annotation modal.
 */
const AnnotationModal: Component<AnnotationModalProps> = (props) => {
  const [response, set_response] = createSignal("");
  const [preview, set_preview] = createSignal(false);
  const [annotation_description, set_annotation_description] = createSignal(
    props.current_annotation_data()?.description ?? ""
  );

  // ... update the annotation and send the response ...
  const update_annotation = async () => {
    if (annotation_description() == props.current_annotation_data()!.description) {
      return;
    }

    set_response(await submit_annotation_edit({
      ...props.current_annotation_data()!,
      description: annotation_description()
    }));

    if (response() == "Annotation updated") {
      props.set_current_annotation_data(null);
    }
  }

  createEffect(() => {
    const update_event = new CustomEvent("update-annotation", {
      bubbles: true,
      detail: { response: response() }
    });

    document.dispatchEvent(update_event);
  })

  return (
    <div class={styles.annotation_modal}>
      <AnnotationModalHeader title="Edit Annotation" set_current_annotation_data={props.set_current_annotation_data} />
      <div class={styles.annotation_modal_content}>
        {!preview() ?
          <textarea rows={12} class={styles.annotation_textarea}
            value={annotation_description()} oninput={(e) => set_annotation_description(e.target.value)} />
          :
          <div class={styles.annotation_preview}>
            <AnnotationItem
              annotation={{
                ...props.current_annotation_data()!,
                description: annotation_description()
              }}
              editing={true}
            />
          </div>
        }
      </div>
      <div class={styles.annotation_modal_footer}>
        <button class={`${styles.annotation_modal_button} ${styles.preview_button}`}
          onclick={() => set_preview(!preview())}>{!preview() ? "Preview" : "Edit"}</button>
        <button class={`${styles.annotation_modal_button} ${styles.cancel_button}`}
          onclick={() => props.set_current_annotation_data(null)}>Cancel</button>
        <button class={styles.annotation_modal_button} onclick={
          async() => await update_annotation()
        }>Submit</button>
      </div>
    </div>
  )
}

export default AnnotationModal;