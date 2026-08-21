import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CardFooter } from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import type { PagedAccounts } from "~/generated/graphql";

/**
 * Account count footer for the admin user list.
 */
const AdminUserListFooter = () => {
  const { t } = useTranslation("admin");
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const page = Number(searchParams.get("page") ?? "0");
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
