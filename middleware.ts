import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAdminApiSecret } from "@/lib/auth/admin-env";
import { getAdminTokenFromRequest } from "@/lib/auth/parse-admin-token";

/**
 * /api/chat 及其子路径需携带与 NEXT_PUBLIC_ADMIN_SECRET（或兼容 CHAT_API_SECRET）一致的凭证。
 * 支持：Authorization: Bearer <secret> 或请求头 x-blog-admin-token: <secret>
 */
export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return NextResponse.next();
  }

  const secret = getAdminApiSecret();
  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "NEXT_PUBLIC_ADMIN_SECRET（或 CHAT_API_SECRET）未配置，已拒绝访问 /api/chat",
      },
      { status: 503 },
    );
  }

  const token = getAdminTokenFromRequest(request);

  if (token !== secret) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

export const config = {
  // 同时覆盖 /api/chat 与任意子路径
  matcher: ["/api/chat", "/api/chat/:path*"],
};
