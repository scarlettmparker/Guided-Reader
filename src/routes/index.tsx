import { Title } from '@solidjs/meta';
import { createSignal, JSX, onMount, type Component } from 'solid-js';

import styles from './index.module.css';
import { useUser } from '~/usercontext';
import { ENV } from '~/const';

type Text = {
  id: number;
  title: string;
  level: string;
}

const dummy_data: Text[] = [
  {
    id: 0,
    title: "Test Text 1",
    level: "Α1"
  },
  {
    id: 1,
    title: "Test Text 2",
    level: "Α1"
  },
  {
    id: 2,
    title: "Test Text 3",
    level: "Α2"
  },
  {
    id: 3,
    title: "Test Text 4",
    level: "Α2"
  },
  {
    id: 4,
    title: "Test Text 5",
    level: "Β1"
  },
  {
    id: 5,
    title: "Test Text 6",
    level: "Β1"
  },
  {
    id: 6,
    title: "Test Text 7",
    level: "Β2"
  },
  {
    id: 7,
    title: "Test Text 8",
    level: "Β2"
  },
  {
    id: 8,
    title: "Test Text 9",
    level: "C1"
  },
  {
    id: 9,
    title: "Test Text 10",
    level: "C1"
  },
  {
    id: 10,
    title: "Test Text 11",
    level: "C2"
  },
  {
    id: 11,
    title: "Test Text 12",
    level: "C2"
  },
];

const Index: Component = () => {
  return (
    <>
      <Title>Guided Reader</Title>
      <Reader />
    </>
  );
};

/**
 * Main component for the Guided Reader.
 * Contains the text list and the text display.
 * 
 * @returns JSX Element for the Guided Reader.
 */
const Reader: Component = () => {
  const [current_text, set_current_text] = createSignal(-1);

  return (
    <div class={styles.reader}>
      <div class={styles.text_list_wrapper}>
        <Header>
          <span class={styles.text_list_settings}>S</span>
          <span class={styles.header_text}>Texts (κείμενα)</span>
        </Header>
        <TextList items={dummy_data}>
          {
            (text) => <TextListItem text={text} class={() => current_text() == text.id
              ? styles.text_list_item_selected : styles.text_list_item} onclick={() => set_current_text(text.id)} />
          }
        </TextList>
      </div>
      <div class={styles.text_display_wrapper}>
        <Header>
        </Header>
        <div class={styles.text_display}>

        </div>
      </div>
    </div>
  );
};

interface TextListProps<T extends Text> {
  items: T[];
  children: (item: T) => JSX.Element;
}

/**
 * Component for displaying a list of texts.
 * 
 * @param items List of texts to display.
 * @param children Individual text item component.
 * @returns JSX Element for the text list.
 */
const TextList: Component<TextListProps<Text>> = ({ items, children }) => {
  return (
    <div class={styles.text_list}>
      {items.map((text) => children(text))}
    </div>
  );
};

interface TextListItemProps {
  text: Text;
  class?: () => string;
  onclick?: () => void;
}

/**
 * Component for displaying an individual text item.
 * 
 * @param text Text to display.
 * @param class Class to apply to the text item.
 * @param onclick Function to call when the text item is clicked.
 * @returns JSX Element for the text item.
 */
const TextListItem: Component<TextListItemProps> = (props) => {
  return (
    <div class={props.class!()} onclick={props.onclick}>
      <span class={styles.text_list_item_title}>{props.text.title}</span>
    </div>
  );
}

const Header: Component<{ children?: JSX.Element }> = (props) => {
  return (
    <div class={styles.header}>
      {props.children}
    </div>
  )
};

export default Index;