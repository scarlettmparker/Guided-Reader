import { RouteObject, useRoutes } from "react-router-dom";
import { lazy, Suspense } from "react";

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
        element: (
          <Suspense fallback={null}>
            <TextDetailsPage />
          </Suspense>
        ),
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

export const Router = () => {
  return useRoutes(routes);
};