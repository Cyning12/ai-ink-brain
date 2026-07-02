import { requireOpsDeskAccess } from "@/lib/auth/ops-session";
import { forwardOpsRequest } from "@/lib/server/forward-ops-request";

export const runtime = "nodejs";

/** GET /api/ops/sessions/{session_id} → Python GET /ops/sessions/{session_id} */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ session_id: string }> },
): Promise<Response> {
  const denied = await requireOpsDeskAccess(request);
  if (denied) return denied;

  const { session_id } = await params;
  return forwardOpsRequest(
    `/api/py/ops/sessions/${encodeURIComponent(session_id)}`,
    { method: "GET" },
    request,
  );
}
