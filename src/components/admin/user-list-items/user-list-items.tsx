import { useState } from "react";
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
import { executeMutation, invalidatePageData } from "@sun/ssr";
import ConfirmSuspendAccountDialog from "~/components/admin/confirm-suspend-account-dialog";
import ConfirmUnsuspendAccountDialog from "~/components/admin/confirm-unsuspend-account-dialog";
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
};

/**
 * Renders the account list body.
 */
const AdminUserListItems = ({ search, page }: AdminUserListItemsProps) => {
  const { t } = useTranslation("admin");
  const [suspendId, setSuspendId] = useState<string | null>(null);
  const [unsuspendId, setUnsuspendId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const { data } = usePageData<PagedAccounts>("accounts", "accounts", {
    page: String(page),
    search: search || undefined,
  });
  const accounts = data;

  const suspendAccount = suspendId
    ? accounts?.items?.find((a) => a.id === suspendId)
    : null;
  const unsuspendAccount = unsuspendId
    ? accounts?.items?.find((a) => a.id === unsuspendId)
    : null;

  return (
    <>
      <div className={styles.list_body}>
        {!accounts?.items?.length ? (
          <p className={styles.no_items}>{t("no-items-found")}</p>
        ) : (
          accounts.items.map((account) => (
            <Link
              key={account.id}
              to={{
                pathname: `/admin/${account.id}`,
                search: searchParams.toString(),
              }}
              className={styles.item_link}
            >
              <Button variant="secondary" className={styles.list_button}>
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
                        <DropdownMenuItem onClick={() => setUnsuspendId(account.id)}>
                          <LockOpenIcon width={16} height={16} />
                          {t("unsuspend-account")}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => setSuspendId(account.id)}>
                          <LockClosedIcon width={16} height={16} />
                          {t("suspend-account")}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </span>
              </Button>
            </Link>
          ))
        )}
      </div>
      {suspendAccount && (
        <ConfirmSuspendAccountDialog
          open={!!suspendId}
          onClose={() => setSuspendId(null)}
          onConfirm={async () => {
            setSuspendId(null);
            await executeMutation("gaia/suspendAccount", { id: suspendAccount.id });
          }}
          username={suspendAccount.username}
        />
      )}
      {unsuspendAccount && (
        <ConfirmUnsuspendAccountDialog
          open={!!unsuspendId}
          onClose={() => setUnsuspendId(null)}
          onConfirm={async () => {
            setUnsuspendId(null);
            await executeMutation("gaia/unsuspendAccount", { id: unsuspendAccount.id });
          }}
          username={unsuspendAccount.username}
        />
      )}
    </>
  );
};

export default AdminUserListItems;
