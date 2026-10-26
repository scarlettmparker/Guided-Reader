import type { Db } from "./db";

export type ReaderText = {
  /**
   * Text row id.
   */
  id: string;
  /**
   * Display title.
   */
  title: string;
  /**
   * Markdown body rendered by the reader.
   */
  content: string;
  /**
   * CEFR level.
   */
  level: string;
  /**
   * Content language code.
   */
  language: string;
};

export type SeedTextInput = {
  /**
   * Display title.
   */
  title: string;
  /**
   * Markdown body.
   */
  content: string;
  /**
   * CEFR level.
   */
  level?: string;
  /**
   * Content language code.
   */
  language?: string;
};

export type SeedAnnotationInput = {
  /**
   * Annotation body.
   */
  body: string;
  /**
   * Start offset in the text content.
   */
  startOffset: number;
  /**
   * End offset in the text content.
   */
  endOffset: number;
};

export type SeedCommentInput = {
  /**
   * Comment body.
   */
  body: string;
};

export type SeedPrivateNoteInput = {
  /**
   * Note body.
   */
  body: string;
  /**
   * Start offset in the text content.
   */
  startOffset: number;
  /**
   * End offset in the text content.
   */
  endOffset: number;
};

export const SAMPLE_TEXT: SeedTextInput = {
  title: "The Lighthouse",
  content:
    "The lighthouse stood at the edge of the cliff. Every evening the keeper lit the lamp and watched the sea.",
  level: "A2",
  language: "en",
};

/**
 * Inserts a text with its first version.
 *
 * @param db the database helper
 * @param input the text fields
 * @returns the inserted text
 */
export async function seedText(db: Db, input: SeedTextInput = SAMPLE_TEXT): Promise<ReaderText> {
  const id = crypto.randomUUID();
  const level = input.level ?? "A2";
  const language = input.language ?? "en";

  await db.query(
    `INSERT INTO hades_reader_texts
       (id, content, language, level, status, title)
     VALUES ($1, $2, $3, $4, 'ACTIVE', $5)`,
    [id, input.content, language, level, input.title],
  );

  return {
    id,
    title: input.title,
    content: input.content,
    level,
    language,
  };
}

/**
 * Inserts an annotation and its text position.
 *
 * @param db the database helper
 * @param textId the annotated text
 * @param accountId the annotation author
 * @param input the annotation fields
 * @returns the annotation id and position id
 */
export async function seedAnnotation(
  db: Db,
  textId: string,
  accountId: string,
  input: SeedAnnotationInput,
): Promise<{ annotationId: string; positionId: string }> {
  const annotationId = crypto.randomUUID();
  const positionId = crypto.randomUUID();

  await db.query(
    `INSERT INTO hades_reader_positions
       (id, text_id, start_offset, end_offset)
     VALUES ($1, $2, $3, $4)`,
    [positionId, textId, input.startOffset, input.endOffset],
  );
  await db.query(
    `INSERT INTO hades_reader_annotations
       (id, body, downvotes, position_id, status, upvotes, created_by)
     VALUES ($1, $2, 0, $3, 'ACTIVE', 0, $4)`,
    [annotationId, input.body, positionId, accountId],
  );

  return { annotationId, positionId };
}

/**
 * Inserts a reply on an annotation.
 *
 * @param db the database helper
 * @param annotationId the parent annotation
 * @param accountId the comment author
 * @param input the comment fields
 * @returns the comment id
 */
export async function seedComment(
  db: Db,
  annotationId: string,
  accountId: string,
  input: SeedCommentInput,
): Promise<string> {
  const id = crypto.randomUUID();

  await db.query(
    `INSERT INTO hades_reader_comments
       (id, annotation_id, body, downvotes, status, upvotes, created_by)
     VALUES ($1, $2, $3, 0, 'ACTIVE', 0, $4)`,
    [id, annotationId, input.body, accountId],
  );

  return id;
}

/**
 * Inserts a private note on a text range.
 *
 * @param db the database helper
 * @param textId the note's text
 * @param accountId the note owner
 * @param input the note fields
 * @returns the note id
 */
export async function seedPrivateNote(
  db: Db,
  textId: string,
  accountId: string,
  input: SeedPrivateNoteInput,
): Promise<string> {
  const id = crypto.randomUUID();

  await db.query(
    `INSERT INTO hades_private_notes
       (id, body, end_offset, owner_id, start_offset, text_id, visibility, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, 'PRIVATE', $4)`,
    [id, input.body, input.endOffset, accountId, input.startOffset, textId],
  );

  return id;
}
