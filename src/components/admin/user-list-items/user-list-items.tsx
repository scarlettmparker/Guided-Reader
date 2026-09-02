import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import {
  EllipsisVerticalIcon,
  LockClosedIcon,
  LockOpenIcon,
} from "@heroicons/react/24/outline";
import type { PagedAccounts } from "~/generated/graphql";
import styles from "./user-list-items.module.css";

type AdminUserListItemsProps = {
  /**
   * Called when suspend is requested for an account.
   */
  onSuspend: (account: { id: string; username: string }) => void;
  /**
   * Called when unsuspend is requested for an account.
   */
  onUnsuspend: (account: { id: string; username: string }) => void;
};

/**
 * Renders the account list body.
 */
const AdminUserListItems = (props: AdminUserListItemsProps) => {
  const { onSuspend, onUnsuspend } = props;
  const { t } = useTranslation("admin");
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const page = Number(searchParams.get("page") ?? "0");
  const { data } = usePageData<PagedAccounts>("accounts", "accounts", {
    page: String(page),
    search: search || undefined,
  });
  const accounts = data;

  return (
    <div className={styles.list_body}>
      {!accounts?.items?.length ? (
        <p className={styles.no_items}>{t("no-items-found")}</p>
      ) : (
        accounts.items.map((account) => (
          <div key={account.id} className={styles.item_row}>
            <Link
              to={{
                pathname: `/admin/${account.id}`,
                search: searchParams.toString(),
              }}
              className={styles.item_link}
            >
              <Button variant="secondary" className={styles.list_button}>
                <p className={styles.list_name}>{account.username}</p>
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
                          onClick={() =>
                            onUnsuspend({
                              id: account.id,
                              username: account.username,
                            })
                          }
                        >
                          <LockOpenIcon width={16} height={16} />
                          {t("unsuspend-account")}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() =>
                            onSuspend({
                              id: account.id,
                              username: account.username,
                            })
                          }
                        >
                          <LockClosedIcon width={16} height={16} />
                          {t("suspend-account")}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </span>
              </Button>
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminUserListItems;
