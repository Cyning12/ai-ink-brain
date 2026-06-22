import { opsDeskLogoutCookieHeader } from "@/lib/auth/ops-session";

export const runtime = "nodejs";

export async function POST(): Promise<Response> {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": opsDeskLogoutCookieHeader(),
    },
  });
}
