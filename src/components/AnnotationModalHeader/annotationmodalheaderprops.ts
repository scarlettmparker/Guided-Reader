import { Accessor } from "solid-js";
import { AnnotationData } from "~/utils/types";

interface AnnotationModalHeaderProps {
  style?: string,
  type: number,
  title: string,
  current_annotation_id?: Accessor<number>,
  set_current_annotation_id?: (id: number) => void
  set_current_annotation_data?: (data: AnnotationData | null) => void
}

export default AnnotationModalHeaderProps;