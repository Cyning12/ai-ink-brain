export const runtime = "nodejs";

/**
 * BFF：将 /api/py/unified/chat 显式转发到 Python。
 * v1：后端一次性返回 JSON（events[]）。
 * 鉴权由 Python `require_chatbi_principal`（DB Bearer）；本层不再校验 Ink env secret。
 */
export async function POST(request: Request): Promise<Response> {
  const pyBase = (process.env.PY_API_URL ?? "http://127.0.0.1:8000").replace(
    /\/$/,
    "",
  );
  const url = `${pyBase}/api/py/unified/chat`;

  const body = await request.text();
  const auth = request.headers.get("authorization");
  const xBlog = request.headers.get("x-blog-admin-token");
  const chatbiAccess = request.headers.get("x-chatbi-access-token")?.trim() ?? "";
  const contentType = request.headers.get("content-type") ?? "application/json";

  const upstreamHeaders: Record<string, string> = { "Content-Type": contentType };
  // 上游 Python 只认 Authorization Bearer；浏览器可只发 Bearer 明文，或用 X-ChatBI-Access-Token 覆盖。
  if (chatbiAccess) {
    const plain = chatbiAccess.replace(/^bearer\s+/i, "").trim();
    if (plain) upstreamHeaders.Authorization = `Bearer ${plain}`;
    else if (auth?.trim()) upstreamHeaders.Authorization = auth.trim();
  } else if (auth?.trim()) {
    upstreamHeaders.Authorization = auth.trim();
  }
  if (xBlog) upstreamHeaders["x-blog-admin-token"] = xBlog;

  let upstream: Response;
  try {
    upstream = await fetch(url, { method: "POST", headers: upstreamHeaders, body });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return Response.json(
      { ok: false, error: "无法连接 Python Unified Chat 服务", detail: err.message },
      { status: 503 },
    );
  }

  const text = await upstream.text().catch(() => "");
  const ct = upstream.headers.get("content-type") ?? "application/json; charset=utf-8";
  return new Response(text, { status: upstream.status, headers: { "Content-Type": ct } });
}

