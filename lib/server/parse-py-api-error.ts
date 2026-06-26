/** 解析 Python FastAPI 错误体为可读文案。 */
export function parsePyApiErrorBody(body: unknown, fallback = "请求失败"): string {
  if (!body || typeof body !== "object") {
    return fallback;
  }
  const record = body as Record<string, unknown>;
  if (typeof record.error === "string" && record.error.trim()) {
    return record.error;
  }
  const detail = record.detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  if (detail && typeof detail === "object") {
    const message = (detail as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
    const code = (detail as { code?: unknown }).code;
    if (typeof code === "string" && code.trim()) {
      return code;
    }
  }
  return fallback;
}
