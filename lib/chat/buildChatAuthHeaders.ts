/**
 * Chat / RAG 客户端请求：从 ChatBI 明文 token 构建 Authorization 头（F-11 共享）。
 */

/** 将 localStorage 中的 ChatBI 明文转为 Bearer Authorization 头 */
export function buildChatbiBearerHeaders(
  chatbiToken: string,
): Record<string, string> {
  const c = chatbiToken.replace(/^bearer\s+/i, "").trim();
  if (!c) return {};
  return { Authorization: `Bearer ${c}` };
}

/** Ink 管理员本地 token + ChatBI 明文合并（ChatPanel 等双轨场景） */
export function buildInkAndChatbiHeaders(args: {
  inkAdminToken?: string;
  chatbiToken?: string;
}): Record<string, string> {
  const headers: Record<string, string> = {};
  const ink = args.inkAdminToken?.replace(/^bearer\s+/i, "").trim();
  const chatbi = args.chatbiToken?.replace(/^bearer\s+/i, "").trim();
  if (chatbi) {
    headers.Authorization = `Bearer ${chatbi}`;
  } else if (ink) {
    headers.Authorization = `Bearer ${ink}`;
  }
  const xBlog = ink ?? "";
  if (xBlog) headers["x-blog-admin-token"] = xBlog;
  return headers;
}
