import { Accessor } from "solid-js";
import { AnnotationData } from "~/utils/types";

interface AnnotationModalProps {
  set_current_annotation: (annotation: number) => void;
  current_annotation_data: Accessor<AnnotationData[]>;
}

export default AnnotationModalProps;