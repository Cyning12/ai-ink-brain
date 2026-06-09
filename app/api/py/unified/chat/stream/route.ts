import {
  buildChatbiAuthHeaders,
  forwardToPyApiAsStreamResponse,
} from "@/lib/py-service-proxy";

export const runtime = "nodejs";

/**
 * BFF：将 /api/py/unified/chat/stream 转发到 Python（SSE）。
 * 说明：前端使用 fetch(POST) 读取 Response.body 来解析 SSE。
 * 鉴权由 Python `require_chatbi_principal`；本层不再校验 Ink env secret。
 */
export async function POST(request: Request): Promise<Response> {
  const body = await request.text();
  const contentType = request.headers.get("content-type") ?? "application/json";
  const headers = buildChatbiAuthHeaders(request, contentType);
  headers.Accept = "text/event-stream";

  const sseContract = request.headers.get("x-chatbi-sse-contract");
  if (sseContract?.trim()) {
    headers["X-ChatBI-Sse-Contract"] = sseContract.trim();
  }

  return forwardToPyApiAsStreamResponse(
    "/api/py/unified/chat/stream",
    { method: "POST", headers, body },
    { serviceLabel: "Unified Chat SSE" },
  );
}
