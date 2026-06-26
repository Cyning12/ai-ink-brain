/** db 模式登录错误：用户可见简短文案 */
export function mapOpsDbLoginError(detail: unknown, fallback = "登录失败"): string {
  if (!detail || typeof detail !== "object") {
    return fallback;
  }
  const code = (detail as { code?: unknown }).code;
  if (code === "INVITE_EXPIRED") {
    return "秘钥已过期";
  }
  if (code === "INVITE_INVALID" || code === "INVITE_REVOKED") {
    return "秘钥无效";
  }
  const message = (detail as { message?: unknown }).message;
  if (typeof message === "string" && message.trim()) {
    return message;
  }
  return fallback;
}
