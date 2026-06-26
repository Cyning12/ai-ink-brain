import { requireOpsDeskAccess } from "@/lib/auth/ops-session";
import { forwardOpsRequest } from "@/lib/server/forward-ops-request";

export const runtime = "nodejs";

/** POST /api/ops/chat/messages → Python POST /ops/chat/messages */
export async function POST(request: Request): Promise<Response> {
  const denied = await requireOpsDeskAccess(request);
  if (denied) return denied;

  const body = await request.text();
  const contentType = request.headers.get("content-type") ?? "application/json";
  return forwardOpsRequest("/api/py/ops/chat/messages", {
    method: "POST",
    headers: { "Content-Type": contentType },
    body,
  }, request);
}
