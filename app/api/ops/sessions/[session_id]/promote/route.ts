import { requireOpsDeskAccess } from "@/lib/auth/ops-session";
import { forwardOpsRequest } from "@/lib/server/forward-ops-request";

export const runtime = "nodejs";

/** POST /api/ops/sessions/{session_id}/promote */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ session_id: string }> },
): Promise<Response> {
  const denied = await requireOpsDeskAccess(request);
  if (denied) return denied;

  const { session_id } = await params;
  const body = await request.text();
  return forwardOpsRequest(
    `/api/py/ops/sessions/${encodeURIComponent(session_id)}/promote`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    },
    request,
  );
}
