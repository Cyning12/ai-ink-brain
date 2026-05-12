import { ADMIN_SESSION_COOKIE } from "@/lib/auth/admin-cookie";
import { clearChatbiSiteSessionCookieHeader } from "@/lib/auth/chatbi-site-cookie";

export const runtime = "nodejs";

/** 清除 Ink 管理员与 ChatBI 站点 HttpOnly Cookie */
export async function POST(): Promise<Response> {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const clearedInk = `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
  const clearedChatbi = clearChatbiSiteSessionCookieHeader();
  const h = new Headers({ "Content-Type": "application/json" });
  h.append("Set-Cookie", clearedInk);
  h.append("Set-Cookie", clearedChatbi);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: h });
}
