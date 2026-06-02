import { timingSafeEqual } from "node:crypto";

import type { PortfolioRole } from "@/lib/auth/portfolio-session";

/** 常量时间比对 portfolio 秘钥；匹配则返回 role */
export function matchPortfolioSecret(
  secret: string,
): PortfolioRole | null {
  const visitor = (process.env.PORTFOLIO_VISITOR_SECRET ?? "").trim();
  const admin = (process.env.PORTFOLIO_VISITOR_ADMIN_SECRET ?? "").trim();

  if (visitor && secret.length === visitor.length) {
    try {
      if (timingSafeEqual(Buffer.from(secret, "utf8"), Buffer.from(visitor, "utf8"))) {
        return "visitor";
      }
    } catch {
      /* fall through */
    }
  }
  if (admin && secret.length === admin.length) {
    try {
      if (timingSafeEqual(Buffer.from(secret, "utf8"), Buffer.from(admin, "utf8"))) {
        return "visitor-admin";
      }
    } catch {
      /* fall through */
    }
  }
  return null;
}

export function isPortfolioAuthConfigured(): boolean {
  return Boolean(
    (process.env.PORTFOLIO_VISITOR_SECRET ?? "").trim() ||
      (process.env.PORTFOLIO_VISITOR_ADMIN_SECRET ?? "").trim(),
  );
}
