import { configureApi } from "@sun/api";
import { configurePageData } from "@sun/ssr";
import { AUTH_COOKIE } from "~/utils/auth";

configurePageData({
  perPatternTtl: {},
});

configureApi({
  authCookie: AUTH_COOKIE,
});
