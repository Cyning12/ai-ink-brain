import { requireAdminApiSecret } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * BFF：将 /api/py/text2sql/chat 显式转发到 FastAPI。
 * v1 为 JSON 返回（非流式）。
 */
export async function POST(request: Request): Promise<Response> {
  const denied = requireAdminApiSecret(request);
  if (denied) return denied;

  const pyBase = (process.env.PY_API_URL ?? "http://127.0.0.1:8000").replace(
    /\/$/,
    "",
  );
  const url = `${pyBase}/api/py/text2sql/chat`;

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
    return new Response(
      ["无法连接 Python Text2SQL 服务。", `目标: ${url}`, `原因: ${err.message}`].join(
        "\n",
      ),
      {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      },
    );
  }

  const ct =
    upstream.headers.get("content-type") ?? "application/json; charset=utf-8";
  const text = await upstream.text().catch(() => "");

  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": ct },
  });
}

