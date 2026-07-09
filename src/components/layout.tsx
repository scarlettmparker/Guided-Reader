import { useEffect, useLayoutEffect, useState } from "react";
import { BreadcrumbProvider } from "@sun/components";
import styles from "./layout.module.css";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type LayoutProps = React.PropsWithChildren;

const PRIMARY_BACKGROUND = "color-mix(in srgb, var(--primary) 15%, transparent)";
const TERTIARY_BACKGROUND = "color-mix(in srgb, var(--tertiary) 15%, transparent)";

/**
 * App shell wrapping every page with an animated background that crossfades
 * between the themed primary and tertiary colours.
 */
const Layout = ({ children }: LayoutProps) => {
  const [useTertiary, setUseTertiary] = useState(false);
  // The 5s background transition is disabled until after the initial colour is
  // applied, otherwise the first (instant) set fades in over 5s.
  const [transitionEnabled, setTransitionEnabled] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const raf = requestAnimationFrame(() => setTransitionEnabled(true));
    const interval = setInterval(() => setUseTertiary((v) => !v), 5000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
    };
  }, []);

  return (
    <main
      className={styles.main}
      style={{
        backgroundColor: useTertiary ? TERTIARY_BACKGROUND : PRIMARY_BACKGROUND,
        transitionDuration: transitionEnabled ? undefined : "0s",
      }}
    >
      <BreadcrumbProvider>{children}</BreadcrumbProvider>
    </main>
  );
};

export default Layout;
