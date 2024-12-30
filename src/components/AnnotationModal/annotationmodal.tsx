import { Component } from "solid-js";
import AnnotationModalProps from "./annotationmodalprops";
import AnnotationItem from "../AnnotationItem";
import styles from "./annotationmodal.module.css";

/**
 * Component for displaying an annotation modal. This modal will display the annotation data.
 * It will also allow the user to interact with the annotation, e.g. like or dislike or provide a correction.
 * 
 * @param set_current_annotation Function to set the current annotation.
 * @param current_annotation_data Current annotation data.
 * @returns JSX Element for the annotation modal.
 */
const AnnotationModal: Component<AnnotationModalProps> = (props) => {
  return (
    <div class={styles.annotation_modal}>
      <div class={styles.annotation_modal_header}>
        <span class={styles.close} onclick={() => props.set_current_annotation(-1)}>X</span>
        <span class={styles.header_text}>Annotations</span>
      </div>
      <div class={styles.annotation_modal_content}>
        {props.current_annotation_data().map(annotation => (
          <AnnotationItem annotation={annotation} />
        ))}
      </div>
    </div>
  )
}

export default AnnotationModal;