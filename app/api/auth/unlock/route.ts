import { timingSafeEqual } from "node:crypto";
import {
  ADMIN_SESSION_COOKIE,
  buildAdminSessionCookieValue,
} from "@/lib/auth/admin-cookie";
import {
  buildChatbiSiteSessionCookieHeader,
  encodeChatbiTokenForCookie,
} from "@/lib/auth/chatbi-site-cookie";
import { getAdminApiSecret } from "@/lib/auth/admin-env";
import { verifyChatbiPlainUpstream } from "@/lib/server/chatbi-access-verify-upstream";

export const runtime = "nodejs";

function adminSessionCookieHeader(value: string, maxAgeSec: number): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`;
}

function setChatbiSessionResponse(plain: string): Response {
  const encoded = encodeChatbiTokenForCookie(plain);
  const maxAge = 60 * 60 * 24 * 7;
  return new Response(JSON.stringify({ ok: true, mode: "chatbi" as const }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": buildChatbiSiteSessionCookieHeader(encoded, maxAge),
    },
  });
}

function setInkSessionResponse(inkSecret: string): Response {
  const cookieValue = buildAdminSessionCookieValue(inkSecret);
  return new Response(JSON.stringify({ ok: true, mode: "ink" as const }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": adminSessionCookieHeader(cookieValue, 60 * 60 * 24 * 7),
    },
  });
}

/**
 * 解锁：
 * - `token`：仅走 ChatBI（Python verify）。
 * - `secret`：若配置了 Ink 密钥且长度一致且 timingSafe 匹配则走 Ink；否则再走 ChatBI verify（兼容旧表单只传 secret）。
 */
export async function POST(request: Request): Promise<Response> {
  let body: { token?: unknown; secret?: unknown };
  try {
    body = (await request.json()) as { token?: unknown; secret?: unknown };
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const tokenField = typeof body.token === "string" ? body.token.trim() : "";
  const secretField = typeof body.secret === "string" ? body.secret.trim() : "";

  if (tokenField) {
    const ok = await verifyChatbiPlainUpstream(tokenField);
    if (!ok) {
      return Response.json(
        { ok: false, error: "ChatBI token 无效或无法连接校验服务" },
        { status: 401 },
      );
    }
    return setChatbiSessionResponse(tokenField);
  }

  const inkSecret = getAdminApiSecret();
  if (secretField && inkSecret && secretField.length === inkSecret.length) {
    try {
      if (timingSafeEqual(Buffer.from(secretField, "utf8"), Buffer.from(inkSecret, "utf8"))) {
        return setInkSessionResponse(inkSecret);
      }
    } catch {
      /* 长度一致但比对异常时落入 ChatBI 尝试 */
    }
  }

  if (secretField) {
    const ok = await verifyChatbiPlainUpstream(secretField);
    if (!ok) {
      return Response.json(
        { ok: false, error: "ChatBI token 无效或无法连接校验服务" },
        { status: 401 },
      );
    }
    return setChatbiSessionResponse(secretField);
  }

  return Response.json(
    { ok: false, error: "请提供 token（ChatBI 明文）或 secret（Ink 或 ChatBI）" },
    { status: 400 },
  );
}
