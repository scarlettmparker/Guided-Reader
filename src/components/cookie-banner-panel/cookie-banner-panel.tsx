import { useTranslation } from "react-i18next";
import {
  Button,
  CookieBannerActions,
  CookieBannerContent,
  CookieBannerDescription,
  CookieBannerTitle,
  useCookieBanner,
} from "@sun/components";

/**
 * Cookie consent panel shown inside the banner.
 */
const CookieBannerPanel = () => {
  const { t } = useTranslation("cookies");
  const { accept, decline } = useCookieBanner();

  return (
    <>
      <CookieBannerContent>
        <CookieBannerTitle>{t("title")}</CookieBannerTitle>
        <CookieBannerDescription>{t("description")}</CookieBannerDescription>
      </CookieBannerContent>
      <CookieBannerActions>
        <Button type="button" variant="secondary" onClick={decline}>
          {t("decline")}
        </Button>
        <Button type="button" onClick={accept}>
          {t("accept")}
        </Button>
      </CookieBannerActions>
    </>
  );
};

export default CookieBannerPanel;
