export type TextTitle = {
  id: number;
  title: string;
  level: string;
  group_id: number;
}

export type Text = {
  annotations: Annotation[];
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

export type AnnotationData = {
  id: number;
  description: string;
  dislikes: number;
  likes: number;
  creation_date: number;
  user_id: number;
}