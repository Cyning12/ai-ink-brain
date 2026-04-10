/**
 * 将已鉴权的请求转发到 FastAPI（PY_API_URL），并注入服务端 Bearer。
 * 用于 /api/admin/sync、/api/admin/ingest 等与 api/index.py 对齐的管理接口。
 */
export async function forwardToPyAdmin(
  pathAndQuery: string,
  init?: RequestInit,
): Promise<Response> {
  const secret = process.env.NEXT_PUBLIC_ADMIN_SECRET?.trim();
  if (!secret) {
    return Response.json(
      { ok: false, error: "服务端未配置环境变量 NEXT_PUBLIC_ADMIN_SECRET" },
      { status: 500 },
    );
  }

  const base = (process.env.PY_API_URL ?? "http://127.0.0.1:8000").replace(
    /\/$/,
    "",
  );
  const path = pathAndQuery.startsWith("/") ? pathAndQuery : `/${pathAndQuery}`;
  const url = `${base}${path}`;

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${secret}`);

  try {
    return await fetch(url, { ...init, headers });
  } catch {
    return Response.json(
      {
        ok: false,
        error:
          "无法连接 Python 服务。请启动：cd api && uvicorn index:app --host 127.0.0.1 --port 8000（或设置 PY_API_URL）",
      },
      { status: 503 },
    );
  }
}
