import { ADMIN_SESSION_COOKIE } from "@/lib/auth/admin-cookie";

export const runtime = "nodejs";

/** 清除管理员 HttpOnly 会话 Cookie */
export async function POST(): Promise<Response> {
  const secure =
    process.env.NODE_ENV === "production" ? "; Secure" : "";
  const cleared = `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cleared,
    },
  });
}
