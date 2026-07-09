import { RouteObject, useRoutes } from "react-router-dom";
import { lazy, Suspense } from "react";

const Library = lazy(() => import("./routes/library"));
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
    path: "*",
    element: (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    ),
  },
];

export const Router = () => {
  return useRoutes(routes);
};