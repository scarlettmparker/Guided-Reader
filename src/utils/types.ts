// ... text types ...
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
  audio: Audio;
  annotations: Annotation[];
}

export type TextBrief = {
  id: number;
  title: string;
  brief: string;
  level: string;
  languages: string[];
  audio_id: number;
  group: Group | null;
  author: Author | null;
}

type Group = {
  id: number;
  group_name: string;
  group_url: string;
}

export type Audio = {
  id: number;
  audio_file: string;
  vtt_file: string;
  submission_group: string;
  submission_url: string;
}

export type VTTEntry = {
  start: number;
  end: number;
  text: string;
}

// ... annotation types ...
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
  created_at: number;
  likes: number;
  dislikes: number;
  author: Author;
}

export type Author = {
  id: number;
  username: string;
  discord_id: string;
  discord_status?: boolean;
  avatar: string;
}

export type Interaction = {
  user_id: number;
  type: string;
}

// ... creating new annotations ...
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