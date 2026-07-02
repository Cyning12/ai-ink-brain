import { requireOpsDeskAccess } from "@/lib/auth/ops-session";
import { forwardOpsRequest } from "@/lib/server/forward-ops-request";

export const runtime = "nodejs";

/** GET /api/ops/sessions → Python GET /ops/sessions */
export async function GET(request: Request): Promise<Response> {
  const denied = await requireOpsDeskAccess(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const qs = url.searchParams.toString();
  const upstream = qs ? `/api/py/ops/sessions?${qs}` : "/api/py/ops/sessions";
  return forwardOpsRequest(upstream, { method: "GET" }, request);
}

/** POST /api/ops/sessions → Python POST /ops/sessions */
export async function POST(request: Request): Promise<Response> {
  const denied = await requireOpsDeskAccess(request);
  if (denied) return denied;

  const body = await request.text();
  const contentType = request.headers.get("content-type") ?? "application/json";
  return forwardOpsRequest(
    "/api/py/ops/sessions",
    {
      method: "POST",
      headers: { "Content-Type": contentType },
      body,
    },
    request,
  );
}
