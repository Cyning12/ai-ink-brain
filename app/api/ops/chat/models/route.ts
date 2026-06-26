import { requireOpsDeskAccess } from "@/lib/auth/ops-session";
import { forwardOpsRequest } from "@/lib/server/forward-ops-request";

export const runtime = "nodejs";

/** GET /api/ops/chat/models → Python GET /ops/chat/models */
export async function GET(request: Request): Promise<Response> {
  const denied = await requireOpsDeskAccess(request);
  if (denied) return denied;

  return forwardOpsRequest("/api/py/ops/chat/models", { method: "GET" }, request);
}
