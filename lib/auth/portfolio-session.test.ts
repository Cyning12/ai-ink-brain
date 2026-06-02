import { describe, expect, it, beforeEach, afterEach } from "vitest";

import {
  buildPortfolioSessionCookieValue,
  parsePortfolioSessionCookie,
  portfolioSessionMaxAgeSec,
} from "@/lib/auth/portfolio-session";

describe("portfolio-session", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    process.env.PORTFOLIO_VISITOR_SECRET = "visitor-secret-test-value-0123456789ab";
    process.env.PORTFOLIO_VISITOR_ADMIN_SECRET = "admin-secret-test-value-0123456789abc";
  });

  afterEach(() => {
    process.env = env;
  });

  it("builds and parses visitor session", () => {
    const maxAge = portfolioSessionMaxAgeSec("visitor");
    const value = buildPortfolioSessionCookieValue("visitor", maxAge);
    expect(value).toBeTruthy();
    const header = `portfolio_visitor_session=${value}`;
    const parsed = parsePortfolioSessionCookie(header);
    expect(parsed?.role).toBe("visitor");
    expect(parsed?.expiresAt).toBeGreaterThan(Date.now());
  });

  it("rejects tampered signature", () => {
    const value = buildPortfolioSessionCookieValue("visitor-admin", 3600)!;
    const tampered = value.replace(/.$/, "x");
    expect(parsePortfolioSessionCookie(`portfolio_visitor_session=${tampered}`)).toBeNull();
  });
});
