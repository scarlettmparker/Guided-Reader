/**
 * Generic API helper for making GraphQL requests.
 */

import { print, DocumentNode } from "graphql";
import {
  ListTextsDocument,
  LocateTextDocument,
  ListAnnotationsDocument,
  LocateAnnotationDocument,
  ListCommentsDocument,
  ListSourcesDocument,
  ReaderAccountDocument,
  MyVoteDocument,
  CreateTextDocument,
  CreateTextMutation,
  CreateSourceDocument,
  CreateSourceMutation,
  ArchiveTextDocument,
  ArchiveTextMutation,
  CreateAnnotationDocument,
  CreateAnnotationMutation,
  EditAnnotationDocument,
  EditAnnotationMutation,
  DeleteAnnotationDocument,
  DeleteAnnotationMutation,
  AddCommentDocument,
  AddCommentMutation,
  HadesVoteDocument,
  HadesVoteMutation,
  IcarusVoteDocument,
  IcarusVoteMutation,
  RemoveVoteDocument,
  RemoveVoteMutation,
  DiscordLoginDocument,
  DiscordLoginMutation,
  ReaderTextInput,
  AnnotationInput,
  CommentInput,
  VoteInput,
  ReaderVoteTarget,
  VoteValue,
  CefrLevel,
  ReaderTextType,
  PaginationInput,
  LocateThreadDocument,
  ListPostsDocument,
  ThreadsForDocument,
  CreateThreadDocument,
  CreateThreadMutation,
  CreatePostDocument,
  CreatePostMutation,
  CreateThreadInput,
  CreatePostInput,
  ForumVoteInput,
  PropertySetDocument,
} from "~/generated/graphql";
import { getToken } from "~/utils/auth";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
};

/**
 * Type definition for the operation registry.
 */
type OperationRegistry = {
  hadesQueries: {
    text: DocumentNode;
    sources: DocumentNode;
    texts: DocumentNode;
    annotations: DocumentNode;
    annotation: DocumentNode;
    comments: DocumentNode;
    readerAccount: DocumentNode;
    myVote: DocumentNode;
  };
  hadesMutations: {
    createSource: DocumentNode;
    createText: DocumentNode;
    archiveText: DocumentNode;
    createAnnotation: DocumentNode;
    editAnnotation: DocumentNode;
    deleteAnnotation: DocumentNode;
    addComment: DocumentNode;
    vote: DocumentNode;
    removeVote: DocumentNode;
    discordLogin: DocumentNode;
  };
  icarusQueries: {
    thread: DocumentNode;
    threadsFor: DocumentNode;
    posts: DocumentNode;
  };
  icarusMutations: {
    createThread: DocumentNode;
    createPost: DocumentNode;
    vote: DocumentNode;
  };
  gaiaQueries: {
    propertySet: DocumentNode;
  };
};

/**
 * Registry of GraphQL operations mapped to their query documents.
 */
const operationRegistry: OperationRegistry = {
  hadesQueries: {
    text: LocateTextDocument,
    sources: ListSourcesDocument,
    texts: ListTextsDocument,
    annotations: ListAnnotationsDocument,
    annotation: LocateAnnotationDocument,
    comments: ListCommentsDocument,
    readerAccount: ReaderAccountDocument,
    myVote: MyVoteDocument,
  },
  hadesMutations: {
    createSource: CreateSourceDocument,
    createText: CreateTextDocument,
    archiveText: ArchiveTextDocument,
    createAnnotation: CreateAnnotationDocument,
    editAnnotation: EditAnnotationDocument,
    deleteAnnotation: DeleteAnnotationDocument,
    addComment: AddCommentDocument,
    vote: HadesVoteDocument,
    removeVote: RemoveVoteDocument,
    discordLogin: DiscordLoginDocument,
  },
  icarusQueries: {
    thread: LocateThreadDocument,
    threadsFor: ThreadsForDocument,
    posts: ListPostsDocument,
  },
  icarusMutations: {
    createThread: CreateThreadDocument,
    createPost: CreatePostDocument,
    vote: IcarusVoteDocument,
  },
  gaiaQueries: {
    propertySet: PropertySetDocument,
  },
};

/**
 * Retrieves a GraphQL operation document by its dot-separated path.
 *
 * @param path the dot-separated path to the operation
 * @returns the DocumentNode if found, otherwise undefined
 */
function getOperation(path: string): DocumentNode | undefined {
  const parts = path.split(".");
  let current: unknown = operationRegistry;
  for (const part of parts) {
    if (current && typeof current === "object" && current !== null && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current as DocumentNode;
}

/**
 * Generic function to fetch data from GraphQL server. Attaches the stored JWT as
 * a bearer token when present (client-side only; SSR reads are public).
 *
 * @param operationName the dot-separated path to the operation
 * @param variables variables for the operation
 * @returns promise resolving to ApiResponse
 */
export async function fetchGraphQLData<
  T,
  V extends Record<string, unknown> | undefined = Record<string, unknown>,
>(operationName: string, variables?: V): Promise<ApiResponse<T>> {
  const endpoint = process.env.GRAPHQL_ENDPOINT || "http://localhost:8083/graphql";
  const query = getOperation(operationName);
  if (!query) {
    return { success: false, error: "Unknown operation", statusCode: 400 };
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query: print(query), variables }),
    });
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
      };
    }
    const result = await response.json();
    if (result.errors) {
      return {
        success: false,
        error: result.errors.map((e: { message: string }) => e.message).join(", "),
        statusCode: 400,
      };
    }
    if (!result.data) {
      return { success: false, error: "No data returned", statusCode: 400 };
    }
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      statusCode: 500,
    };
  }
}


/** Lists reader texts, optionally filtered. */
export async function fetchTexts(
  level?: CefrLevel,
  sourceId?: string,
  type?: ReaderTextType,
  pagination?: PaginationInput,
) {
  return fetchGraphQLData("hadesQueries.texts", {
    level: level ?? null,
    sourceId: sourceId ?? null,
    type: type ?? null,
    pagination: pagination ?? null,
  });
}

/** Lists all sources. */
export async function fetchSources() {
  return fetchGraphQLData("hadesQueries.sources");
}

/** Locates a text by id. */
export async function fetchText(id: string) {
  return fetchGraphQLData("hadesQueries.text", { id });
}

/** Lists annotations for a text. */
export async function fetchAnnotations(textId: string, includeHidden = false) {
  return fetchGraphQLData("hadesQueries.annotations", { textId, includeHidden });
}

/** Locates an annotation by id. */
export async function fetchAnnotation(id: string) {
  return fetchGraphQLData("hadesQueries.annotation", { id });
}

/** Lists comments for an annotation. */
export async function fetchComments(annotationId: string, pagination?: PaginationInput) {
  return fetchGraphQLData("hadesQueries.comments", {
    annotationId,
    includeHidden: false,
    pagination: pagination ?? null,
  });
}


/** Locates a thread by id. */
export async function fetchThread(id: string) {
  return fetchGraphQLData("icarusQueries.thread", { id });
}

/** Lists posts in a thread. */
export async function fetchPosts(threadId: string, pagination?: PaginationInput) {
  return fetchGraphQLData("icarusQueries.posts", {
    threadId,
    includeHidden: false,
    pagination: pagination ?? null,
  });
}


/** Creates a reader text. */
export async function mutateCreateText(input: ReaderTextInput) {
  return fetchGraphQLData<CreateTextMutation>("hadesMutations.createText", { input });
}

/** Creates a source. */
export async function mutateCreateSource(name: string, url: string) {
  return fetchGraphQLData<CreateSourceMutation>("hadesMutations.createSource", { name, url });
}

/** Archives a text. */
export async function mutateArchiveText(id: string) {
  return fetchGraphQLData<ArchiveTextMutation>("hadesMutations.archiveText", { id });
}

/** Creates an annotation on a range. */
export async function mutateCreateAnnotation(input: AnnotationInput) {
  return fetchGraphQLData<CreateAnnotationMutation>("hadesMutations.createAnnotation", { input });
}

/** Updates an annotation's body. */
export async function mutateEditAnnotation(id: string, body: string) {
  return fetchGraphQLData<EditAnnotationMutation>("hadesMutations.editAnnotation", { id, body });
}

/** Deletes an annotation. */
export async function mutateDeleteAnnotation(id: string) {
  return fetchGraphQLData<DeleteAnnotationMutation>("hadesMutations.deleteAnnotation", { id });
}

/** Adds a comment to an annotation. */
export async function mutateAddComment(input: CommentInput) {
  return fetchGraphQLData<AddCommentMutation>("hadesMutations.addComment", { input });
}

/** Casts a vote on an annotation or comment. */
export async function mutateVote(input: VoteInput) {
  return fetchGraphQLData<HadesVoteMutation>("hadesMutations.vote", { input });
}

/** Casts a vote on a forum post. */
export async function mutateIcarusVote(input: ForumVoteInput) {
  return fetchGraphQLData<IcarusVoteMutation>("icarusMutations.vote", { input });
}

/** Removes the caller's vote. */
export async function mutateRemoveVote(targetType: ReaderVoteTarget, targetId: string) {
  return fetchGraphQLData<RemoveVoteMutation>("hadesMutations.removeVote", {
    targetType,
    targetId,
  });
}

/** Exchanges a Discord authorization code for a JWT. */
export async function mutateDiscordLogin(code: string, state: string) {
  return fetchGraphQLData<DiscordLoginMutation>("hadesMutations.discordLogin", { code, state });
}


/** Creates a thread attached to a remote object. */
export async function mutateCreateThread(input: CreateThreadInput) {
  return fetchGraphQLData<CreateThreadMutation>("icarusMutations.createThread", { input });
}

/** Adds a post to a thread. */
export async function mutateCreatePost(input: CreatePostInput) {
  return fetchGraphQLData<CreatePostMutation>("icarusMutations.createPost", { input });
}

/** Fetches a property set entry's values, or every entry when entry is omitted. */
export async function fetchPropertySet(
  ownerKey: string,
  name: string,
  entry?: string,
) {
  return fetchGraphQLData("gaiaQueries.propertySet", {
    ownerKey,
    name,
    entry: entry ?? null,
  });
}

