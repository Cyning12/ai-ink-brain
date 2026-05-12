export const runtime = "nodejs";

/**
 * BFF：转发 GET 到 Python，用于按 session_id 恢复对话历史。
 * Python：Ink admin 或 `X-ChatBI-Access-Token`（DB 明文）二轨；本层不再校验 Ink env secret。
 */
export async function GET(request: Request): Promise<Response> {
  const pyBase = (process.env.PY_API_URL ?? "http://127.0.0.1:8000").replace(
    /\/$/,
    "",
  );
  const incoming = new URL(request.url);
  const qs = incoming.searchParams.toString();
  const url = `${pyBase}/api/py/chat/history${qs ? `?${qs}` : ""}`;

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
    const cause = (err as Error & { cause?: unknown }).cause;
    const causeObj =
      cause && typeof cause === "object"
        ? (cause as {
            code?: unknown;
            errno?: unknown;
            syscall?: unknown;
            hostname?: unknown;
          })
        : null;
    const hintParts = [
      err.message || "fetch failed",
      causeObj?.code ? `code=${String(causeObj.code)}` : "",
      causeObj?.errno ? `errno=${String(causeObj.errno)}` : "",
      causeObj?.syscall ? `syscall=${String(causeObj.syscall)}` : "",
      causeObj?.hostname ? `hostname=${String(causeObj.hostname)}` : "",
    ].filter(Boolean);
    const hint = hintParts.join(" ");
    return Response.json(
      {
        ok: false,
        error: "无法连接 Python RAG 服务",
        detail: `${hint}；目标: ${url}`,
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
