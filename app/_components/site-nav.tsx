"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenTool, Wind } from "lucide-react";
import SystemStatus from "@/components/SystemStatus";
import { useAdminSession } from "@/lib/hooks/useAdminSession";
import { isPortfolioMode } from "@/lib/site-mode";

type NavItem = {
  href: string;
  label: string;
};

const DEVELOPMENT_NAV: NavItem[] = [
  { href: "/blog", label: "Blog" },
  { href: "/learning", label: "Learning" },
  { href: "/projects", label: "Tasks" },
  { href: "/chat", label: "Chat" },
  { href: "/text2sql", label: "Text2SQL" },
  { href: "/chain-chat", label: "Chain" },
  { href: "/unified-chat", label: "Unified" },
  { href: "/about", label: "About" },
];

const ADMIN_GATED_HREFS = new Set([
  "/chat",
  "/text2sql",
  "/chain-chat",
  "/unified-chat",
]);

function isNavItemActive(pathname: string | null, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || (pathname?.startsWith(href + "/") ?? false);
}

export function SiteNav() {
  const pathname = usePathname();
  const { isAdmin } = useAdminSession();
  const portfolio = isPortfolioMode();

  const visibleNav = DEVELOPMENT_NAV.filter((item) => {
    if (ADMIN_GATED_HREFS.has(item.href)) {
      return isAdmin;
    }
    return true;
  });

  // Portfolio 模式由 PortfolioShell 左侧目录承担导航，不渲染顶栏
  if (portfolio) {
    return null;
  }

  const brandTitle = "AI-Ink-Brain";
  const subtitle = "RAG Blog";

  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--color-border)] bg-[color:var(--color-background)]/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight"
        >
          <span className="inline-flex items-center gap-2">
            <PenTool
              aria-hidden
              className="h-4 w-4 text-[color:var(--color-foreground)]/80"
              strokeWidth={1.25}
            />
            <span className="font-semibold">{brandTitle}</span>
          </span>
          <span className="hidden items-center gap-1 text-xs font-normal text-[color:var(--color-muted)] sm:inline-flex">
            <Wind aria-hidden className="h-3.5 w-3.5" strokeWidth={1.25} />
            {subtitle}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1">
            {visibleNav.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "rounded-full px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-[color:var(--color-wash)] text-[color:var(--color-foreground)]"
                      : "text-[color:var(--color-muted)] hover:text-[color:var(--color-foreground)] hover:bg-[color:var(--color-wash)]/70",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 顶部右侧：Vercel 环境 + ADMIN MODE（避免被右下角悬浮层遮挡） */}
          <div className="hidden items-center sm:flex">
            <SystemStatus variant="nav" />
          </div>
        </div>
      </div>
    </header>
  );
}
