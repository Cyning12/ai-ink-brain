/**
 * 从请求头解析管理员凭证：Authorization: Bearer … 或 x-blog-admin-token。
 */
export function getAdminTokenFromRequest(request: Request): string {
  const auth = request.headers.get("authorization");
  const bearer =
    auth?.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const headerToken = request.headers.get("x-blog-admin-token")?.trim() ?? "";
  return bearer || headerToken;
}
