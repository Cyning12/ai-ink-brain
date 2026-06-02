import { createHmac, timingSafeEqual } from "node:crypto";

/** Portfolio 访客会话 Cookie（不含秘钥明文 · SPEC §4.3） */
export const PORTFOLIO_SESSION_COOKIE = "portfolio_visitor_session";

export type PortfolioRole = "visitor" | "visitor-admin";

const SESSION_VERSION = "v1";

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() !== name) continue;
    return part.slice(idx + 1).trim();
  }
  return null;
}

/** 签名密钥：双 env 拼接（服务端 only） */
function signingKey(): string | null {
  const v = (process.env.PORTFOLIO_VISITOR_SECRET ?? "").trim();
  const a = (process.env.PORTFOLIO_VISITOR_ADMIN_SECRET ?? "").trim();
  if (!v && !a) return null;
  return `${v}::${a}`;
}

export function portfolioSessionMaxAgeSec(role: PortfolioRole): number {
  return role === "visitor-admin" ? 60 * 60 * 24 : 60 * 60 * 72;
}

export function buildPortfolioSessionCookieValue(
  role: PortfolioRole,
  maxAgeSec: number,
): string | null {
  const key = signingKey();
  if (!key) return null;
  const exp = Math.floor(Date.now() / 1000) + maxAgeSec;
  const payload = `${SESSION_VERSION}:${role}:${exp}`;
  const sig = createHmac("sha256", key).update(payload).digest("base64url");
  return `${SESSION_VERSION}.${role}.${exp}.${sig}`;
}

export type ParsedPortfolioSession = {
  role: PortfolioRole;
  expiresAt: number;
};

export function parsePortfolioSessionCookie(
  cookieHeader: string | null,
): ParsedPortfolioSession | null {
  const raw = parseCookie(cookieHeader, PORTFOLIO_SESSION_COOKIE);
  const key = signingKey();
  if (!raw || !key) return null;
  const parts = raw.split(".");
  if (parts.length !== 4 || parts[0] !== SESSION_VERSION) return null;
  const role = parts[1];
  const exp = Number(parts[2]);
  const sig = parts[3];
  if (role !== "visitor" && role !== "visitor-admin") return null;
  if (!Number.isFinite(exp)) return null;
  const payload = `${SESSION_VERSION}:${role}:${exp}`;
  const expected = createHmac("sha256", key).update(payload).digest("base64url");
  if (!sig || sig.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  if (exp <= Math.floor(Date.now() / 1000)) return null;
  return { role, expiresAt: exp * 1000 };
}

export function portfolioSessionCookieHeader(
  value: string,
  maxAgeSec: number,
): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${PORTFOLIO_SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`;
}
