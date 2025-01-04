import { Accessor } from "solid-js";
import { SelectedData } from "~/utils/types";

interface EditingAnnotationModalProps {
  current_annotation_id: Accessor<number>;
  set_current_annotation_id: (annotation_id: number) => void;
  new_selected_data: Accessor<SelectedData | null>;
}

export default EditingAnnotationModalProps;