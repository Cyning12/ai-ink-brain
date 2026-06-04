export const runtime = "nodejs";

/**
 * BFF：转发 GET 到 Python，拉取推荐问法列表。
 * Python：`GET /api/py/chat/suggested-questions` → `{ ok, questions: string[] }`
 */
export async function GET(request: Request): Promise<Response> {
  const pyBase = (process.env.PY_API_URL ?? "http://127.0.0.1:8000").replace(
    /\/$/,
    "",
  );
  const url = `${pyBase}/api/py/chat/suggested-questions`;

  const auth = request.headers.get("authorization");
  const xBlog = request.headers.get("x-blog-admin-token");
  const chatbiAccess = request.headers.get("x-chatbi-access-token")?.trim() ?? "";
  const upstreamHeaders: Record<string, string> = {};
  if (auth) upstreamHeaders.Authorization = auth;
  if (xBlog) upstreamHeaders["x-blog-admin-token"] = xBlog;
  if (chatbiAccess) {
    const plain = chatbiAccess.replace(/^bearer\s+/i, "").trim();
    if (plain) upstreamHeaders["x-chatbi-access-token"] = plain;
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "GET",
      headers: upstreamHeaders,
    });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return Response.json(
      {
        ok: false,
        error: "无法连接 Python RAG 服务",
        detail: err.message,
      },
      { status: 503 },
    );
  }

  const text = await upstream.text().catch(() => "");
  const ct =
    upstream.headers.get("content-type") ?? "application/json; charset=utf-8";

  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": ct },
  });
}
