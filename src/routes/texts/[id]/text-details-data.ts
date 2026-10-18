import { defineLoader, makeCacheKey, sharedCall, SHARED_TTL } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import {
  LocateTextDocument,
  type LocateTextQuery,
  type LocateTextQueryVariables,
} from "~/generated/graphql";

/**
 * Server-side loader for a single text by id.
 */
defineLoader({
  pattern: "texts/:id",
  async loader(params) {
    const id = params.id as string;
    if (!id) return null;
    const result = await sharedCall(
      makeCacheKey("texts/:id", { id }),
      SHARED_TTL.RECORD,
      async () => {
        const res = await executeDocument<
          LocateTextQuery,
          LocateTextQueryVariables
        >(LocateTextDocument, { id });
        if (!res.success) {
          throw new Error(res.error ?? "text unavailable");
        }
        return res;
      },
    ).catch((error) => {
      console.error("Failed to fetch text:", error);
      return null;
    });
    return { text: result?.data?.hadesQueries.text ?? null };
  },
});
