/**
 * 管理员 API 密钥：优先 NEXT_PUBLIC_ADMIN_SECRET，兼容旧名 CHAT_API_SECRET。
 * 纯环境读取，可在 Edge Middleware 中安全导入。
 */
export function getAdminApiSecret(): string | undefined {
  const primary = process.env.NEXT_PUBLIC_ADMIN_SECRET?.trim();
  const legacy = process.env.CHAT_API_SECRET?.trim();
  return primary || legacy || undefined;
}
