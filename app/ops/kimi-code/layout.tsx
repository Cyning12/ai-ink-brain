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

export default async function OpsKimiCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getOpsSession();
  const roleLabel = session?.role === "maintainer" ? "维护者" : "访客";

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
          <Link
            href="/ops/kimi-code"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--color-foreground)] hover:bg-[color:var(--color-wash)]"
          >
            总览
          </Link>
          <Link
            href="/ops/kimi-code/issues"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--color-foreground)] hover:bg-[color:var(--color-wash)]"
          >
            Issues
          </Link>
          <Link
            href="/ops/kimi-code/pulls"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--color-foreground)] hover:bg-[color:var(--color-wash)]"
          >
            Pull Requests
          </Link>
          <span className="block rounded-lg px-3 py-2 text-sm text-[color:var(--color-muted-foreground)] opacity-60"
            title="P1-5 实现"
          >
            Chat
          </span>
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
