/**
 * ChatBI 明文访问令牌：localStorage、BFF 头名、401 权限失败识别与整页回首页（与 Python `detail.code` 对齐）。
 */

export const LS_CHATBI_KEY = "chatbi_access_token_plain" as const;
/** unlock 成功后写入 sessionStorage，与 token 同清；刷新后缺失则 re-verify 补 level */
export const SS_CHATBI_ACCESS_LEVEL_KEY = "chatbi_access_level" as const;
/** 与 ChatPanel / Text2Sql / Chain 等一致：Ink 管理员口令本地缓存键 */
export const LS_INK_BLOG_ADMIN_KEY = "blog_admin_token" as const;
/** 兼容：仍可向 BFF 传 `X-ChatBI-Access-Token`；主路径为 `Authorization: Bearer <明文>`（与 Python `require_chatbi_principal` 一致） */
export const CHATBI_ACCESS_HEADER = "X-ChatBI-Access-Token" as const;

/** 401 响应体 `detail.code` 属于「权限校验失败」时：清空本地 token 并回首页（可继续追加后端约定码） */
export const CLIENT_PERMISSION_FAILURE_DETAIL_CODES = new Set<string>(["CHATBI_UNAUTHORIZED"]);

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/** 自 FastAPI 风格 JSON 提取 `detail.code`（对象形 detail） */
export function extractFastApiDetailCode(raw: string): string | null {
  const j = safeJson(raw.trim() || "{}");
  if (!j || typeof j !== "object" || Array.isArray(j)) return null;
  const detail = (j as Record<string, unknown>).detail;
  if (!detail || typeof detail !== "object" || Array.isArray(detail)) return null;
  const code = (detail as Record<string, unknown>).code;
  return typeof code === "string" ? code : null;
}

/** 是否为「须清 token 并回首页」的权限失败（与 Ink 泛 401 区分） */
export function isClientPermissionAuthFailure401(status: number, raw: string): boolean {
  if (status !== 401) return false;
  const code = extractFastApiDetailCode(raw);
  return code != null && CLIENT_PERMISSION_FAILURE_DETAIL_CODES.has(code);
}

/** 与 `isClientPermissionAuthFailure401(401, raw)` 等价，供旧代码按 body 判定 */
export function isChatbiUnauthorizedBody(raw: string): boolean {
  return isClientPermissionAuthFailure401(401, raw);
}

export function readChatbiToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS_CHATBI_KEY)?.trim() ?? "";
}

export function writeChatbiToken(plain: string): void {
  if (typeof window === "undefined") return;
  const t = plain.replace(/^bearer\s+/i, "").trim();
  if (!t) {
    localStorage.removeItem(LS_CHATBI_KEY);
    clearChatbiAccessLevel();
  } else localStorage.setItem(LS_CHATBI_KEY, t);
}

export function readChatbiAccessLevel(): number | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SS_CHATBI_ACCESS_LEVEL_KEY);
  if (raw == null || raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function writeChatbiAccessLevel(level: number): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SS_CHATBI_ACCESS_LEVEL_KEY, String(level));
}

export function clearChatbiAccessLevel(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SS_CHATBI_ACCESS_LEVEL_KEY);
}

/** 登出 ChatBI：清除明文 token 与 access_level，不影响 Ink 管理员密钥 */
export function clearChatbiToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_CHATBI_KEY);
  clearChatbiAccessLevel();
}

/** 清除 Ink 本地 admin token（与 Cookie 会话独立） */
export function clearInkAdminTokenLocal(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_INK_BLOG_ADMIN_KEY);
}

/** ChatBI + Ink 本地 LS 一并清除（权限失败回首页前调用） */
export function clearAllBrowserAuthTokens(): void {
  clearChatbiToken();
  clearInkAdminTokenLocal();
}

/** 若命中权限失败码：清 LS 并整页回 `/` */
export function handleBrowser401AuthFailureAndMaybeRedirect(status: number, raw: string): void {
  if (typeof window === "undefined") return;
  if (!isClientPermissionAuthFailure401(status, raw)) return;
  clearAllBrowserAuthTokens();
  window.location.assign("/");
}

export type FetchWithAuthRecoveryInit = RequestInit & {
  /** 为 true 时不因 401+权限码跳转（如解锁页显式校验、登录前探活） */
  skipAuth401HomeRedirect?: boolean;
};

/**
 * 对 `fetch` 的薄封装：401 时读 body，若 `detail.code` 为权限失败约定码，则清空本地 token 并回首页。
 * 仍返回原始 `Response`（body 未被消费），便于调用方继续 `res.json()` / `res.body`。
 */
export async function fetchWithAuthRecovery(
  input: RequestInfo | URL,
  init?: FetchWithAuthRecoveryInit,
): Promise<Response> {
  const { skipAuth401HomeRedirect, ...fetchInit } = init ?? {};
  const res = await fetch(input, fetchInit);
  if (res.status !== 401 || skipAuth401HomeRedirect === true || typeof window === "undefined") {
    return res;
  }
  let raw = "";
  try {
    raw = await res.clone().text();
  } catch {
    return res;
  }
  handleBrowser401AuthFailureAndMaybeRedirect(401, raw);
  return res;
}

export type ChatbiUnlockResult =
  | { ok: true; access_level: number; principal_kind: string; token_id: string }
  | { ok: false; message: string };

/**
 * 假登录：仅校验 ChatBI DB 明文（BFF 不再要求 Ink env）；成功则调用方自行 `writeChatbiToken` + 更新 React state。
 */
export async function requestChatbiAccessVerify(args: {
  plain: string;
}): Promise<ChatbiUnlockResult> {
  const plain = args.plain.replace(/^bearer\s+/i, "").trim();
  if (!plain) return { ok: false, message: "请输入 ChatBI 明文 token" };
  try {
    const r = await fetchWithAuthRecovery("/api/py/chatbi/access/verify", {
      method: "GET",
      credentials: "include",
      skipAuth401HomeRedirect: true,
      headers: {
        Authorization: `Bearer ${plain}`,
      },
    });
    const raw = await r.text().catch(() => "");
    if (r.status === 401) {
      if (isClientPermissionAuthFailure401(401, raw)) {
        return { ok: false, message: "ChatBI token 无效、已过期或已吊销" };
      }
      return { ok: false, message: "未授权（401）" };
    }
    if (!r.ok) {
      const j = safeJson(raw) as Record<string, unknown> | null;
      const err =
        (j && typeof j.error === "string" && j.error.trim()) ||
        raw.trim() ||
        `${r.status} ${r.statusText}`;
      return { ok: false, message: err };
    }
    const j = safeJson(raw) as Record<string, unknown> | null;
    if (!j || j.ok !== true) {
      return { ok: false, message: raw.trim() || "响应格式异常" };
    }
    const access_level = typeof j.access_level === "number" ? j.access_level : -1;
    const principal_kind = typeof j.principal_kind === "string" ? j.principal_kind : "";
    const token_id = typeof j.token_id === "string" ? j.token_id : "";
    return { ok: true, access_level, principal_kind, token_id };
  } catch {
    return { ok: false, message: "网络异常，请稍后重试" };
  }
}
