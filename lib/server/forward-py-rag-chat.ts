/**
 * RAG chat BFF 转发：保留 x-sources 透传与 UND_ERR_HEADERS_OVERFLOW 502 语义。
 */
import {
  buildAdminForwardHeaders,
  buildPyApiUrl,
  fetchPyApiRaw,
  formatPyFetchErrorHint,
  isPyHeadersOverflowError,
} from "@/lib/py-service-proxy";

export async function forwardPyRagChat(request: Request): Promise<Response> {
  const url = buildPyApiUrl("/api/py/chat");
  const body = await request.text();
  const contentType = request.headers.get("content-type") ?? "application/json";
  const upstreamHeaders = buildAdminForwardHeaders(request, contentType);

  let upstream: Response;
  try {
    upstream = await fetchPyApiRaw("/api/py/chat", {
      method: "POST",
      headers: upstreamHeaders,
      body,
    });
  } catch (e) {
    return ragConnectionErrorResponse(url, e);
  }

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "");
    return new Response(errText || `${upstream.status} ${upstream.statusText}`, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("content-type") ?? "text/plain; charset=utf-8",
      },
    });
  }

  const xSources = upstream.headers.get("x-sources");
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "text/plain; charset=utf-8",
      ...(xSources ? { "x-sources": xSources } : null),
    },
  });
}

function ragConnectionErrorResponse(url: string, e: unknown): Response {
  if (isPyHeadersOverflowError(e)) {
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
  const hint = formatPyFetchErrorHint(e);
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
