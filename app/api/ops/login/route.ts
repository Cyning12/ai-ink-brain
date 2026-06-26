import {
  getOpsDeskAuthMode,
  getOpsDeskSecret,
  getOpsDeskSessionTtlSeconds,
  cookieMaxAgeSecFromExpiresAt,
} from "@/lib/auth/ops-env";
import { mapOpsDbLoginError } from "@/lib/auth/ops-login-error";
import {
  buildOpsDeskTokenCookieValue,
  opsDeskSessionCookieHeader,
  opsDeskTokenCookieHeader,
  resolveOpsDeskRole,
} from "@/lib/auth/ops-session";
import { fetchPyApiRaw } from "@/lib/py-service-proxy";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  let body: { token?: unknown };
  try {
    body = (await request.json()) as { token?: unknown };
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const rawToken = typeof body.token === "string" ? body.token.trim() : "";
  if (!rawToken) {
    return Response.json({ ok: false, error: "请提供 token" }, { status: 400 });
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
        return Response.json(
          {
            ok: false,
            error: mapOpsDbLoginError(detail, "登录失败"),
            code:
              detail && typeof (detail as { code?: unknown }).code === "string"
                ? (detail as { code: string }).code
                : undefined,
          },
          { status: upstream.status >= 400 ? upstream.status : 503 },
        );
      }
      const maxAge = cookieMaxAgeSecFromExpiresAt(payload.expires_at);
      return new Response(JSON.stringify({ ok: true, role: payload.role }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": opsDeskSessionCookieHeader(payload.session_id, maxAge),
        },
      });
    } catch {
      return Response.json(
        { ok: false, error: "无法连接 Python 鉴权服务" },
        { status: 503 },
      );
    }
  }

  const secret = getOpsDeskSecret();
  if (!secret) {
    return Response.json(
      { ok: false, error: "服务端未配置环境变量：OPS_DESK_SECRET" },
      { status: 503 },
    );
  }

  const role = resolveOpsDeskRole(rawToken);
  if (!role) {
    return Response.json({ ok: false, error: "Invalid token" }, { status: 401 });
  }

  const ttl = getOpsDeskSessionTtlSeconds();
  const cookieValue = await buildOpsDeskTokenCookieValue(role, secret, ttl);

  return new Response(JSON.stringify({ ok: true, role }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": opsDeskTokenCookieHeader(cookieValue, ttl),
    },
  });
}
