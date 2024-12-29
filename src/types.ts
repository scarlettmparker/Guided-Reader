export type TextTitle = {
  id: number;
  title: string;
  level: string;
  group_id: number;
}

export type Text = {
  id: number;
  text: string;
  language: string;
  text_object_id: number;
}

export type Annotation = {
  id: number;
  start: number;
  end: number;
  text_id: number;
}