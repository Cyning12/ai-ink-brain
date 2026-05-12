export const runtime = "nodejs";

/**
 * BFF：转发 Python GET /api/py/chatbi/access/verify。
 * 仅将浏览器凭据交给 Python 校验：优先 `Authorization: Bearer <明文>`，否则 `X-ChatBI-Access-Token`。
 * 本层不校验 NEXT_PUBLIC_ADMIN_SECRET。
 */
export async function GET(request: Request): Promise<Response> {
  const pyBase = (process.env.PY_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
  const url = `${pyBase}/api/py/chatbi/access/verify`;

  const auth = request.headers.get("authorization")?.trim() ?? "";
  const chatbiAccess = request.headers.get("x-chatbi-access-token")?.trim() ?? "";

  const upstreamHeaders: Record<string, string> = { Accept: "application/json" };
  if (auth) {
    upstreamHeaders.Authorization = auth;
  } else if (chatbiAccess) {
    const plain = chatbiAccess.replace(/^bearer\s+/i, "").trim();
    if (plain) upstreamHeaders.Authorization = `Bearer ${plain}`;
  }

  if (!upstreamHeaders.Authorization) {
    return Response.json(
      { ok: false, error: "缺少访问令牌：请使用 Authorization: Bearer <明文> 或 X-ChatBI-Access-Token" },
      { status: 400 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, { method: "GET", headers: upstreamHeaders });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return Response.json(
      { ok: false, error: "无法连接 Python ChatBI 校验服务", detail: err.message },
      { status: 503 },
    );
  }

  const text = await upstream.text().catch(() => "");
  const ct = upstream.headers.get("content-type") ?? "application/json; charset=utf-8";
  return new Response(text, { status: upstream.status, headers: { "Content-Type": ct } });
}
