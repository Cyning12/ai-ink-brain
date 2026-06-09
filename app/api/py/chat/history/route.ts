import {
  buildChatbiGetPassthroughHeaders,
  extractRequestQueryString,
  forwardToPyApiAsTextResponse,
} from "@/lib/py-service-proxy";

export const runtime = "nodejs";

/**
 * BFF：转发 GET 到 Python，用于按 session_id 恢复对话历史。
 * Python：Ink admin 或 `X-ChatBI-Access-Token`（DB 明文）二轨；本层不再校验 Ink env secret。
 */
export async function GET(request: Request): Promise<Response> {
  const qs = extractRequestQueryString(request);
  return forwardToPyApiAsTextResponse(
    `/api/py/chat/history${qs}`,
    {
      method: "GET",
      headers: buildChatbiGetPassthroughHeaders(request),
    },
    { serviceLabel: "RAG history" },
  );
}
