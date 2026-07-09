/**
 * Registers all mutation handlers.
 */

import {
  makeCacheKey,
  MutationResult,
  mutationRegistry,
  ServerRedirectError,
} from "@sun/ssr";
import {
  mutateCreateText,
  mutateCreateSource,
  mutateCreateAnnotation,
  mutateEditAnnotation,
  mutateDeleteAnnotation,
  mutateAddComment,
  mutateVote,
  mutateRemoveVote,
  mutateCreateThread,
  mutateCreatePost,
  mutateIcarusVote,
} from "~/utils/api";
import "~/utils/configure-framework";

/**
 * Registers the Hades and Icarus mutation handlers.
 */
export function registerMutations(): void {
  mutationRegistry.registerMutationHandler("hades/createText", async (body) => {
    const result = await mutateCreateText(body.input as Parameters<typeof mutateCreateText>[0]);
    const data = result.data?.hadesMutations.createText as MutationResult;
    if (data?.__typename === "QuerySuccess" && data.id) {
      throw new ServerRedirectError(`/reader/${data.id}`, [
        makeCacheKey("library:texts", { page: "*" }),
      ]);
    }
    return {
      __typename: "StandardError",
      message: result.error || "Failed to create text.",
    };
  });

  mutationRegistry.registerMutationHandler("hades/createSource", async (body) => {
    const result = await mutateCreateSource(
      body.name as string,
      body.url as string,
    );
    const data = result.data?.hadesMutations.createSource as MutationResult;
    return {
      ...(data ?? {
        __typename: "StandardError",
        message: result.error || "Failed to create source.",
      }),
      invalidated: [makeCacheKey("text/create:sources", {})],
    };
  });

  mutationRegistry.registerMutationHandler("hades/createAnnotation", async (body) => {
    const input = body.input as { textId: string };
    const result = await mutateCreateAnnotation(
      body.input as Parameters<typeof mutateCreateAnnotation>[0],
    );
    const data = result.data?.hadesMutations.createAnnotation as MutationResult;
    return {
      ...(data ?? {
        __typename: "StandardError",
        message: result.error || "Failed to create annotation.",
      }),
      invalidated: [makeCacheKey("reader/:id:annotations", { id: input.textId })],
    };
  });

  mutationRegistry.registerMutationHandler("hades/editAnnotation", async (body) => {
    const result = await mutateEditAnnotation(body.id as string, body.body as string);
    const data = result.data?.hadesMutations.editAnnotation as MutationResult;
    return {
      ...(data ?? {
        __typename: "StandardError",
        message: result.error || "Failed to edit annotation.",
      }),
    };
  });

  mutationRegistry.registerMutationHandler("hades/deleteAnnotation", async (body) => {
    const result = await mutateDeleteAnnotation(body.id as string);
    const data = result.data?.hadesMutations.deleteAnnotation as MutationResult;
    return {
      ...(data ?? {
        __typename: "StandardError",
        message: result.error || "Failed to delete annotation.",
      }),
    };
  });

  mutationRegistry.registerMutationHandler("hades/addComment", async (body) => {
    const input = body.input as { annotationId: string };
    const result = await mutateAddComment(
      body.input as Parameters<typeof mutateAddComment>[0],
    );
    const data = result.data?.hadesMutations.addComment as MutationResult;
    return {
      ...(data ?? {
        __typename: "StandardError",
        message: result.error || "Failed to add comment.",
      }),
      invalidated: [makeCacheKey("annotation/:id:comments", { id: input.annotationId })],
    };
  });

  mutationRegistry.registerMutationHandler("hades/vote", async (body) => {
    const result = await mutateVote(body.input as Parameters<typeof mutateVote>[0]);
    return (result.data?.hadesMutations.vote as MutationResult) ?? {
      __typename: "StandardError",
      message: result.error || "Failed to vote.",
    };
  });

  mutationRegistry.registerMutationHandler("hades/removeVote", async (body) => {
    const result = await mutateRemoveVote(
      body.targetType as Parameters<typeof mutateRemoveVote>[0],
      body.targetId as string,
    );
    return (result.data?.hadesMutations.removeVote as MutationResult) ?? {
      __typename: "StandardError",
      message: result.error || "Failed to remove vote.",
    };
  });

  mutationRegistry.registerMutationHandler("icarus/createThread", async (body) => {
    const result = await mutateCreateThread(
      body.input as Parameters<typeof mutateCreateThread>[0],
    );
    const data = result.data?.icarusMutations.createThread as MutationResult;
    if (data?.__typename === "QuerySuccess" && data.id) {
      throw new ServerRedirectError(`/thread/${data.id}`, []);
    }
    return {
      __typename: "StandardError",
      message: result.error || "Failed to create thread.",
    };
  });

  mutationRegistry.registerMutationHandler("icarus/createPost", async (body) => {
    const input = body.input as { threadId: string };
    const result = await mutateCreatePost(
      body.input as Parameters<typeof mutateCreatePost>[0],
    );
    const data = result.data?.icarusMutations.createPost as MutationResult;
    return {
      ...(data ?? {
        __typename: "StandardError",
        message: result.error || "Failed to create post.",
      }),
      invalidated: [makeCacheKey("thread/:id:posts", { id: input.threadId })],
    };
  });

  mutationRegistry.registerMutationHandler("icarus/vote", async (body) => {
    const result = await mutateIcarusVote(
      body.input as Parameters<typeof mutateIcarusVote>[0],
    );
    return (result.data?.icarusMutations.vote as MutationResult) ?? {
      __typename: "StandardError",
      message: result.error || "Failed to vote.",
    };
  });
}

registerMutations();
