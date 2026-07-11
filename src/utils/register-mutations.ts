/**
 * Registers all mutation handlers.
 */

import {
  makeCacheKey,
  type MutationContext,
  MutationResult,
  mutationRegistry,
  ServerRedirectError,
} from "@sun/ssr";
import {
  mutateCreateAnnotation,
  mutateEditAnnotation,
  mutateDeleteAnnotation,
  mutateVote,
  mutateRemoveVote,
  mutateCreateThread,
  mutateIcarusVote,
} from "~/utils/api";
import { AUTH_COOKIE, getCookieValue } from "~/utils/auth";
import "~/utils/configure-framework";

/**
 * Extracts the caller's JWT from the request cookie header.
 */
function tokenFrom(context: MutationContext): string | undefined {
  return getCookieValue(context.cookie, AUTH_COOKIE);
}

/**
 * Registers the Hades and Icarus mutation handlers.
 */
export function registerMutations(): void {
  mutationRegistry.registerMutationHandler(
    "hades/createAnnotation",
    async (body, context) => {
      const input = body.input as { textId: string };
      const result = await mutateCreateAnnotation(
        body.input as Parameters<typeof mutateCreateAnnotation>[0],
        tokenFrom(context),
      );
      const data = result.data?.hadesMutations.createAnnotation as MutationResult;
      return {
        ...(data ?? {
          __typename: "StandardError",
          message: result.error || "Failed to create annotation.",
        }),
        invalidated: [
          makeCacheKey("texts/:id:annotations", { id: input.textId }),
        ],
      };
    },
  );

  mutationRegistry.registerMutationHandler(
    "hades/editAnnotation",
    async (body, context) => {
      const result = await mutateEditAnnotation(
        body.id as string,
        body.body as string,
        tokenFrom(context),
      );
      const data = result.data?.hadesMutations.editAnnotation as MutationResult;
      return {
        ...(data ?? {
          __typename: "StandardError",
          message: result.error || "Failed to edit annotation.",
        }),
      };
    },
  );

  mutationRegistry.registerMutationHandler(
    "hades/deleteAnnotation",
    async (body, context) => {
      const result = await mutateDeleteAnnotation(
        body.id as string,
        tokenFrom(context),
      );
      const data = result.data?.hadesMutations.deleteAnnotation as MutationResult;
      return {
        ...(data ?? {
          __typename: "StandardError",
          message: result.error || "Failed to delete annotation.",
        }),
      };
    },
  );

  mutationRegistry.registerMutationHandler(
    "hades/vote",
    async (body, context) => {
      const result = await mutateVote(
        body.input as Parameters<typeof mutateVote>[0],
        tokenFrom(context),
      );
      return (result.data?.hadesMutations.vote as MutationResult) ?? {
        __typename: "StandardError",
        message: result.error || "Failed to vote.",
      };
    },
  );

  mutationRegistry.registerMutationHandler(
    "hades/removeVote",
    async (body, context) => {
      const result = await mutateRemoveVote(
        body.targetType as Parameters<typeof mutateRemoveVote>[0],
        body.targetId as string,
        tokenFrom(context),
      );
      return (result.data?.hadesMutations.removeVote as MutationResult) ?? {
        __typename: "StandardError",
        message: result.error || "Failed to remove vote.",
      };
    },
  );

  mutationRegistry.registerMutationHandler(
    "icarus/createThread",
    async (body) => {
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
    },
  );

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
