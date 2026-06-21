import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAdminApiSecret } from "@/lib/auth/admin-env";
import { getAdminTokenFromRequest } from "@/lib/auth/parse-admin-token";
import { getOpsDeskSecret } from "@/lib/auth/ops-env";
import {
  getOpsDeskTokenFromRequest,
  parseOpsDeskTokenCookie,
  resolveOpsDeskRole,
} from "@/lib/auth/ops-session";
import { parseSiteMode } from "@/lib/site-mode";

export async function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // site_mode=ops 时首页 302 → /ops/kimi-code
  if (
    pathname === "/" &&
    parseSiteMode(process.env.NEXT_PUBLIC_SITE_MODE) === "ops"
  ) {
    return NextResponse.redirect(new URL("/ops/kimi-code", request.url), 302);
  }

  // /api/chat 及其子路径保留原有管理员 Token 校验
  if (pathname === "/api/chat" || pathname.startsWith("/api/chat/")) {
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

  // Ops Desk 守卫：/ops/* 页面 + /api/ops/* BFF
  const isOpsPath =
    pathname === "/ops" ||
    pathname.startsWith("/ops/") ||
    pathname.startsWith("/api/ops/");

  if (isOpsPath) {
    const secret = getOpsDeskSecret();
    if (!secret) {
      return new NextResponse("OPS_DESK_SECRET 未配置，已拒绝访问 Ops Desk", {
        status: 503,
      });
    }

    // 登录页与登录 API 本身无需预认证
    if (pathname === "/ops/login" || pathname === "/api/ops/login") {
      return NextResponse.next();
    }

    const bearer = getOpsDeskTokenFromRequest(request);
    const roleFromBearer = bearer ? resolveOpsDeskRole(bearer) : null;
    const session = roleFromBearer
      ? { role: roleFromBearer }
      : await parseOpsDeskTokenCookie(request.headers.get("cookie"), secret);

    if (!session) {
      if (pathname.startsWith("/api/ops/")) {
        return NextResponse.json(
          { ok: false, error: "Unauthorized" },
          { status: 401 },
        );
      }
      return NextResponse.redirect(new URL("/ops/login", request.url), 302);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/api/chat",
    "/api/chat/:path*",
    "/ops/:path*",
    "/api/ops/:path*",
  ],
};
