import {
  getOpsDeskAuthMode,
  getOpsDeskSecret,
  getOpsDeskSessionTtlSeconds,
  cookieMaxAgeSecFromExpiresAt,
} from "@/lib/auth/ops-env";
import { mapOpsDbLoginError } from "@/lib/auth/ops-login-error";
import {
  applyOpsDeskSessionCookie,
  applyOpsDeskTokenCookie,
  buildOpsDeskTokenCookieValue,
  resolveOpsDeskRole,
} from "@/lib/auth/ops-session";
import { fetchPyApiRaw } from "@/lib/py-service-proxy";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type LoginBody = { token?: unknown; redirect?: unknown };

function isFormLogin(request: Request): boolean {
  const contentType = request.headers.get("content-type") ?? "";
  return (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  );
}

async function parseLoginBody(request: Request): Promise<LoginBody> {
  if (isFormLogin(request)) {
    const form = await request.formData();
    return {
      token: form.get("token"),
      redirect: form.get("redirect"),
    };
  }
  try {
    return (await request.json()) as LoginBody;
  } catch {
    return {};
  }
}

function resolveRedirectPath(raw: unknown): string {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (value.startsWith("/ops/") && !value.startsWith("//")) {
    return value;
  }
  return "/ops/kimi-code";
}

function loginFailureResponse(
  request: Request,
  status: number,
  error: string,
  code?: string,
): Response {
  if (isFormLogin(request)) {
    const url = new URL("/ops/login", request.url);
    url.searchParams.set("error", "1");
    if (code) url.searchParams.set("code", code);
    return NextResponse.redirect(url, 303);
  }
  return Response.json(
    { ok: false, error, ...(code ? { code } : {}) },
    { status },
  );
}

export async function POST(request: Request): Promise<Response> {
  const body = await parseLoginBody(request);
  const rawToken = typeof body.token === "string" ? body.token.trim() : "";
  const redirectTo = resolveRedirectPath(body.redirect);

  if (!rawToken) {
    return loginFailureResponse(request, 400, "请提供 token");
  }

  if (getOpsDeskAuthMode() === "db") {
    try {
      const upstream = await fetchPyApiRaw("/api/py/ops/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rawToken }),
      });
      const payload = (await upstream.json()) as {
        ok?: boolean;
        session_id?: string;
        role?: "viewer" | "maintainer";
        expires_at?: string;
        error?: string;
        detail?: unknown;
      };
      if (!upstream.ok || !payload.session_id) {
        const detail =
          payload.detail && typeof payload.detail === "object" ? payload.detail : undefined;
        const code =
          detail && typeof (detail as { code?: unknown }).code === "string"
            ? (detail as { code: string }).code
            : undefined;
        return loginFailureResponse(
          request,
          upstream.status >= 400 ? upstream.status : 503,
          mapOpsDbLoginError(detail, "登录失败"),
          code,
        );
      }
      const maxAge = cookieMaxAgeSecFromExpiresAt(payload.expires_at);

      if (isFormLogin(request)) {
        const response = NextResponse.redirect(new URL(redirectTo, request.url), 303);
        applyOpsDeskSessionCookie(response, payload.session_id, maxAge);
        return response;
      }

      const jsonResponse = NextResponse.json({ ok: true, role: payload.role });
      applyOpsDeskSessionCookie(jsonResponse, payload.session_id, maxAge);
      return jsonResponse;
    } catch {
      return loginFailureResponse(request, 503, "无法连接 Python 鉴权服务");
    }
  }

  const secret = getOpsDeskSecret();
  if (!secret) {
    return loginFailureResponse(request, 503, "服务端未配置环境变量：OPS_DESK_SECRET");
  }

  const role = resolveOpsDeskRole(rawToken);
  if (!role) {
    return loginFailureResponse(request, 401, "Invalid token", "INVITE_INVALID");
  }

  const ttl = getOpsDeskSessionTtlSeconds();
  const cookieValue = await buildOpsDeskTokenCookieValue(role, secret, ttl);

  if (isFormLogin(request)) {
    const response = NextResponse.redirect(new URL(redirectTo, request.url), 303);
    applyOpsDeskTokenCookie(response, cookieValue, ttl);
    return response;
  }

  const jsonResponse = NextResponse.json({ ok: true, role });
  applyOpsDeskTokenCookie(jsonResponse, cookieValue, ttl);
  return jsonResponse;
}
