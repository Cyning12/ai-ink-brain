import { requireOpsDeskAccess } from "@/lib/auth/ops-session";
import { forwardOpsRequest } from "@/lib/server/forward-ops-request";

export const runtime = "nodejs";

/** POST /api/ops/sessions/{session_id}/messages → Python POST /ops/sessions/{session_id}/messages */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ session_id: string }> },
): Promise<Response> {
  const denied = await requireOpsDeskAccess(request);
  if (denied) return denied;

  const { session_id } = await params;
  const body = await request.text();
  const contentType = request.headers.get("content-type") ?? "application/json";
  return forwardOpsRequest(
    `/api/py/ops/sessions/${encodeURIComponent(session_id)}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": contentType },
      body,
    },
    request,
  );
}
