import { requireOpsDeskMaintainer } from "@/lib/auth/ops-session";
import { forwardOpsRequest } from "@/lib/server/forward-ops-request";

export const runtime = "nodejs";

/** POST /api/ops/sync/trigger → Python POST /api/py/ops/sync/trigger */
export async function POST(request: Request): Promise<Response> {
  const denied = await requireOpsDeskMaintainer(request);
  if (denied) return denied;

  return forwardOpsRequest("/api/py/ops/sync/trigger", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
}
