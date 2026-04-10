import { requireAdminApiSecret } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * BFF：将 /api/py/chat 显式转发到 FastAPI，避免仅依赖 rewrites 时连接失败只显示笼统 500。
 * 与 rewrites 并存时，本路由优先匹配 /api/py/chat。
 */
export async function POST(request: Request): Promise<Response> {
  const denied = requireAdminApiSecret(request);
  if (denied) return denied;

  const pyBase = (process.env.PY_API_URL ?? "http://127.0.0.1:8000").replace(
    /\/$/,
    "",
  );
  const url = `${pyBase}/api/py/chat`;

  const body = await request.text();
  const auth = request.headers.get("authorization");
  const xBlog = request.headers.get("x-blog-admin-token");
  const contentType =
    request.headers.get("content-type") ?? "application/json";

  const upstreamHeaders: Record<string, string> = {
    "Content-Type": contentType,
  };
  if (auth) upstreamHeaders.Authorization = auth;
  if (xBlog) upstreamHeaders["x-blog-admin-token"] = xBlog;

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: upstreamHeaders,
      body,
    });
  } catch (e) {
    const hint =
      e instanceof Error ? e.message : "未知网络错误";
    return new Response(
      [
        "无法连接 Python RAG 服务。",
        `目标: ${url}`,
        `原因: ${hint}`,
        "",
        "请先在本机启动：cd api && source .venv/bin/activate && uvicorn index:app --host 127.0.0.1 --port 8000",
        "（或设置 PY_API_URL 指向实际地址）",
      ].join("\n"),
      {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      },
    );
  }

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "");
    return new Response(
      errText || `${upstream.status} ${upstream.statusText}`,
      {
        status: upstream.status,
        headers: {
          "Content-Type":
            upstream.headers.get("content-type") ?? "text/plain; charset=utf-8",
        },
      },
    );
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "text/plain; charset=utf-8",
    },
  });
}
