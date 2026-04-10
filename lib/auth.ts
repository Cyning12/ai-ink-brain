import { timingSafeEqual } from "node:crypto";
import { getAdminApiSecret } from "@/lib/auth/admin-env";
import { verifyAdminSessionCookie } from "@/lib/auth/admin-cookie";
import { getAdminTokenFromRequest } from "@/lib/auth/parse-admin-token";

export { getAdminApiSecret } from "@/lib/auth/admin-env";
export { getAdminTokenFromRequest } from "@/lib/auth/parse-admin-token";
export {
  ADMIN_SESSION_COOKIE,
  buildAdminSessionCookieValue,
  verifyAdminSessionCookie,
} from "@/lib/auth/admin-cookie";
export { requireBearerSecret } from "@/lib/auth/require-bearer-secret";

/**
 * 校验管理员 Bearer / x-blog-admin-token 是否与 NEXT_PUBLIC_ADMIN_SECRET（或 CHAT_API_SECRET）一致。
 * 仅用于 Node 运行时（如 Route Handler）；Middleware 请单独使用 getAdminApiSecret + 解析逻辑。
 */
export function validateAdmin(request: Request): boolean {
  const expected = getAdminApiSecret();
  if (!expected) {
    if (process.env.NODE_ENV === "development") {
      console.log("[auth] validateAdmin: missing admin secret env");
    }
    return false;
  }
  const token = getAdminTokenFromRequest(request);
  const cookieOk = verifyAdminSessionCookie(request.headers.get("cookie"), expected);
  if (process.env.NODE_ENV === "development") {
    const hasAuth = Boolean(request.headers.get("authorization"));
    const hasX = Boolean(request.headers.get("x-blog-admin-token"));
    console.log(
      `[auth] validateAdmin: hasAuthorization=${hasAuth} hasXBlogAdminToken=${hasX} hasCookie=${Boolean(request.headers.get("cookie"))} cookieOk=${cookieOk} tokenLen=${token.length} expectedLen=${expected.length}`,
    );
  }
  if (cookieOk) return true;
  if (token.length !== expected.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(token, "utf8"),
      Buffer.from(expected, "utf8"),
    );
  } catch {
    return false;
  }
}

/**
 * 未配置密钥返回 500；校验失败返回 401（与现有 requireBearerSecret 一致）。
 */
export function requireAdminApiSecret(request: Request): Response | null {
  const expected = getAdminApiSecret();
  if (!expected) {
    return Response.json(
      {
        ok: false,
        error:
          "服务端未配置环境变量：NEXT_PUBLIC_ADMIN_SECRET（或兼容 CHAT_API_SECRET）",
      },
      { status: 500 },
    );
  }
  if (!validateAdmin(request)) {
    if (process.env.NODE_ENV === "development") {
      const auth = request.headers.get("authorization") ?? "";
      const x = request.headers.get("x-blog-admin-token") ?? "";
      console.log(
        `[auth] requireAdminApiSecret: unauthorized; authorizationPrefix=${auth.slice(0, 12)} xBlogAdminTokenLen=${x.trim().length}`,
      );
    }
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
