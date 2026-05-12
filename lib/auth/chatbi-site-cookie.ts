/** HttpOnly：首页解锁通过后写入，供 `/api/auth/session` 识别「可访问管理入口页」 */
export const CHATBI_SITE_SESSION_COOKIE = "chatbi_site_bearer";

export function encodeChatbiTokenForCookie(plain: string): string {
  return Buffer.from(plain, "utf8").toString("base64url");
}

export function decodeChatbiTokenFromCookie(encoded: string): string | null {
  try {
    const s = decodeURIComponent(encoded.trim());
    if (!s) return null;
    return Buffer.from(s, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k !== name) continue;
    return part.slice(idx + 1).trim();
  }
  return null;
}

export function readChatbiSiteCookieRaw(cookieHeader: string | null): string | null {
  return parseCookie(cookieHeader, CHATBI_SITE_SESSION_COOKIE);
}

export function buildChatbiSiteSessionCookieHeader(encodedValue: string, maxAgeSec: number): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const v = encodeURIComponent(encodedValue);
  return `${CHATBI_SITE_SESSION_COOKIE}=${v}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`;
}

export function clearChatbiSiteSessionCookieHeader(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${CHATBI_SITE_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
