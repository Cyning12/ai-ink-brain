import { requireAdminApiSecret } from "@/lib/auth";
import {
  buildAdminForwardHeaders,
  forwardToPyApiAsTextResponse,
} from "@/lib/py-service-proxy";

export const runtime = "nodejs";

/**
 * BFF：将 /api/py/text2sql/chat 显式转发到 FastAPI。
 * v1 为 JSON 返回（非流式）。
 */
export async function POST(request: Request): Promise<Response> {
  const denied = requireAdminApiSecret(request);
  if (denied) return denied;

  const body = await request.text();
  const contentType = request.headers.get("content-type") ?? "application/json";
  return forwardToPyApiAsTextResponse(
    "/api/py/text2sql/chat",
    {
      method: "POST",
      headers: buildAdminForwardHeaders(request, contentType),
      body,
    },
    { serviceLabel: "Text2SQL" },
  );
}
