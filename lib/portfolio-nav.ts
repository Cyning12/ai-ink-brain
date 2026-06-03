/** Portfolio 演示站左侧目录导航项（与 SiteNav 解耦）。 */

export type PortfolioNavItem = {
  href: string;
  label: string;
};

export const PORTFOLIO_NAV: PortfolioNavItem[] = [
  { href: "/", label: "首页" },
  { href: "/resume", label: "简历" },
  { href: "/methodology", label: "方法论" },
  { href: "/unified-chat", label: "对话" },
];

export function isPortfolioNavActive(
  pathname: string | null,
  href: string,
): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || (pathname?.startsWith(`${href}/`) ?? false);
}
