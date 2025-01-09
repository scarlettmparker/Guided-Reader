import { Component } from "solid-js";
import AnnotationModalHeaderProps from "./annotationmodalheaderprops";
import styles from "./annotationmodalheader.module.css";

/**
 * Component for displaying the header of an annotation modal.
 * This will display the title of the annotation modal and a close button.
 * If the annotation ID starts with the edit key (-10), the close button will display "<" instead of "X".
 * 
 * @param title Title of the annotation modal.
 * @param current_annotation_id Current annotation ID.
 * @param set_current_annotation_id Function to set the current annotation ID.
 * @param set_current_annotation_data Function to set the current annotation data.
 * @returns JSX Element for the annotation modal header.
 */
const AnnotationModalHeader: Component<AnnotationModalHeaderProps> = (props) => {
  // ... back depending on if the user is editing or creating an annotation ...
  const back = () => {
    if (props.current_annotation_id!) {
      props.set_current_annotation_id!(parseInt(props.current_annotation_id!().toString().slice(3)));
    } else if (props.set_current_annotation_id) {
      props.set_current_annotation_id!(-1);
    }
    if (props.set_current_annotation_data) {
      props.set_current_annotation_data!(null);
    }
  }

  return (
    <div class={`${styles.annotation_modal_header} ${props.style!}`}>
      <span class={`${styles.close} ${props.type == 0 && styles.close_media}`} onclick={back}>{
        props.current_annotation_id! && props.current_annotation_id!().toString().startsWith("-10") ? "<" : "X"
      }</span>
      <span class={`${styles.header_text} ${props.type == 0 && styles.header_text_media}`}>{props.title}</span>
    </div>
  )
}

export default AnnotationModalHeader;