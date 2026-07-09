/**
 * Registers all page data loaders.
 */

import { pageDataRegistry } from "@sun/ssr";
import {
  ListTextsQuery,
  ListSourcesQuery,
  LocateTextQuery,
  ListAnnotationsQuery,
  LocateAnnotationQuery,
  ListCommentsQuery,
  LocateThreadQuery,
  ListPostsQuery,
  PaginationInput,
} from "~/generated/graphql";
import {
  fetchTexts,
  fetchSources,
  fetchText,
  fetchAnnotations,
  fetchAnnotation,
  fetchComments,
  fetchThread,
  fetchPosts,
} from "~/utils/api";
import "~/utils/configure-framework";

const EMPTY_PAGE = {
  items: [],
  pageInfo: {
    page: 0,
    size: 0,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

/**
 * Library: paged texts (1-based URL page) plus the source list for the filter.
 */
async function getLibraryData(
  params?: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  const pagination: PaginationInput = { page: Number(params?.page ?? 1) - 1 };
  try {
    const textsResult = await fetchTexts(undefined, undefined, undefined, pagination);
    const sourcesResult = await fetchSources();
    const texts = textsResult?.success
      ? (textsResult.data as ListTextsQuery).hadesQueries.texts
      : EMPTY_PAGE;
    const sources = sourcesResult?.success
      ? (sourcesResult.data as ListSourcesQuery).hadesQueries.sources ?? []
      : [];
    return { texts: texts ?? EMPTY_PAGE, sources };
  } catch (error) {
    console.error("Failed to fetch library data:", error);
    return { texts: EMPTY_PAGE, sources: [] };
  }
}

/**
 * Reader: a single text plus its active annotations.
 */
async function getReaderData(
  id: string,
): Promise<Record<string, unknown> | null> {
  try {
    const textResult = await fetchText(id);
    const annotationsResult = await fetchAnnotations(id);
    const text = textResult?.success
      ? (textResult.data as LocateTextQuery).hadesQueries.text
      : null;
    const annotations = annotationsResult?.success
      ? (annotationsResult.data as ListAnnotationsQuery).hadesQueries.annotations ?? []
      : [];
    return { text, annotations };
  } catch (error) {
    console.error("Failed to fetch reader data:", error);
    return { text: null, annotations: [] };
  }
}

/**
 * Annotation detail: the annotation plus its comments.
 */
async function getAnnotationData(
  id: string,
): Promise<Record<string, unknown> | null> {
  try {
    const annotationResult = await fetchAnnotation(id);
    const commentsResult = await fetchComments(id, { page: 0, size: 100 });
    const annotation = annotationResult?.success
      ? (annotationResult.data as LocateAnnotationQuery).hadesQueries.annotation
      : null;
    const comments = commentsResult?.success
      ? (commentsResult.data as ListCommentsQuery).hadesQueries.comments
      : EMPTY_PAGE;
    return { annotation, comments: comments ?? EMPTY_PAGE };
  } catch (error) {
    console.error("Failed to fetch annotation data:", error);
    return { annotation: null, comments: EMPTY_PAGE };
  }
}

/**
 * Create-text: the source list for the source select.
 */
async function getSourcesData(): Promise<Record<string, unknown> | null> {
  try {
    const result = await fetchSources();
    const sources = result?.success
      ? (result.data as ListSourcesQuery).hadesQueries.sources ?? []
      : [];
    return { sources };
  } catch (error) {
    console.error("Failed to fetch sources:", error);
    return { sources: [] };
  }
}

/**
 * Thread: a single forum thread plus its posts.
 */
async function getThreadData(
  id: string,
): Promise<Record<string, unknown> | null> {
  try {
    const threadResult = await fetchThread(id);
    const postsResult = await fetchPosts(id, { page: 0, size: 100 });
    const thread = threadResult?.success
      ? (threadResult.data as LocateThreadQuery).icarusQueries.thread
      : null;
    const posts = postsResult?.success
      ? (postsResult.data as ListPostsQuery).icarusQueries.posts
      : EMPTY_PAGE;
    return { thread, posts: posts ?? EMPTY_PAGE };
  } catch (error) {
    console.error("Failed to fetch thread data:", error);
    return { thread: null, posts: EMPTY_PAGE };
  }
}

/**
 * Registers the page data loaders for every route pattern.
 */
export function registerLoaders(): void {
  pageDataRegistry.registerPageDataLoader("library", getLibraryData);
  pageDataRegistry.registerPageDataLoader("reader/:id", async (params) => {
    const id = params?.id as string;
    if (!id) return null;
    return getReaderData(id);
  });
  pageDataRegistry.registerPageDataLoader("annotation/:id", async (params) => {
    const id = params?.id as string;
    if (!id) return null;
    return getAnnotationData(id);
  });
  pageDataRegistry.registerPageDataLoader("text/create", getSourcesData);
  pageDataRegistry.registerPageDataLoader("thread/:id", async (params) => {
    const id = params?.id as string;
    if (!id) return null;
    return getThreadData(id);
  });
}

registerLoaders();
