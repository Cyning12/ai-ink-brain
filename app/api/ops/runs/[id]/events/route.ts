import { requireOpsDeskAccess } from "@/lib/auth/ops-session";
import { forwardOpsRequest } from "@/lib/server/forward-ops-request";

export const runtime = "nodejs";

/** GET /api/ops/runs/{id}/events?after_seq= → Python GET /ops/runs/{id}/events */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const denied = await requireOpsDeskAccess(request);
  if (denied) return denied;

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const afterSeq = searchParams.get("after_seq") ?? "0";
  const query = `?after_seq=${encodeURIComponent(afterSeq)}`;
  return forwardOpsRequest(`/api/py/ops/runs/${encodeURIComponent(id)}/events${query}`, {
    method: "GET",
  }, request);
}
