import { Accessor } from "solid-js";
import { AnnotationData } from "~/utils/types";

interface EditingAnnotationModalProps {
  current_annotation_data: Accessor<AnnotationData | null>;
  set_current_annotation_data: (annotation: AnnotationData | null) => void;
}

export default EditingAnnotationModalProps;