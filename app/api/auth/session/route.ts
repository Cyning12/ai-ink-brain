import { verifyAdminSessionCookie } from "@/lib/auth/admin-cookie";
import { getAdminApiSecret } from "@/lib/auth/admin-env";
import { hasChatbiAdminSession } from "@/lib/auth/require-sync-admin-access";

export const runtime = "nodejs";

/** 供前端判断「管理入口可见」：Ink 管理员 Cookie 或 ChatBI 站点 HttpOnly Cookie 且上游仍有效 */
export async function GET(request: Request): Promise<Response> {
  const ink = getAdminApiSecret();
  let admin = false;
  if (ink && verifyAdminSessionCookie(request.headers.get("cookie"), ink)) {
    admin = true;
  }
  if (!admin && (await hasChatbiAdminSession(request))) {
    admin = true;
  }
  const configured =
    Boolean(ink) ||
    Boolean((process.env.PY_API_URL ?? "").trim()) ||
    process.env.NODE_ENV === "development";
  return Response.json({ ok: true, admin, configured });
}
