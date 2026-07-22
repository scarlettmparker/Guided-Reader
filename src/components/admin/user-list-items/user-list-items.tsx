import { useTranslation } from "react-i18next";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { executeMutation } from "@sun/ssr";
import type { PagedAccounts } from "~/generated/graphql";
import styles from "./user-list-items.module.css";

type AdminUserListItemsProps = {
  /**
   * Committed search query.
   */
  search: string;
  /**
   * Zero-based page index.
   */
  page: number;
  /**
   * Called when an account is clicked.
   */
  onSelect: (id: string) => void;
};

/**
 * Renders the account list body.
 */
const AdminUserListItems = ({ search, page, onSelect }: AdminUserListItemsProps) => {
  const { t } = useTranslation("admin");
  const { data } = usePageData<PagedAccounts>("accounts", "accounts", {
    page,
    search: search || undefined,
  });
  const accounts = data;

  return (
    <>
      <div className={styles.list_body}>
        {!accounts?.items?.length ? (
          <p className={styles.no_items}>{t("no-items-found")}</p>
        ) : (
          accounts.items.map((account) => (
            <Button
              key={account.id}
              variant="secondary"
              className={styles.list_button}
              onClick={() => onSelect(account.id)}
            >
              <span className={styles.list_name}>{account.username}</span>
              <span className={styles.list_actions}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <EllipsisVerticalIcon
                      width={16}
                      height={16}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {account.status === "SUSPENDED" ? (
                      <DropdownMenuItem
                        onClick={async () => {
                          await executeMutation("gaia/unsuspendAccount", { id: account.id });
                        }}
                      >
                        {t("unsuspend-account")}
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={async () => {
                          await executeMutation("gaia/suspendAccount", { id: account.id });
                        }}
                      >
                        {t("suspend-account")}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </span>
            </Button>
          ))
        )}
      </div>
    </>
  );
};

export default AdminUserListItems;
