import { requireAdminApiSecret } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * BFF：将 /api/py/unified/chat/stream 转发到 Python（SSE）。
 * 说明：前端使用 fetch(POST) 读取 Response.body 来解析 SSE。
 */
export async function POST(request: Request): Promise<Response> {
  const denied = requireAdminApiSecret(request);
  if (denied) return denied;

  const pyBase = (process.env.PY_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
  const url = `${pyBase}/api/py/unified/chat/stream`;

  const body = await request.text();
  const auth = request.headers.get("authorization");
  const xBlog = request.headers.get("x-blog-admin-token");
  const contentType = request.headers.get("content-type") ?? "application/json";

  const upstreamHeaders: Record<string, string> = {
    "Content-Type": contentType,
    Accept: "text/event-stream",
  };
  if (auth) upstreamHeaders.Authorization = auth;
  if (xBlog) upstreamHeaders["x-blog-admin-token"] = xBlog;

  let upstream: Response;
  try {
    upstream = await fetch(url, { method: "POST", headers: upstreamHeaders, body });
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return Response.json(
      { ok: false, error: "无法连接 Python Unified Chat SSE 服务", detail: err.message },
      { status: 503 },
    );
  }

  // 透传状态码；body 为 ReadableStream（SSE）
  const ct = upstream.headers.get("content-type") ?? "text/event-stream; charset=utf-8";
  const headers = new Headers();
  headers.set("Content-Type", ct);
  headers.set("Cache-Control", "no-cache");
  headers.set("Connection", "keep-alive");

  return new Response(upstream.body, { status: upstream.status, headers });
}

