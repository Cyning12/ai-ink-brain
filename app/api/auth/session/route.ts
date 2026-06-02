import { verifyAdminSessionCookie } from "@/lib/auth/admin-cookie";
import { getAdminApiSecret } from "@/lib/auth/admin-env";
import { isPortfolioAuthConfigured } from "@/lib/auth/portfolio-env";
import { parsePortfolioSessionCookie } from "@/lib/auth/portfolio-session";
import { hasChatbiAdminSession } from "@/lib/auth/require-sync-admin-access";

export const runtime = "nodejs";

export type AuthRole = "none" | "visitor" | "visitor-admin" | "admin";

/** 供前端判断会话：Ink/ChatBI admin 或 Portfolio visitor 档位 */
export async function GET(request: Request): Promise<Response> {
  const ink = getAdminApiSecret();
  let admin = false;
  let role: AuthRole = "none";
  let expiresAt: string | undefined;

  const portfolio = parsePortfolioSessionCookie(request.headers.get("cookie"));
  if (portfolio) {
    role = portfolio.role;
    expiresAt = new Date(portfolio.expiresAt).toISOString();
  }

  if (ink && verifyAdminSessionCookie(request.headers.get("cookie"), ink)) {
    admin = true;
    role = "admin";
  }
  if (!admin && (await hasChatbiAdminSession(request))) {
    admin = true;
    if (role === "none") role = "admin";
  }

  const configured =
    Boolean(ink) ||
    isPortfolioAuthConfigured() ||
    Boolean((process.env.PY_API_URL ?? "").trim()) ||
    process.env.NODE_ENV === "development";

  return Response.json({
    ok: true,
    admin,
    role,
    configured,
    expiresAt,
  });
}
