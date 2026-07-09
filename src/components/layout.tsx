import { BreadcrumbProvider } from "@sun/components";

type LayoutProps = React.PropsWithChildren;

/**
 * App shell wrapping every page.
 */
const Layout = ({ children }: LayoutProps) => {
  return <BreadcrumbProvider>{children}</BreadcrumbProvider>;
};

export default Layout;
