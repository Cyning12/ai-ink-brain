import {
  buildPyApiUrl,
  fetchPyApiRaw,
  forwardToPyApiAsTextResponse,
} from "@/lib/py-service-proxy";
import { getOpsDeskAuthMode, getOpsDeskSecret } from "@/lib/auth/ops-env";

function parseSessionCookie(header: string | null): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() !== "ops_desk_session") continue;
    return part.slice(idx + 1).trim();
  }
  return null;
}

/** RSC 未显式传 Request 时，从 incoming headers 构造最小 Request（仅 cookie）。 */
async function resolveOpsForwardRequest(
  explicit?: Request,
): Promise<Request | undefined> {
  if (explicit) return explicit;
  try {
    const { headers: getHeaders } = await import("next/headers");
    const h = await getHeaders();
    const cookie = h.get("cookie");
    if (!cookie) return undefined;
    return new Request("http://localhost", { headers: { cookie } });
  } catch {
    return undefined;
  }
}

/** Ops Desk BFF 转发：DB 模式注入 x-ops-session，legacy 注入 x-ops-secret。 */
export async function forwardOpsRequest(
  upstreamPath: string,
  init: { method: string; body?: BodyInit | null; headers?: HeadersInit },
  request?: Request,
): Promise<Response> {
  const resolved = await resolveOpsForwardRequest(request);
  const headers = new Headers(init.headers);

  if (getOpsDeskAuthMode() === "db") {
    const sessionId = parseSessionCookie(resolved?.headers.get("cookie") ?? null);
    if (!sessionId) {
      return Response.json(
        { ok: false, error: "未登录或 session 已失效" },
        { status: 401 },
      );
    }
    headers.set("x-ops-session", sessionId);
    return forwardToPyApiAsTextResponse(
      upstreamPath,
      { ...init, headers },
      { serviceLabel: "Ops Desk" },
    );
  }

  const secret = getOpsDeskSecret();
  if (!secret) {
    return Response.json(
      { ok: false, error: "服务端未配置 OPS_DESK_SECRET，无法转发 Ops Desk 请求" },
      { status: 503 },
    );
  }
  headers.set("x-ops-secret", secret);
  return forwardToPyApiAsTextResponse(
    upstreamPath,
    { ...init, headers },
    { serviceLabel: "Ops Desk" },
  );
}

/** 底层 fetch（连接失败抛出，供需特殊 catch 的 route 使用）。 */
export async function fetchOpsRaw(
  upstreamPath: string,
  init: { method: string; body?: BodyInit | null; headers?: HeadersInit },
  request?: Request,
): Promise<Response> {
  const resolved = await resolveOpsForwardRequest(request);
  const headers = new Headers(init.headers);

  if (getOpsDeskAuthMode() === "db") {
    const sessionId = parseSessionCookie(resolved?.headers.get("cookie") ?? null);
    if (!sessionId) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    headers.set("x-ops-session", sessionId);
  } else {
    const secret = getOpsDeskSecret();
    if (!secret) {
      return Response.json(
        { ok: false, error: "服务端未配置 OPS_DESK_SECRET" },
        { status: 503 },
      );
    }
    headers.set("x-ops-secret", secret);
  }

  const url = buildPyApiUrl(upstreamPath);
  try {
    return await fetchPyApiRaw(upstreamPath, { ...init, headers });
  } catch (error) {
    const { formatPyFetchErrorHint } = await import("@/lib/py-service-proxy");
    const detail = formatPyFetchErrorHint(error);
    return Response.json(
      { ok: false, error: "无法连接 Python Ops Desk 服务", detail: `${detail}；目标: ${url}` },
      { status: 503 },
    );
  }
}
