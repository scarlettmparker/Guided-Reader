import { Button } from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import DiscordAvatar from "~/components/discord-avatar";
import type { SearchReaderAccountsQuery } from "~/generated/graphql";
import styles from "./search-suggestions.module.css";

type SearchAccount =
  SearchReaderAccountsQuery["hadesQueries"]["searchReaderAccounts"][number];

type ShareTag = {
  /**
   * Account id or email string.
   */
  id: string;
  /**
   * Display label.
   */
  label: string;
  /**
   * Whether this is an email.
   */
  isEmail: boolean;
};

type SearchSuggestionsProps = {
  /**
   * Search query.
   */
  query: string;
  /**
   * Already selected tags.
   */
  tags: ShareTag[];
  /**
   * Called when a suggestion is picked.
   */
  onAdd: (account: SearchAccount) => void;
};

/**
 * Suggestion list for reader accounts.
 */
const SearchSuggestions = (props: SearchSuggestionsProps) => {
  const { query, tags, onAdd } = props;
  const trimmed = query.trim();
  const { data: accounts } = usePageData<
    SearchReaderAccountsQuery["hadesQueries"]["searchReaderAccounts"]
  >(
    "accounts",
    "searchReaderAccounts/:query",
    trimmed ? { query: trimmed } : { query: "" },
  );

  const suggestions = trimmed
    ? (accounts ?? [])
        .filter((a) => !tags.some((tag) => tag.id === a.gaiaAccountId))
        .slice(0, 10)
    : [];

  if (suggestions.length === 0) return null;

  return (
    <div className={styles.suggestions}>
      {suggestions.map((account) => (
        <Button
          key={account.gaiaAccountId}
          variant="secondary"
          className={styles.suggestion}
          title={account.globalName || account.discordUsername || ""}
          aria-label={account.globalName || account.discordUsername || ""}
          onClick={() => onAdd(account)}
        >
          <DiscordAvatar
            discordId={account.discordId}
            avatar={account.avatar}
            size={24}
          />
          <span className={styles.suggestion_label}>
            {account.globalName || account.discordUsername}
          </span>
        </Button>
      ))}
    </div>
  );
};

export default SearchSuggestions;
