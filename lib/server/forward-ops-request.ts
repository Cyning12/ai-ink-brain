import { getOpsDeskSecret } from "@/lib/auth/ops-env";
import {
  buildPyApiUrl,
  fetchPyApiRaw,
  formatPyFetchErrorHint,
  forwardToPyApiAsTextResponse,
} from "@/lib/py-service-proxy";

/** Ops Desk BFF 转发：注入服务端 x-ops-secret，不暴露给浏览器。 */
export async function forwardOpsRequest(
  upstreamPath: string,
  init: { method: string; body?: BodyInit | null; headers?: HeadersInit },
): Promise<Response> {
  const secret = getOpsDeskSecret();
  if (!secret) {
    return Response.json(
      { ok: false, error: "服务端未配置 OPS_DESK_SECRET，无法转发 Ops Desk 请求" },
      { status: 503 },
    );
  }

  const headers = new Headers(init.headers);
  headers.set("x-ops-secret", secret);

  return forwardToPyApiAsTextResponse(upstreamPath, { ...init, headers }, { serviceLabel: "Ops Desk" });
}

/** 底层 fetch（连接失败抛出，供需特殊 catch 的 route 使用）。 */
export async function fetchOpsRaw(upstreamPath: string, init: { method: string; body?: BodyInit | null; headers?: HeadersInit }): Promise<Response> {
  const secret = getOpsDeskSecret();
  if (!secret) {
    return Response.json(
      { ok: false, error: "服务端未配置 OPS_DESK_SECRET，无法转发 Ops Desk 请求" },
      { status: 503 },
    );
  }

  const url = buildPyApiUrl(upstreamPath);
  const headers = new Headers(init.headers);
  headers.set("x-ops-secret", secret);

  try {
    return await fetchPyApiRaw(upstreamPath, { ...init, headers });
  } catch (error) {
    const detail = formatPyFetchErrorHint(error);
    return Response.json(
      { ok: false, error: "无法连接 Python Ops Desk 服务", detail: `${detail}；目标: ${url}` },
      { status: 503 },
    );
  }
}
