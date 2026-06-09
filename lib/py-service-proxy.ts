/**
 * Python API（PY_API_URL）转发单点：BFF Route Handler 与 lib/server 须经本模块，禁止散落 fetch + env。
 */
import { getSyncAdminSecret } from "@/lib/auth/sync-admin-env";

/** PY_API_URL 是否在 env 中显式配置（非默认 fallback） */
export function isPyApiUrlConfigured(): boolean {
  return Boolean(process.env.PY_API_URL?.trim());
}

const DEFAULT_PY_API_URL = "http://127.0.0.1:8000";

/** PY_API_URL 唯一解析入口（F-03） */
export function getPyApiBaseUrl(): string {
  return (process.env.PY_API_URL ?? DEFAULT_PY_API_URL).replace(/\/$/, "");
}

/** 拼接 FastAPI 绝对 URL（path 可含 query） */
export function buildPyApiUrl(pathAndQuery: string): string {
  const base = getPyApiBaseUrl();
  const path = pathAndQuery.startsWith("/") ? pathAndQuery : `/${pathAndQuery}`;
  return `${base}${path}`;
}

export type PyForwardInit = {
  method: string;
  body?: BodyInit | null;
  headers?: HeadersInit;
};

export type PyForwardOptions = {
  /** 503 错误文案中的服务名 */
  serviceLabel?: string;
};

type FetchErrorCause = {
  code?: unknown;
  errno?: unknown;
  syscall?: unknown;
  hostname?: unknown;
};

/** 从 fetch 异常提取可读 hint（F-05） */
export function formatPyFetchErrorHint(error: unknown): string {
  const err = error instanceof Error ? error : new Error(String(error));
  const cause = (err as Error & { cause?: unknown }).cause;
  const causeObj =
    cause && typeof cause === "object" ? (cause as FetchErrorCause) : null;
  const parts = [
    err.message || "fetch failed",
    causeObj?.code ? `code=${String(causeObj.code)}` : "",
    causeObj?.errno ? `errno=${String(causeObj.errno)}` : "",
    causeObj?.syscall ? `syscall=${String(causeObj.syscall)}` : "",
    causeObj?.hostname ? `hostname=${String(causeObj.hostname)}` : "",
  ].filter(Boolean);
  return parts.join(" ");
}

/** fetch 异常是否为 x-sources Header 过大 */
export function isPyHeadersOverflowError(error: unknown): boolean {
  const err = error instanceof Error ? error : new Error(String(error));
  const cause = (err as Error & { cause?: unknown }).cause;
  const causeObj =
    cause && typeof cause === "object" ? (cause as FetchErrorCause) : null;
  return causeObj?.code != null && String(causeObj.code) === "UND_ERR_HEADERS_OVERFLOW";
}

function pyConnectionErrorResponse(
  url: string,
  error: unknown,
  serviceLabel: string,
): Response {
  const detail = formatPyFetchErrorHint(error);
  return Response.json(
    {
      ok: false,
      error: `无法连接 Python ${serviceLabel} 服务`,
      detail: `${detail}；目标: ${url}`,
    },
    { status: 503 },
  );
}

/** Ink admin 路由：Authorization + x-blog-admin-token + Content-Type */
export function buildAdminForwardHeaders(
  request: Request,
  contentType = "application/json",
): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": contentType };
  const auth = request.headers.get("authorization");
  const xBlog = request.headers.get("x-blog-admin-token");
  if (auth) headers.Authorization = auth;
  if (xBlog) headers["x-blog-admin-token"] = xBlog;
  return headers;
}

/**
 * ChatBI 路由 POST：上游 Python 只认 Authorization Bearer；
 * 浏览器可发 Bearer 明文，或用 X-ChatBI-Access-Token 覆盖。
 */
export function buildChatbiAuthHeaders(
  request: Request,
  contentType = "application/json",
): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": contentType };
  const auth = request.headers.get("authorization");
  const xBlog = request.headers.get("x-blog-admin-token");
  const chatbiAccess = request.headers.get("x-chatbi-access-token")?.trim() ?? "";

  if (chatbiAccess) {
    const plain = chatbiAccess.replace(/^bearer\s+/i, "").trim();
    if (plain) headers.Authorization = `Bearer ${plain}`;
    else if (auth?.trim()) headers.Authorization = auth.trim();
  } else if (auth?.trim()) {
    headers.Authorization = auth.trim();
  }
  if (xBlog) headers["x-blog-admin-token"] = xBlog;
  return headers;
}

/** ChatBI GET：透传 Authorization 或 x-chatbi-access-token 头 */
export function buildChatbiGetPassthroughHeaders(
  request: Request,
): Record<string, string> {
  const headers: Record<string, string> = {};
  const auth = request.headers.get("authorization");
  const xBlog = request.headers.get("x-blog-admin-token");
  const chatbiAccess = request.headers.get("x-chatbi-access-token")?.trim() ?? "";
  if (auth) headers.Authorization = auth;
  if (xBlog) headers["x-blog-admin-token"] = xBlog;
  if (chatbiAccess) {
    const plain = chatbiAccess.replace(/^bearer\s+/i, "").trim();
    if (plain) headers["x-chatbi-access-token"] = plain;
  }
  return headers;
}

/** verify 路由：解析 Bearer 明文（无则 400 由调用方处理） */
export function resolveChatbiVerifyAuthorization(
  request: Request,
): string | null {
  const auth = request.headers.get("authorization")?.trim() ?? "";
  const chatbiAccess = request.headers.get("x-chatbi-access-token")?.trim() ?? "";
  if (auth) return auth;
  if (chatbiAccess) {
    const plain = chatbiAccess.replace(/^bearer\s+/i, "").trim();
    if (plain) return `Bearer ${plain}`;
  }
  return null;
}

/** 底层 fetch（连接失败 **抛出**，供需特殊 catch 的 route 使用） */
export async function fetchPyApiRaw(
  pathAndQuery: string,
  init: PyForwardInit,
): Promise<Response> {
  const url = buildPyApiUrl(pathAndQuery);
  return await fetch(url, init);
}

/** 通用 BFF → FastAPI 转发（返回原始 upstream Response） */
export async function forwardToPyApi(
  pathAndQuery: string,
  init: PyForwardInit,
  options?: PyForwardOptions,
): Promise<Response> {
  const url = buildPyApiUrl(pathAndQuery);
  const serviceLabel = options?.serviceLabel ?? "API";
  try {
    return await fetchPyApiRaw(pathAndQuery, init);
  } catch (error) {
    return pyConnectionErrorResponse(url, error, serviceLabel);
  }
}

/** 转发并将 upstream body 读为 text 后返回新 Response（JSON/文本 route 常用） */
export async function forwardToPyApiAsTextResponse(
  pathAndQuery: string,
  init: PyForwardInit,
  options?: PyForwardOptions,
): Promise<Response> {
  const upstream = await forwardToPyApi(pathAndQuery, init, options);
  const text = await upstream.text().catch(() => "");
  const ct =
    upstream.headers.get("content-type") ?? "application/json; charset=utf-8";
  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": ct },
  });
}

/** SSE 流式转发：透传 upstream.body */
export async function forwardToPyApiAsStreamResponse(
  pathAndQuery: string,
  init: PyForwardInit,
  options?: PyForwardOptions & {
    extraResponseHeaders?: Record<string, string>;
  },
): Promise<Response> {
  const upstream = await forwardToPyApi(pathAndQuery, init, options);
  if (!upstream.ok && upstream.headers.get("content-type")?.includes("json")) {
    return upstream;
  }
  const ct = upstream.headers.get("content-type") ?? "text/event-stream; charset=utf-8";
  const headers = new Headers();
  headers.set("Content-Type", ct);
  headers.set("Cache-Control", "no-cache");
  headers.set("Connection", "keep-alive");
  if (options?.extraResponseHeaders) {
    for (const [k, v] of Object.entries(options.extraResponseHeaders)) {
      headers.set(k, v);
    }
  }
  return new Response(upstream.body, { status: upstream.status, headers });
}

/**
 * 将已鉴权的请求转发到 FastAPI admin 路径，并注入服务端 Bearer。
 * 用于 /api/admin/sync、/api/admin/ingest 等与 api/index.py 对齐的管理接口。
 */
export async function forwardToPyAdmin(
  pathAndQuery: string,
  init?: RequestInit,
): Promise<Response> {
  const secret = getSyncAdminSecret();
  if (!secret) {
    return Response.json(
      {
        ok: false,
        error:
          "服务端未配置 SYNC_ADMIN_SECRET（或兼容 CHAT_API_SECRET）；无法转发 Python admin 接口",
      },
      { status: 500 },
    );
  }

  const url = buildPyApiUrl(pathAndQuery);
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

/** 从 incoming Request URL 提取 query string（含前导 ?，无则空串） */
export function extractRequestQueryString(request: Request): string {
  const incoming = new URL(request.url);
  const qs = incoming.searchParams.toString();
  return qs ? `?${qs}` : "";
}
