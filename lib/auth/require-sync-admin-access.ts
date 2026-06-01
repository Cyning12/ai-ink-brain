import { timingSafeEqual } from "node:crypto";
import { validateAdmin } from "@/lib/auth";
import {
  decodeChatbiTokenFromCookie,
  readChatbiSiteCookieRaw,
} from "@/lib/auth/chatbi-site-cookie";
import { getSyncAdminSecret } from "@/lib/auth/sync-admin-env";
import { verifyChatbiPlainUpstream } from "@/lib/server/chatbi-access-verify-upstream";

function tokensMatch(token: string, expected: string): boolean {
  if (!token || token.length !== expected.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(token, "utf8"),
      Buffer.from(expected, "utf8"),
    );
  } catch {
    return false;
  }
}

function bearerFromRequest(request: Request): string {
  const raw = request.headers.get("authorization")?.trim() ?? "";
  if (raw.toLowerCase().startsWith("bearer ")) return raw.slice(7).trim();
  return raw;
}

/** ChatBI 站点 HttpOnly Cookie 且上游 verify 仍有效（与 /api/auth/session admin 同口径） */
export async function hasChatbiAdminSession(request: Request): Promise<boolean> {
  const raw = readChatbiSiteCookieRaw(request.headers.get("cookie"));
  if (!raw) return false;
  const plain = decodeChatbiTokenFromCookie(raw);
  if (!plain) return false;
  return verifyChatbiPlainUpstream(plain);
}

/**
 * admin/sync · admin/ingest 入站鉴权：
 * 1. ChatBI admin 会话 Cookie（SystemStatus · 与 session.admin 一致）
 * 2. validateAdmin · Ink Legacy Cookie / Bearer
 * 3. Authorization: Bearer / x-admin-token · 维护者 curl（SYNC_ADMIN_SECRET · 可选）
 */
export async function requireSyncAdminAccess(
  request: Request,
): Promise<Response | null> {
  if (await hasChatbiAdminSession(request)) return null;

  if (validateAdmin(request)) return null;

  const expected = getSyncAdminSecret();
  if (expected) {
    const bearer = bearerFromRequest(request);
    if (tokensMatch(bearer, expected)) return null;

    const xAdmin = request.headers.get("x-admin-token")?.trim() ?? "";
    if (xAdmin && tokensMatch(xAdmin, expected)) return null;
  }

  return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
}
