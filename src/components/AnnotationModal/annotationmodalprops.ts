import { Accessor } from "solid-js";
import { AnnotationData } from "~/utils/types";

interface AnnotationModalProps {
  set_current_annotation: (annotation: number) => void;
  annotation_data: Accessor<AnnotationData[]>;
  set_annotation_data: (data: AnnotationData[]) => void;
  update_response: Accessor<string>;
}

export default AnnotationModalProps;