import { RouteObject, useRoutes } from "react-router-dom";
import { lazy, Suspense } from "react";
import type { RouteMeta } from "@sun/ssr/server";
import AdminPageSkeleton from "./components/admin/admin-page-skeleton";
import LibrarySkeleton from "./components/library-skeleton";
import PageSkeleton from "./components/page-skeleton";
import TextsPageSkeleton from "./components/texts/skeletons/texts-page-skeleton";
import { TextDetailsPageSkeleton } from "./components/texts/skeletons";

const Library = lazy(() => import("./routes/library"));
const TextsPage = lazy(() => import("./routes/texts"));
const TextDetailsPage = lazy(() => import("./routes/texts/[id]"));
const Admin = lazy(() => import("./routes/admin"));
const AccountDetailPage = lazy(
  () => import("./routes/admin/account-detail-page"),
);
const PropertySetsPage = lazy(() => import("./routes/admin/property-sets"));
const PropertySetEntriesPage = lazy(
  () => import("./routes/admin/property-sets/property-set-entries-page"),
);
const Login = lazy(() => import("./routes/login"));
const Profile = lazy(() => import("./routes/profile"));
const Reactivate = lazy(() => import("./routes/reactivate"));
const NotFound = lazy(() => import("./routes/not-found"));

/**
 * List of routes.
 */
export const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <Suspense fallback={<LibrarySkeleton />}>
        <Library />
      </Suspense>
    ),
  },
  {
    path: "texts",
    element: (
      <Suspense fallback={<TextsPageSkeleton />}>
        <TextsPage />
      </Suspense>
    ),
    children: [
      {
        path: ":id",
        element: (
          <Suspense fallback={<TextDetailsPageSkeleton />}>
            <TextDetailsPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "admin",
    element: (
      <Suspense fallback={<AdminPageSkeleton />}>
        <Admin />
      </Suspense>
    ),
    children: [
      {
        path: ":id",
        element: <AccountDetailPage />,
      },
    ],
  },
  {
    path: "admin/property-sets",
    element: (
      <Suspense fallback={<AdminPageSkeleton />}>
        <PropertySetsPage />
      </Suspense>
    ),
    children: [
      {
        path: ":owner/:name",
        element: <PropertySetEntriesPage />,
      },
    ],
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<PageSkeleton />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/profile",
    element: (
      <Suspense fallback={<PageSkeleton />}>
        <Profile />
      </Suspense>
    ),
  },
  {
    path: "/reactivate",
    element: (
      <Suspense fallback={<PageSkeleton />}>
        <Reactivate />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<PageSkeleton />}>
        <NotFound />
      </Suspense>
    ),
  },
];

/**
 * Per-route SEO metadata, keyed by the composed route path.
 */
export const routeMeta: Record<string, RouteMeta> = {
  "/": {
    title: "Guided Reader | Library",
    description: "Read foreign-language texts with community annotations.",
  },
  texts: {
    title: "Texts | Guided Reader",
    description: "Browse reader texts by level.",
  },
  "texts/:id": {
    title: "Text | Guided Reader",
    description: "Read and annotate a text.",
  },
  profile: {
    title: "Profile | Guided Reader",
    description: "Manage your reader account.",
  },
  reactivate: {
    title: "Reactivate | Guided Reader",
    description: "Reactivate your reader account.",
  },
  "admin/property-sets": {
    title: "Property Sets | Guided Reader",
    description: "Manage Knowledge property sets.",
  },
  "admin/property-sets/:owner/:name": {
    title: "Property Set | Guided Reader",
    description: "View property set entries.",
  },
};

export const Router = () => {
  return useRoutes(routes);
};
