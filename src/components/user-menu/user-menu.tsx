import { useTranslation } from "react-i18next";
import { usePageData } from "@sun/ssr/react";
import {
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Form,
} from "@sun/components";
import DiscordAvatar from "~/components/discord-avatar";
import ReaderRoleItem from "~/components/reader-role-item";
import { CsrfField } from "@sun/ssr/react";
import type { ReaderAccount } from "~/generated/graphql";
import styles from "./user-menu.module.css";

type LevelColours = Record<string, string>;

/**
 * Avatar menu for the current user.
 */
const UserMenu = () => {
  const { t } = useTranslation("nav");
  const { data: user } = usePageData<ReaderAccount | null>(
    "currentUser",
    "currentUser",
  );
  const { data: colours } = usePageData<LevelColours | null>(
    "levelColours",
    "levelColours",
  );
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu className={styles.menu}>
      <DropdownMenuTrigger asChild>
        <button className={styles.trigger} aria-label={t("account")}>
          <DiscordAvatar
            discordId={user.discordId}
            avatar={user.avatar}
            size={32}
            alt={user.globalName ?? user.discordUsername ?? ""}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={styles.content}>
        <Card className={styles.card}>
          <CardHeader className={styles.header}>
            <DiscordAvatar
              discordId={user.discordId}
              avatar={user.avatar}
              size={64}
              alt={user.globalName ?? user.discordUsername ?? ""}
              className={styles.header_avatar}
            />
            <div className={styles.header_text}>
              <CardTitle>{user.globalName ?? user.discordUsername}</CardTitle>
              {user.discordUsername && (
                <CardDescription>@{user.discordUsername}</CardDescription>
              )}
            </div>
          </CardHeader>
          <CardBody className={styles.body}>
            {user.roles?.length ? (
              <ul className={styles.roles}>
                {user.roles.map((role) => (
                  <ReaderRoleItem
                    key={role.key}
                    role={role}
                    colour={colours?.[role.key]}
                  />
                ))}
              </ul>
            ) : (
              <p className={styles.no_roles}>{t("no-roles")}</p>
            )}
          </CardBody>
          <CardFooter className={styles.footer}>
            <a href="/profile">
              <Button>{t("manage-profile")}</Button>
            </a>
            <Form action="/__logout" method="post">
              <CsrfField />
              <Button
                type="submit"
                variant="secondary"
                className={styles.logout}
              >
                {t("logout")}
              </Button>
            </Form>
          </CardFooter>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
