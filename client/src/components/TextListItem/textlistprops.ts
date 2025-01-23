import { TextTitle } from "~/utils/types";

interface TextListItemProps {
  text: TextTitle;
  class?: () => string;
  onclick?: () => void;
  onmouseenter?: () => void;
}

export default TextListItemProps;