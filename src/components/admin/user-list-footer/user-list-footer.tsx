import { useTranslation } from "react-i18next";
import { CardFooter } from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import type { PagedAccounts } from "~/generated/graphql";

type AdminUserListFooterProps = {
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
 * Account count footer for the admin user list.
 */
const AdminUserListFooter = ({ search, page }: AdminUserListFooterProps) => {
  const { t } = useTranslation("admin");
  const { data } = usePageData<PagedAccounts>("accounts", "accounts", {
    page: String(page),
    search: search || undefined,
  });
  const count = data?.items?.length ?? 0;

  if (!count) return null;

  return (
    <CardFooter>
      <span>{t("items-count", { count })}</span>
    </CardFooter>
  );
};

export default AdminUserListFooter;
