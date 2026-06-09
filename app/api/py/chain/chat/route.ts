import { requireAdminApiSecret } from "@/lib/auth";
import {
  buildAdminForwardHeaders,
  forwardToPyApiAsTextResponse,
} from "@/lib/py-service-proxy";

export const runtime = "nodejs";

/**
 * BFF：将 /api/py/chain/chat 显式转发到 Python。
 * 约定：上游返回 JSON（events[] 等）。
 */
export async function POST(request: Request): Promise<Response> {
  const denied = requireAdminApiSecret(request);
  if (denied) return denied;

  const body = await request.text();
  const contentType = request.headers.get("content-type") ?? "application/json";
  return forwardToPyApiAsTextResponse(
    "/api/py/chain/chat",
    {
      method: "POST",
      headers: buildAdminForwardHeaders(request, contentType),
      body,
    },
    { serviceLabel: "Chain Chat" },
  );
}
