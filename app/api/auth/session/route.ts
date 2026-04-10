import { verifyAdminSessionCookie } from "@/lib/auth/admin-cookie";
import { getAdminApiSecret } from "@/lib/auth/admin-env";

export const runtime = "nodejs";

/** 供前端判断当前是否持有有效管理员会话 Cookie（不含密钥本身） */
export async function GET(request: Request): Promise<Response> {
  const secret = getAdminApiSecret();
  if (!secret) {
    return Response.json({ ok: true, admin: false, configured: false });
  }
  const admin = verifyAdminSessionCookie(
    request.headers.get("cookie"),
    secret,
  );
  return Response.json({ ok: true, admin, configured: true });
}
