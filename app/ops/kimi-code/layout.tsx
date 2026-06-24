import { headers } from "next/headers";
import Link from "next/link";

import { OpsLogoutButton } from "@/components/ops/ops-logout-button";
import { getOpsDeskSecret } from "@/lib/auth/ops-env";
import {
  getOpsDeskSessionFromRequest,
  type ParsedOpsDeskSession,
} from "@/lib/auth/ops-session";

async function getOpsSession(): Promise<ParsedOpsDeskSession | null> {
  const secret = getOpsDeskSecret();
  if (!secret) return null;
  const h = await headers();
  return getOpsDeskSessionFromRequest(
    new Request("http://localhost", { headers: h }),
    secret,
  );
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/ops/kimi-code") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export default async function OpsKimiCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getOpsSession();
  const roleLabel = session?.role === "maintainer" ? "维护者" : "访客";
  const h = await headers();
  const pathname = h.get("x-nextjs-pathname") ?? "";

  const navItems = [
    { href: "/ops/kimi-code", label: "总览" },
    { href: "/ops/kimi-code/issues", label: "Issues" },
    { href: "/ops/kimi-code/pulls", label: "Pull Requests" },
    { href: "/ops/kimi-code/graph", label: "Graph" },
    { href: "/ops/kimi-code/metrics", label: "Metrics" },
  ];

  return (
    <div className="flex min-h-full flex-col md:flex-row">
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

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(pathname, item.href)
                  ? "bg-[color:var(--color-wash)] text-[color:var(--color-foreground)]"
                  : "text-[color:var(--color-foreground)] hover:bg-[color:var(--color-wash)]",
              ].join(" ")}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/ops/kimi-code/chat"
            className={[
              "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive(pathname, "/ops/kimi-code/chat")
                ? "bg-[color:var(--color-wash)] text-[color:var(--color-foreground)]"
                : "text-[color:var(--color-foreground)] hover:bg-[color:var(--color-wash)]",
            ].join(" ")}
          >
            Chat
          </Link>
        </nav>

        <div className="mt-8 flex items-center justify-between border-t border-[color:var(--color-border)] pt-4">
          <span className="rounded-full bg-[color:var(--color-wash)] px-2 py-0.5 text-xs text-[color:var(--color-muted-foreground)]">
            {roleLabel}
          </span>
          <OpsLogoutButton />
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
