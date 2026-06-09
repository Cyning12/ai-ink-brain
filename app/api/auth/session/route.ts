import { verifyAdminSessionCookie } from "@/lib/auth/admin-cookie";
import { getAdminApiSecret } from "@/lib/auth/admin-env";
import { isPyApiUrlConfigured } from "@/lib/py-service-proxy";
import {
  decodeChatbiTokenFromCookie,
  readChatbiSiteCookieRaw,
} from "@/lib/auth/chatbi-site-cookie";
import { verifyChatbiPlainUpstream } from "@/lib/server/chatbi-access-verify-upstream";

export const runtime = "nodejs";

/** 供前端判断「管理入口可见」：Ink 管理员 Cookie 或 ChatBI 站点 HttpOnly Cookie 且上游仍有效 */
export async function GET(request: Request): Promise<Response> {
  const ink = getAdminApiSecret();
  let admin = false;
  if (ink && verifyAdminSessionCookie(request.headers.get("cookie"), ink)) {
    admin = true;
  }
  if (!admin) {
    const raw = readChatbiSiteCookieRaw(request.headers.get("cookie"));
    if (raw) {
      const plain = decodeChatbiTokenFromCookie(raw);
      if (plain && (await verifyChatbiPlainUpstream(plain))) {
        admin = true;
      }
    }
  }
  const configured =
    Boolean(ink) ||
    isPyApiUrlConfigured() ||
    process.env.NODE_ENV === "development";
  return Response.json({ ok: true, admin, configured });
}
