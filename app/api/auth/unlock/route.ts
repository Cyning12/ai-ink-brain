import { timingSafeEqual } from "node:crypto";
import {
  ADMIN_SESSION_COOKIE,
  buildAdminSessionCookieValue,
} from "@/lib/auth/admin-cookie";
import { getAdminApiSecret } from "@/lib/auth/admin-env";

export const runtime = "nodejs";

function sessionCookieHeader(value: string, maxAgeSec: number): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`;
}

/**
 * 校验管理员口令后设置 HttpOnly Cookie，供挂件等前端判断「已解锁」且不暴露密钥到 bundle。
 */
export async function POST(request: Request): Promise<Response> {
  const secret = getAdminApiSecret();
  if (!secret) {
    return Response.json(
      {
        ok: false,
        error: "未配置 NEXT_PUBLIC_ADMIN_SECRET（或 CHAT_API_SECRET）",
      },
      { status: 503 },
    );
  }

  let body: { secret?: unknown };
  try {
    body = (await request.json()) as { secret?: unknown };
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const given = typeof body.secret === "string" ? body.secret.trim() : "";
  if (given.length !== secret.length) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    if (
      !timingSafeEqual(Buffer.from(given, "utf8"), Buffer.from(secret, "utf8"))
    ) {
      return Response.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
  } catch {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const cookieValue = buildAdminSessionCookieValue(secret);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": sessionCookieHeader(cookieValue, 60 * 60 * 24 * 7),
    },
  });
}
