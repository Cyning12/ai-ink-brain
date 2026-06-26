import { describe, expect, it, vi, afterEach } from "vitest";

import {
  cookieMaxAgeSecFromExpiresAt,
  getOpsDeskSessionTtlHours,
  getOpsDeskSessionTtlSeconds,
  OPS_DESK_MIN_SESSION_TTL_HOURS,
} from "@/lib/auth/ops-env";

describe("ops-env session ttl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("supports fractional hours", () => {
    vi.stubEnv("OPS_DESK_SESSION_TTL_HOURS", "0.01");
    expect(getOpsDeskSessionTtlHours()).toBe(0.01);
    expect(getOpsDeskSessionTtlSeconds()).toBe(36);
  });

  it("defaults to 24h when unset", () => {
    vi.stubEnv("OPS_DESK_SESSION_TTL_HOURS", "");
    expect(getOpsDeskSessionTtlHours()).toBe(24);
    expect(getOpsDeskSessionTtlSeconds()).toBeUndefined();
  });

  it("cookieMaxAgeSecFromExpiresAt respects future iso", () => {
    const iso = new Date(Date.now() + 36_000).toISOString();
    const sec = cookieMaxAgeSecFromExpiresAt(iso);
    expect(sec).toBeGreaterThanOrEqual(35);
    expect(sec).toBeLessThanOrEqual(37);
  });

  it("min ttl constant aligned with backend", () => {
    expect(OPS_DESK_MIN_SESSION_TTL_HOURS).toBe(0.01);
  });
});
