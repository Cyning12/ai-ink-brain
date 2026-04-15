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
    const err = e instanceof Error ? e : new Error(String(e));
    const cause = (err as Error & { cause?: unknown }).cause;
    const causeObj =
      cause && typeof cause === "object"
        ? (cause as { code?: unknown; errno?: unknown; syscall?: unknown; hostname?: unknown })
        : null;
    const causeCode = causeObj?.code ? String(causeObj.code) : "";
    if (causeCode === "UND_ERR_HEADERS_OVERFLOW") {
      return new Response(
        [
          "Python RAG 服务响应头过大（UND_ERR_HEADERS_OVERFLOW）。",
          "这通常是 /api/py/chat 返回的 x-sources（来源引用）Header 过长导致的。",
          `目标: ${url}`,
          "",
          "解决：后端应在 x-sources 超过上限时省略该 Header，仅使用流末尾 ---RAG_SOURCES_JSON--- 作为兜底传输 sources。",
        ].join("\n"),
        {
          status: 502,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        },
      );
    }
    const hintParts = [
      err.message || "fetch failed",
      causeCode ? `code=${causeCode}` : "",
      causeObj?.errno ? `errno=${String(causeObj.errno)}` : "",
      causeObj?.syscall ? `syscall=${String(causeObj.syscall)}` : "",
      causeObj?.hostname ? `hostname=${String(causeObj.hostname)}` : "",
    ].filter(Boolean);
    const hint = hintParts.join(" ");
    return new Response(
      [
        "无法连接 Python RAG 服务。",
        `目标: ${url}`,
        `原因: ${hint}`,
        "",
        "请先在本机启动：cd api && source .venv/bin/activate && uvicorn index:app --host 127.0.0.1 --port 8000",
        "（或设置 PY_API_URL 指向实际地址）",
        "",
        "若你已将 PY_API_URL 指向 vercel.app 且浏览器能打开 /api/py/health，但此处仍 fetch failed，常见原因是本机 Node 优先走 IPv6 或被代理/DNS 拦截：",
        "- 试试用 NODE_OPTIONS=--dns-result-order=ipv4first 重启 next dev",
        "- 或检查终端环境变量 HTTPS_PROXY/HTTP_PROXY/NO_PROXY",
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
