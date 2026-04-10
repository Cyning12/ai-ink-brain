/**
 * 校验管理员密钥：仅使用 NEXT_PUBLIC_ADMIN_SECRET（与教程一致）。
 * 支持 Authorization: <secret> 或 Authorization: Bearer <secret>。
 */
export function requireNextPublicAdminSecret(request: Request): Response | null {
  const expected = process.env.NEXT_PUBLIC_ADMIN_SECRET?.trim();
  if (!expected) {
    return Response.json(
      { ok: false, error: "服务端未配置环境变量 NEXT_PUBLIC_ADMIN_SECRET" },
      { status: 500 },
    );
  }

  const raw = request.headers.get("authorization")?.trim() ?? "";
  const token = raw.startsWith("Bearer ") ? raw.slice(7).trim() : raw;

  if (token !== expected && raw !== expected) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
