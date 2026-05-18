import { safeJson } from "@/lib/unified-chat/sse/safeJson";

/** 从 BFF / Python 非 2xx 响应体提取可读错误文案 */
export function pickChatbiErrorMessage(raw: string, status: number, statusText: string): string {
  const t = raw.trim();
  const j = safeJson(raw);
  if (j && typeof j === "object") {
    const obj = j as { detail?: unknown; error?: unknown };
    if (typeof obj.detail === "string" && obj.detail.trim()) return obj.detail.trim();
    if (typeof obj.error === "string" && obj.error.trim()) return obj.error.trim();
  }
  return t || `${status} ${statusText}`;
}
