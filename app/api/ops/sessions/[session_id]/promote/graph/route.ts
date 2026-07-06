import { requireOpsDeskAccess } from "@/lib/auth/ops-session";
import { forwardOpsRequest } from "@/lib/server/forward-ops-request";

export const runtime = "nodejs";

/** GET /api/ops/sessions/{session_id}/promote/graph */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ session_id: string }> },
): Promise<Response> {
  const denied = await requireOpsDeskAccess(request);
  if (denied) return denied;

  const { session_id } = await params;
  const url = new URL(request.url);
  const qs = url.searchParams.toString();
  const suffix = qs ? `?${qs}` : "";
  return forwardOpsRequest(
    `/api/py/ops/sessions/${encodeURIComponent(session_id)}/promote/graph/preview${suffix}`,
    { method: "GET" },
    request,
  );
}

/** POST /api/ops/sessions/{session_id}/promote/graph */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ session_id: string }> },
): Promise<Response> {
  const denied = await requireOpsDeskAccess(request);
  if (denied) return denied;

  const { session_id } = await params;
  const body = await request.text();
  return forwardOpsRequest(
    `/api/py/ops/sessions/${encodeURIComponent(session_id)}/promote/graph`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    },
    request,
  );
}
