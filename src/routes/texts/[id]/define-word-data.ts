import { defineLoader } from "@sun/ssr";
import { executeDocument } from "~/utils/api";
import {
  DefineWordDocument,
  WordScope,
  type DefineWordQuery,
  type DefineWordQueryVariables,
} from "~/generated/graphql";

/**
 * Server-side loader for a word definition. Cached per word for 24h via the
 * backend caffeine cache on `WordReferenceService`.
 */
defineLoader({
  pattern: "defineWord/:word",
  async loader(params) {
    const word = (params.word as string) ?? "";
    const empty = {
      id: word,
      term: word,
      wordType: null,
      entries: [],
      compounds: [],
      relatedWords: [],
      sourceUrl: "",
    };
    if (!word.trim()) return { word: empty };
    try {
      const result = await executeDocument<
        DefineWordQuery,
        DefineWordQueryVariables
      >(DefineWordDocument, { word, scope: [WordScope.AllTranslations] });
      const entry = result.success
        ? (result.data?.hadesQueries.defineWord ?? null)
        : null;
      return { word: entry ?? empty };
    } catch (error) {
      console.error("Failed to fetch word:", error);
      return { word: empty };
    }
  },
});
