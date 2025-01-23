import { Accessor } from "solid-js";
import { Annotation, Text } from "~/utils/types";

interface TextDisplayProps {
  current_text: Accessor<number>;
  loading_texts: Accessor<Set<number>>;
  error: Accessor<string>;
  annotations_map: Accessor<Map<number, Annotation[]>>;
  set_annotations_map: (map: Map<number, Annotation[]>) => void;
  get_current_text: () => Text | undefined;
}

export default TextDisplayProps;