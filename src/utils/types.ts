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

export type NewAnnotation = {
  text_id: number;
  user_id: number;
  start: number;
  end: number;
  description: string;
}

export type AnnotationData = {
  annotation: Annotation;
  description: string;
  dislikes: number;
  likes: number;
  created_at: number;
  author: Author;
}

export type Author = {
  user_id: number;
  username: string;
  discord_id: string;
  avatar: string;
}

export type SelectedText = {
  text_id: number;
  text?: string;
  start: number;
  end: number;
}

export type Position = {
  x: number;
  y: number;
}

export type SelectedData = {
  text: SelectedText,
  position?: Position
}