import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@sun/components";
import { usePageData } from "@sun/ssr/react";
import DiscordAvatar from "~/components/discord-avatar";
import ReaderRoleItem from "~/components/reader-role-item";
import ConfirmDeactivateAccountDialog from "~/components/profile/confirm-deactivate-dialog";
import { deactivateAccount } from "~/server/actions/profile";
import type { ReaderAccount } from "~/generated/graphql";
import styles from "./profile.module.css";

type LevelColours = Record<string, string>;

/**
 * Profile settings page for the calling member.
 */
const Profile = () => {
  const { t } = useTranslation("profile");
  const { data: user } = usePageData<ReaderAccount | null>(
    "currentUser",
    "currentUser",
  );
  const { data: colours } = usePageData<LevelColours | null>(
    "levelColours",
    "levelColours",
  );
  const [confirming, setConfirming] = useState(false);

  if (!user) {
    return null;
  }

  const handleDeactivate = async () => {
    const result = await deactivateAccount();
    if (result.__typename === "QuerySuccess") {
      window.location.assign("/login?deactivated=1");
    }
  };

  return (
    <div className={styles.wrapper}>
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
        <CardBody>
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
      </Card>
      <Card className={styles.danger_card}>
        <CardHeader>
          <CardTitle>{t("danger-zone-title")}</CardTitle>
        </CardHeader>
        <CardBody>
          <p>{t("danger-zone-body")}</p>
        </CardBody>
        <CardFooter className={styles.danger_footer}>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setConfirming(true)}
          >
            {t("deactivate-account")}
          </Button>
        </CardFooter>
      </Card>
      <ConfirmDeactivateAccountDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={handleDeactivate}
        username={user.globalName ?? user.discordUsername ?? ""}
      />
    </div>
  );
};

export default Profile;
