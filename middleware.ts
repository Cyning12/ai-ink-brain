import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAdminApiSecret } from "@/lib/auth/admin-env";
import { getOpsDeskAuthMode, getOpsDeskSecret } from "@/lib/auth/ops-env";
import { getAdminTokenFromRequest } from "@/lib/auth/parse-admin-token";
import {
  getOpsDeskTokenFromRequest,
  lookupOpsDeskSession,
  OPS_DESK_SESSION_COOKIE,
  OPS_DESK_TOKEN_COOKIE,
  parseOpsDeskTokenCookie,
  resolveOpsDeskRole,
} from "@/lib/auth/ops-session";
import { parseSiteMode } from "@/lib/site-mode";

const OPS_PUBLIC_PATHS = new Set([
  "/ops/login",
  "/api/ops/login",
  "/api/ops/logout",
]);

/** 探活接口由 Route Handler 判定 401/503，middleware 不拦截、不清 Cookie */
const OPS_MIDDLEWARE_BYPASS_PATHS = new Set(["/api/ops/auth/session"]);

/** RSC / prefetch 不应 302 到登录页，否则会劫持表单 303 后的软导航。 */
function isOpsSoftNavigationRequest(request: NextRequest): boolean {
  return (
    request.headers.get("RSC") === "1" ||
    request.headers.get("Next-Router-Prefetch") === "1" ||
    request.headers.get("Purpose") === "prefetch"
  );
}

function isOpsPageDocumentRequest(request: NextRequest): boolean {
  return request.headers.get("sec-fetch-dest") === "document";
}

async function resolveOpsMiddlewareSession(
  request: NextRequest,
): Promise<
  | { kind: "ok"; role: "viewer" | "maintainer" }
  | { kind: "deny" }
  | { kind: "unavailable" }
> {
  if (getOpsDeskAuthMode() === "db") {
    const lookup = await lookupOpsDeskSession(request, "");
    if (lookup.status === "authenticated") {
      return { kind: "ok", role: lookup.session.role };
    }
    if (lookup.status === "unavailable") {
      return { kind: "unavailable" };
    }
    return { kind: "deny" };
  }

  const secret = getOpsDeskSecret();
  if (!secret) {
    return { kind: "deny" };
  }

  const bearer = getOpsDeskTokenFromRequest(request);
  const roleFromBearer = bearer ? resolveOpsDeskRole(bearer) : null;
  if (roleFromBearer) {
    return { kind: "ok", role: roleFromBearer };
  }

  const legacy = await parseOpsDeskTokenCookie(request.headers.get("cookie"), secret);
  if (legacy) {
    return { kind: "ok", role: legacy.role };
  }
  return { kind: "deny" };
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

    if (OPS_PUBLIC_PATHS.has(pathname) || OPS_MIDDLEWARE_BYPASS_PATHS.has(pathname)) {
      return NextResponse.next();
    }

    const session = await resolveOpsMiddlewareSession(request);

    if (session.kind === "unavailable") {
      // Python 鉴权暂不可用时保留 Cookie，避免登录后立刻被踢回 expired
      return NextResponse.next();
    }

    if (session.kind === "deny") {
      const isDbMode = getOpsDeskAuthMode() === "db";
      const shouldClearCookie = isDbMode
        ? Boolean(request.cookies.get(OPS_DESK_SESSION_COOKIE))
        : Boolean(request.cookies.get(OPS_DESK_TOKEN_COOKIE));
      const softNav = isOpsSoftNavigationRequest(request);

      if (pathname.startsWith("/api/ops/")) {
        const res = NextResponse.json(
          { ok: false, error: "Unauthorized", code: "SESSION_EXPIRED" },
          { status: 401 },
        );
        if (shouldClearCookie) {
          const cookieName = isDbMode ? OPS_DESK_SESSION_COOKIE : OPS_DESK_TOKEN_COOKIE;
          res.cookies.set(cookieName, "", { path: "/", maxAge: 0 });
        }
        return res;
      }

      // 非 document 的 RSC/prefetch：只 401，禁止 302（避免登录后误跳 expired）
      if (softNav || !isOpsPageDocumentRequest(request)) {
        return new NextResponse(null, { status: 401 });
      }

      const res = NextResponse.redirect(
        new URL("/ops/login?expired=1", request.url),
        302,
      );
      if (shouldClearCookie) {
        const cookieName = isDbMode ? OPS_DESK_SESSION_COOKIE : OPS_DESK_TOKEN_COOKIE;
        res.cookies.set(cookieName, "", { path: "/", maxAge: 0 });
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
