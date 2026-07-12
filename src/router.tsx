import { RouteObject, useRoutes } from "react-router-dom";
import { lazy, Suspense } from "react";
import type { RouteMeta } from "@sun/ssr/server";

const Library = lazy(() => import("./routes/library"));
const TextsPage = lazy(() => import("./routes/texts"));
const TextDetailsPage = lazy(() => import("./routes/texts/[id]"));
const Login = lazy(() => import("./routes/login"));
const NotFound = lazy(() => import("./routes/not-found"));

/**
 * List of routes.
 */
export const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <Suspense fallback={null}>
        <Library />
      </Suspense>
    ),
  },
  {
    path: "texts",
    element: (
      <Suspense fallback={null}>
        <TextsPage />
      </Suspense>
    ),
    children: [
      {
        path: ":id",
        element: <TextDetailsPage />,
      },
    ],
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={null}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense fallback={null}>
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
};

export const Router = () => {
  return useRoutes(routes);
};
