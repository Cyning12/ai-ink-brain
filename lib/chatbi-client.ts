/**
 * ChatBI 明文访问令牌：localStorage、BFF 头名、401 自动登出判定（与 Python `CHATBI_UNAUTHORIZED` 对齐）。
 */

export const LS_CHATBI_KEY = "chatbi_access_token_plain" as const;
/** 兼容：仍可向 BFF 传 `X-ChatBI-Access-Token`；主路径为 `Authorization: Bearer <明文>`（与 Python `require_chatbi_principal` 一致） */
export const CHATBI_ACCESS_HEADER = "X-ChatBI-Access-Token" as const;

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/** 解析响应体：是否为 Python ChatBI 鉴权失败（须清除本地 token，与 Ink 管理员 401 区分） */
export function isChatbiUnauthorizedBody(raw: string): boolean {
  const j = safeJson(raw.trim() || "{}");
  if (!j || typeof j !== "object" || Array.isArray(j)) return false;
  const detail = (j as Record<string, unknown>).detail;
  if (!detail || typeof detail !== "object" || Array.isArray(detail)) return false;
  const code = (detail as Record<string, unknown>).code;
  return code === "CHATBI_UNAUTHORIZED";
}

export function readChatbiToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS_CHATBI_KEY)?.trim() ?? "";
}

export function writeChatbiToken(plain: string): void {
  if (typeof window === "undefined") return;
  const t = plain.replace(/^bearer\s+/i, "").trim();
  if (!t) localStorage.removeItem(LS_CHATBI_KEY);
  else localStorage.setItem(LS_CHATBI_KEY, t);
}

/** 登出 ChatBI：仅清除明文 token，不影响 Ink 管理员密钥 */
export function clearChatbiToken(): void {
  writeChatbiToken("");
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
    const r = await fetch("/api/py/chatbi/access/verify", {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${plain}`,
      },
    });
    const raw = await r.text().catch(() => "");
    if (r.status === 401) {
      if (isChatbiUnauthorizedBody(raw)) {
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
