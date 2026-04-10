import { createClient } from "@supabase/supabase-js";

/**
 * 服务端 Supabase 客户端所需环境变量（按优先级尝试）：
 * - URL：`NEXT_PUBLIC_SUPABASE_URL` 或 `SUPABASE_URL`（与 Vercel/CLI 模板对齐）
 * - 密钥：`SUPABASE_SERVICE_ROLE_KEY` 或 `SUPABASE_SERVICE_KEY`
 *
 * 须使用 Dashboard → Project Settings → API 中的 **service_role** secret；
 * 勿使用 anon public key。`.env.local` 会覆盖 `.env`，排查时注意是否填错文件。
 */
function pickSupabaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "Missing required env: NEXT_PUBLIC_SUPABASE_URL（或兼容 SUPABASE_URL）",
    );
  }
  return url;
}

function stripBearer(value: string): string {
  return value.replace(/^Bearer\s+/i, "").trim();
}

type JwtPayload = { role?: string; ref?: string };

/** 仅解析 JWT payload，不做签名校验；用于区分误填的 anon key 与 URL/项目不一致 */
function decodeJwtPayloadUnsafe(jwt: string): JwtPayload | null {
  try {
    const [, payloadB64] = jwt.split(".");
    if (!payloadB64) return null;
    const b64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const json = Buffer.from(pad, "base64").toString("utf8");
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function projectRefFromSupabaseUrl(url: string): string | null {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (!host.endsWith(".supabase.co")) return null;
    return host.replace(/\.supabase\.co$/i, "") || null;
  } catch {
    return null;
  }
}

function pickServiceRoleKey(): { key: string; payload: JwtPayload | null } {
  const raw =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_KEY?.trim();
  if (!raw) {
    throw new Error(
      "Missing required env: SUPABASE_SERVICE_ROLE_KEY（或兼容 SUPABASE_SERVICE_KEY）",
    );
  }
  const key = stripBearer(raw);
  const payload = decodeJwtPayloadUnsafe(key);
  if (payload?.role === "anon") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY 当前是 anon（public）密钥。服务端写入必须使用同一页中的 service_role secret（更长、权限更高），不要用 anon key。",
    );
  }
  return { key, payload };
}

export function createSupabaseServerClient() {
  const url = pickSupabaseUrl();
  const { key: serviceRoleKey, payload } = pickServiceRoleKey();
  const hostRef = projectRefFromSupabaseUrl(url);
  if (payload?.ref && hostRef && payload.ref !== hostRef) {
    throw new Error(
      `Supabase URL 子域「${hostRef}」与 service_role JWT 内 ref「${payload.ref}」不一致，请从同一项目的 Settings → API 复制 Project URL 与 service_role。`,
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
