import { describe, expect, it } from "vitest";

import {
  buildOpsDeskTokenCookieValue,
  getOpsDeskTokenFromRequest,
  OPS_DESK_TOKEN_COOKIE,
  parseOpsDeskTokenCookie,
  resolveOpsDeskRole,
} from "@/lib/auth/ops-session";

describe("resolveOpsDeskRole", () => {
  it("requires env to be set", () => {
    // 默认测试环境未配置 OPS_DESK_SECRET
    expect(resolveOpsDeskRole("anything")).toBeNull();
  });
});

describe("cookie lifecycle", () => {
  const secret = "viewer-secret-for-tests";

  it("round-trips a viewer session with ttl", async () => {
    const value = await buildOpsDeskTokenCookieValue("viewer", secret, 3600);
    const session = await parseOpsDeskTokenCookie(
      `${OPS_DESK_TOKEN_COOKIE}=${value}`,
      secret,
    );
    expect(session?.role).toBe("viewer");
    expect(session?.expiresAt).toBeGreaterThan(Date.now());
  });

  it("round-trips a maintainer session without ttl", async () => {
    const value = await buildOpsDeskTokenCookieValue("maintainer", secret);
    const session = await parseOpsDeskTokenCookie(
      `${OPS_DESK_TOKEN_COOKIE}=${value}`,
      secret,
    );
    expect(session?.role).toBe("maintainer");
    expect(session?.expiresAt).toBeUndefined();
  });

  it("rejects tampered role", async () => {
    const value = await buildOpsDeskTokenCookieValue("viewer", secret, 3600);
    const tampered = value.replace("viewer", "maintainer");
    const session = await parseOpsDeskTokenCookie(
      `${OPS_DESK_TOKEN_COOKIE}=${tampered}`,
      secret,
    );
    expect(session).toBeNull();
  });

  it("rejects wrong secret", async () => {
    const value = await buildOpsDeskTokenCookieValue("viewer", secret, 3600);
    const session = await parseOpsDeskTokenCookie(
      `${OPS_DESK_TOKEN_COOKIE}=${value}`,
      "different-secret",
    );
    expect(session).toBeNull();
  });

  it("rejects expired cookie", async () => {
    const value = await buildOpsDeskTokenCookieValue("viewer", secret, -1);
    const session = await parseOpsDeskTokenCookie(
      `${OPS_DESK_TOKEN_COOKIE}=${value}`,
      secret,
    );
    expect(session).toBeNull();
  });
});

describe("getOpsDeskTokenFromRequest", () => {
  it("extracts Bearer token", () => {
    const req = new Request("http://localhost", {
      headers: { authorization: "Bearer demo-token" },
    });
    expect(getOpsDeskTokenFromRequest(req)).toBe("demo-token");
  });

  it("returns empty when no Bearer", () => {
    const req = new Request("http://localhost");
    expect(getOpsDeskTokenFromRequest(req)).toBe("");
  });
});
