import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAdminApiSecret } from "@/lib/auth/admin-env";
import { getOpsDeskAuthMode, getOpsDeskSecret } from "@/lib/auth/ops-env";
import { getAdminTokenFromRequest } from "@/lib/auth/parse-admin-token";
import {
  getOpsDeskSessionFromRequest,
  getOpsDeskTokenFromRequest,
  OPS_DESK_SESSION_COOKIE,
  parseOpsDeskTokenCookie,
  resolveOpsDeskRole,
} from "@/lib/auth/ops-session";
import { parseSiteMode } from "@/lib/site-mode";

const OPS_PUBLIC_PATHS = new Set([
  "/ops/login",
  "/api/ops/login",
  "/api/ops/logout",
]);

async function resolveOpsMiddlewareSession(
  request: NextRequest,
): Promise<{ role: "viewer" | "maintainer" } | null> {
  if (getOpsDeskAuthMode() === "db") {
    return getOpsDeskSessionFromRequest(request, "");
  }

  const secret = getOpsDeskSecret();
  if (!secret) {
    return null;
  }

  const bearer = getOpsDeskTokenFromRequest(request);
  const roleFromBearer = bearer ? resolveOpsDeskRole(bearer) : null;
  if (roleFromBearer) {
    return { role: roleFromBearer };
  }

  return parseOpsDeskTokenCookie(request.headers.get("cookie"), secret);
}

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
    // db 模式：不强制前端 OPS_DESK_SECRET；legacy 仍依赖
    if (getOpsDeskAuthMode() !== "db") {
      const secret = getOpsDeskSecret();
      if (!secret) {
        return new NextResponse("OPS_DESK_SECRET 未配置，已拒绝访问 Ops Desk", {
          status: 503,
        });
      }
    }

    if (OPS_PUBLIC_PATHS.has(pathname)) {
      return NextResponse.next();
    }

    const session = await resolveOpsMiddlewareSession(request);

    if (!session) {
      if (pathname.startsWith("/api/ops/")) {
        const res = NextResponse.json(
          { ok: false, error: "Unauthorized", code: "SESSION_EXPIRED" },
          { status: 401 },
        );
        if (getOpsDeskAuthMode() === "db") {
          res.cookies.set(OPS_DESK_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
        }
        return res;
      }
      const res = NextResponse.redirect(
        new URL("/ops/login?expired=1", request.url),
        302,
      );
      if (getOpsDeskAuthMode() === "db") {
        res.cookies.set(OPS_DESK_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
      }
      return res;
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
