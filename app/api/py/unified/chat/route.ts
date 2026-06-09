import {
  buildChatbiAuthHeaders,
  forwardToPyApiAsTextResponse,
} from "@/lib/py-service-proxy";

export const runtime = "nodejs";

/**
 * BFF：将 /api/py/unified/chat 显式转发到 Python。
 * v1：后端一次性返回 JSON（events[]）。
 * 鉴权由 Python `require_chatbi_principal`（DB Bearer）；本层不再校验 Ink env secret。
 */
export async function POST(request: Request): Promise<Response> {
  const body = await request.text();
  const contentType = request.headers.get("content-type") ?? "application/json";
  return forwardToPyApiAsTextResponse(
    "/api/py/unified/chat",
    {
      method: "POST",
      headers: buildChatbiAuthHeaders(request, contentType),
      body,
    },
    { serviceLabel: "Unified Chat" },
  );
}
