import {
  buildChatbiGetPassthroughHeaders,
  forwardToPyApiAsTextResponse,
} from "@/lib/py-service-proxy";

export const runtime = "nodejs";

/**
 * BFF：转发 GET 到 Python，拉取推荐问法列表。
 * Python：`GET /api/py/chat/suggested-questions` → `{ ok, questions: string[] }`
 */
export async function GET(request: Request): Promise<Response> {
  return forwardToPyApiAsTextResponse(
    "/api/py/chat/suggested-questions",
    {
      method: "GET",
      headers: buildChatbiGetPassthroughHeaders(request),
    },
    { serviceLabel: "RAG suggested-questions" },
  );
}
