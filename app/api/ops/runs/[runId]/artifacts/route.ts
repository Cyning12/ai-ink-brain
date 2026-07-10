import { requireOpsDeskAccess } from "@/lib/auth/ops-session";
import { forwardOpsRequest } from "@/lib/server/forward-ops-request";

export const runtime = "nodejs";

/** GET /api/ops/runs/{runId}/artifacts → Python GET /api/py/ops/runs/{runId}/artifacts */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ runId: string }> },
): Promise<Response> {
  const denied = await requireOpsDeskAccess(request);
  if (denied) return denied;

  const { runId } = await params;
  return forwardOpsRequest(
    `/api/py/ops/runs/${encodeURIComponent(runId)}/artifacts`,
    { method: "GET" },
    request,
  );
}
