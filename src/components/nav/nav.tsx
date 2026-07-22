import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@sun/components";
import { RoleCheck } from "@sun/ssr/react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import UserMenu from "~/components/user-menu";
import styles from "./nav.module.css";

const NAV_ITEMS = [
  { labelKey: "home", href: "/" },
  { labelKey: "texts", href: "/texts" },
  { labelKey: "profile", href: "/profile" },
] as const;

/**
 * Pages with no logged-in user, where the profile menu is not rendered.
 */
const PUBLIC_PATHS = ["/login", "/register"];

/**
 * Top navigation: page links on the left, current user's avatar on the right.
 */
const Nav = () => {
  const { t } = useTranslation("nav");
  const { pathname } = useLocation();
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) {
    return null;
  }

  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link key={item.href} to={item.href} className={styles.link}>
            <Button
              variant={active ? "default" : "secondary"}
              className={styles.button}
            >
              {t(item.labelKey)}
            </Button>
          </Link>
        );
      })}
      <RoleCheck roles={["Admin"]}>
        <Link to="/admin" className={styles.link}>
          <Button variant="secondary" className={styles.admin_button} title={t("admin")}>
            <Cog6ToothIcon width={20} height={20} />
          </Button>
        </Link>
      </RoleCheck>
      <UserMenu />
    </nav>
  );
};

export default Nav;
