import {
  buildOpsDeskTokenCookieValue,
  opsDeskTokenCookieHeader,
  resolveOpsDeskRole,
} from "@/lib/auth/ops-session";
import {
  getOpsDeskSecret,
  getOpsDeskSessionTtlSeconds,
} from "@/lib/auth/ops-env";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  const secret = getOpsDeskSecret();
  if (!secret) {
    return Response.json(
      { ok: false, error: "服务端未配置环境变量：OPS_DESK_SECRET" },
      { status: 503 },
    );
  }

  let body: { token?: unknown };
  try {
    body = (await request.json()) as { token?: unknown };
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const rawToken = typeof body.token === "string" ? body.token.trim() : "";
  if (!rawToken) {
    return Response.json(
      { ok: false, error: "请提供 token" },
      { status: 400 },
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
