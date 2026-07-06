import { headers } from "next/headers";
import { OpsKimiCodeSidebar } from "@/components/ops/OpsKimiCodeSidebar";
import { OpsSessionGuard } from "@/components/ops/ops-session-guard";
import { getOpsDeskAuthMode, getOpsDeskSecret } from "@/lib/auth/ops-env";
import {
  lookupOpsDeskSession,
  type ParsedOpsDeskSession,
} from "@/lib/auth/ops-session";

export const dynamic = "force-dynamic";

async function getOpsSession(): Promise<ParsedOpsDeskSession | null> {
  const h = await headers();
  const req = new Request("http://localhost", { headers: h });
  const secret = getOpsDeskAuthMode() === "db" ? "" : (getOpsDeskSecret() ?? "");
  const lookup = await lookupOpsDeskSession(req, secret);
  return lookup.status === "authenticated" ? lookup.session : null;
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
      <OpsKimiCodeSidebar roleLabel={roleLabel} />

      <main className="min-w-0 flex-1 p-6 md:p-10">
        <OpsSessionGuard />
        {children}
      </main>
    </div>
  );
}
