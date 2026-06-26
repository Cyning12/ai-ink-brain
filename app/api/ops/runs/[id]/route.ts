import { requireOpsDeskAccess } from "@/lib/auth/ops-session";
import { forwardOpsRequest } from "@/lib/server/forward-ops-request";

export const runtime = "nodejs";

/** GET /api/ops/runs/{id} → Python GET /ops/runs/{id} */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const denied = await requireOpsDeskAccess(request);
  if (denied) return denied;

  const { id } = await params;
  return forwardOpsRequest(`/api/py/ops/runs/${encodeURIComponent(id)}`, {
    method: "GET",
  }, request);
}
