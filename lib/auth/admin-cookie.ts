import { createHmac, timingSafeEqual } from "node:crypto";

/** HttpOnly 会话 Cookie 名：值由管理员密钥派生，不包含明文口令 */
export const ADMIN_SESSION_COOKIE = "blog_admin_verified";

export function buildAdminSessionCookieValue(adminSecret: string): string {
  return createHmac("sha256", adminSecret)
    .update("ai-ink-brain-admin-v1")
    .digest("base64url");
}

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  const parts = header.split(";");
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k !== name) continue;
    return part.slice(idx + 1).trim();
  }
  return null;
}

export function verifyAdminSessionCookie(
  cookieHeader: string | null,
  adminSecret: string,
): boolean {
  const value = parseCookie(cookieHeader, ADMIN_SESSION_COOKIE);
  const expected = buildAdminSessionCookieValue(adminSecret);
  if (!value || value.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
  } catch {
    return false;
  }
}
