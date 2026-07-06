"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { OpsLogoutButton } from "@/components/ops/ops-logout-button";
import { isOpsSessionsFeatureEnabled } from "@/lib/ops/sessions-feature";

type NavItem = { href: string; label: string; sessionsOnly?: boolean };

const NAV_ITEMS: NavItem[] = [
  { href: "/ops/kimi-code", label: "总览" },
  { href: "/ops/kimi-code/issues", label: "Issues" },
  { href: "/ops/kimi-code/pulls", label: "Pull Requests" },
  { href: "/ops/kimi-code/graph", label: "Graph" },
  { href: "/ops/kimi-code/metrics", label: "Metrics" },
  { href: "/ops/kimi-code/chat", label: "Chat" },
  { href: "/ops/kimi-code/sessions", label: "Sessions", sessionsOnly: true },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/ops/kimi-code") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClass(active: boolean): string {
  if (active) {
    return [
      "block rounded-lg border-l-[3px] border-[#2c2c2c] bg-[#2c2c2c]/[0.08] px-3 py-2",
      "text-sm font-semibold text-[#2c2c2c] shadow-sm",
    ].join(" ");
  }
  return [
    "block rounded-lg border-l-[3px] border-transparent px-3 py-2",
    "text-sm font-medium text-[color:var(--color-muted-foreground)]",
    "hover:bg-[color:var(--color-wash)] hover:text-[color:var(--color-foreground)]",
  ].join(" ");
}

type OpsKimiCodeSidebarProps = {
  roleLabel: string;
};

export function OpsKimiCodeSidebar({ roleLabel }: OpsKimiCodeSidebarProps) {
  const pathname = usePathname();
  const sessionsEnabled = isOpsSessionsFeatureEnabled();
  const navItems = NAV_ITEMS.filter((item) => !item.sessionsOnly || sessionsEnabled);

  return (
    <aside className="w-full border-b border-[color:var(--color-border)] bg-[color:var(--color-background)] px-6 py-6 md:w-56 md:border-b-0 md:border-r">
      <div className="mb-8">
        <Link
          href="/ops/kimi-code"
          className="font-serif text-lg font-semibold tracking-tight text-[color:var(--color-foreground)]"
        >
          Ops Desk
        </Link>
        <p className="mt-1 text-xs text-[color:var(--color-muted-foreground)]">
          MoonshotAI/kimi-code
        </p>
      </div>

      <nav className="space-y-0.5">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={navLinkClass(isActive(pathname, item.href))}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8 flex items-center justify-between border-t border-[color:var(--color-border)] pt-4">
        <span className="rounded-full bg-[color:var(--color-wash)] px-2 py-0.5 text-xs text-[color:var(--color-muted-foreground)]">
          {roleLabel}
        </span>
        <OpsLogoutButton />
      </div>
    </aside>
  );
}
