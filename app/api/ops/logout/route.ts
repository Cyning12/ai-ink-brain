import { getOpsDeskAuthMode } from "@/lib/auth/ops-env";
import {
  opsDeskLogoutCookieHeader,
  opsDeskSessionLogoutCookieHeader,
} from "@/lib/auth/ops-session";
import { fetchPyApiRaw } from "@/lib/py-service-proxy";

export const runtime = "nodejs";

function parseSessionCookie(header: string | null): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() !== "ops_desk_session") continue;
    return part.slice(idx + 1).trim();
  }
  return null;
}

export async function POST(request: Request): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (getOpsDeskAuthMode() === "db") {
    const sessionId = parseSessionCookie(request.headers.get("cookie"));
    if (sessionId) {
      try {
        await fetchPyApiRaw("/api/py/ops/auth/logout", {
          method: "POST",
          headers: { "x-ops-session": sessionId },
        });
      } catch {
        // 本地 Python 不可达时仍清 Cookie
      }
    }
    headers["Set-Cookie"] = opsDeskSessionLogoutCookieHeader();
  } else {
    headers["Set-Cookie"] = opsDeskLogoutCookieHeader();
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
