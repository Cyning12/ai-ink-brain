import { requireOpsDeskAccess } from "@/lib/auth/ops-session";
import { forwardOpsRequest } from "@/lib/server/forward-ops-request";

export const runtime = "nodejs";

/** GET /api/ops/graph/module-issues → Python GET /api/py/ops/graph/module-issues */
export async function GET(request: Request): Promise<Response> {
  const denied = await requireOpsDeskAccess(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const state = url.searchParams.get("state") ?? "open";
  const safeState = ["open", "closed", "all"].includes(state) ? state : "open";

  return forwardOpsRequest(
    `/api/py/ops/graph/module-issues?state=${encodeURIComponent(safeState)}`,
    { method: "GET" },
    request,
  );
}
