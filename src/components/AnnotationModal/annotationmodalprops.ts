import { Accessor } from "solid-js";
import { AnnotationData, SelectedData } from "~/utils/types";

interface AnnotationModalProps {
  set_current_annotation: (annotation: number) => void;
  annotation_data: Accessor<AnnotationData[]>;
  set_annotation_data: (data: AnnotationData[]) => void;
  update_response: Accessor<string>;
  set_update_response: (response: string) => void;
  set_new_selected_data: (data: SelectedData) => void;
}

export default AnnotationModalProps;