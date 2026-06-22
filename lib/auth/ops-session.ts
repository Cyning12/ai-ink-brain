import {
  getOpsDeskDemoToken,
  getOpsDeskMaintainerSecret,
  getOpsDeskSecret,
} from "@/lib/auth/ops-env";

export const OPS_DESK_TOKEN_COOKIE = "ops_desk_token";

export type OpsDeskRole = "viewer" | "maintainer";

export type ParsedOpsDeskSession = {
  role: OpsDeskRole;
  expiresAt?: number;
};

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function hmacSign(message: string, secret: string): Promise<string> {
  const key = await importHmacKey(secret);
  const buf = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

async function hmacVerify(
  message: string,
  signatureB64: string,
  secret: string,
): Promise<boolean> {
  try {
    const key = await importHmacKey(secret);
    const sig = Uint8Array.from(atob(signatureB64), (c) => c.charCodeAt(0));
    return crypto.subtle.verify("HMAC", key, sig, new TextEncoder().encode(message));
  } catch {
    return false;
  }
}

function constantTimeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** 从请求头读取 Bearer token（不含 Cookie）。 */
export function getOpsDeskTokenFromRequest(request: Request): string {
  const auth = request.headers.get("authorization")?.trim() ?? "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return "";
}

/** 判断一次性 token 对应角色；demo token 仅 viewer。 */
export function resolveOpsDeskRole(rawToken: string): OpsDeskRole | null {
  if (!rawToken) return null;
  const viewer = getOpsDeskSecret();
  const maintainer = getOpsDeskMaintainerSecret();
  const demo = getOpsDeskDemoToken();

  if (maintainer && constantTimeEq(rawToken, maintainer)) return "maintainer";
  if (viewer && constantTimeEq(rawToken, viewer)) {
    // 未设 maintainer 专属秘钥时，viewer 秘钥也具备 maintainer 能力
    return maintainer ? "viewer" : "maintainer";
  }
  if (demo && constantTimeEq(rawToken, demo)) return "viewer";
  return null;
}

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

/** 签发 HttpOnly Cookie 值；ttlSeconds 未传时使用 session cookie。 */
export async function buildOpsDeskTokenCookieValue(
  role: OpsDeskRole,
  secret: string,
  ttlSeconds?: number,
): Promise<string> {
  const exp = ttlSeconds ? Math.floor(Date.now() / 1000) + ttlSeconds : 0;
  const payload = `${role}:${exp}`;
  const sig = await hmacSign(payload, secret);
  return `${payload}:${sig}`;
}

/** 解析并校验 Cookie。 */
export async function parseOpsDeskTokenCookie(
  cookieHeader: string | null,
  secret: string,
): Promise<ParsedOpsDeskSession | null> {
  const raw = parseCookie(cookieHeader, OPS_DESK_TOKEN_COOKIE);
  if (!raw) return null;
  const parts = raw.split(":");
  if (parts.length !== 3) return null;

  const role = parts[0];
  const exp = Number(parts[1]);
  const sig = parts[2];
  if (role !== "viewer" && role !== "maintainer") return null;
  if (!Number.isFinite(exp)) return null;
  if (exp !== 0 && exp <= Math.floor(Date.now() / 1000)) return null;

  const payload = `${role}:${exp}`;
  const ok = await hmacVerify(payload, sig, secret);
  if (!ok) return null;
  return { role, expiresAt: exp === 0 ? undefined : exp * 1000 };
}

/** 优先 Bearer token（适合 curl），其次 Cookie。 */
export async function getOpsDeskSessionFromRequest(
  request: Request,
  secret: string,
): Promise<ParsedOpsDeskSession | null> {
  const bearer = getOpsDeskTokenFromRequest(request);
  if (bearer) {
    const role = resolveOpsDeskRole(bearer);
    if (role) return { role };
  }
  return parseOpsDeskTokenCookie(request.headers.get("cookie"), secret);
}

/** 路由级二次校验；返回 Response 表示拒绝，null 表示通过。 */
export async function requireOpsDeskAccess(
  request: Request,
): Promise<Response | null> {
  const secret = getOpsDeskSecret();
  if (!secret) {
    return Response.json(
      { ok: false, error: "服务端未配置环境变量：OPS_DESK_SECRET" },
      { status: 503 },
    );
  }
  const session = await getOpsDeskSessionFromRequest(request, secret);
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function requireOpsDeskMaintainer(
  request: Request,
): Promise<Response | null> {
  const secret = getOpsDeskSecret();
  if (!secret) {
    return Response.json(
      { ok: false, error: "服务端未配置环境变量：OPS_DESK_SECRET" },
      { status: 503 },
    );
  }
  const session = await getOpsDeskSessionFromRequest(request, secret);
  if (!session || session.role !== "maintainer") {
    return Response.json(
      { ok: false, error: "Forbidden: maintainer required" },
      { status: 403 },
    );
  }
  return null;
}

export function opsDeskTokenCookieHeader(
  value: string,
  ttlSeconds?: number,
): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const maxAge = ttlSeconds ? `; Max-Age=${ttlSeconds}` : "";
  return `${OPS_DESK_TOKEN_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax${maxAge}${secure}`;
}

export function opsDeskLogoutCookieHeader(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${OPS_DESK_TOKEN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
