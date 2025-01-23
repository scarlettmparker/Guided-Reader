import { Accessor, JSX } from "solid-js";
import { TextTitle } from "~/utils/types";

interface TextListProps<T extends TextTitle> {
  items: Accessor<T[]>;
  page: Accessor<number>;
  set_page: (page: number) => void;
  children: (item: T) => JSX.Element;
}

export default TextListProps;