import { describe, expect, it } from "vitest";

import { parseSiteMode } from "@/lib/site-mode";

describe("parseSiteMode", () => {
  it("returns exact valid modes", () => {
    expect(parseSiteMode("portfolio")).toBe("portfolio");
    expect(parseSiteMode("ops")).toBe("ops");
    expect(parseSiteMode("development")).toBe("development");
  });

  it("falls back to development for unset, empty, or invalid values", () => {
    expect(parseSiteMode(undefined)).toBe("development");
    expect(parseSiteMode("")).toBe("development");
    expect(parseSiteMode("PORTFOLIO")).toBe("development");
    expect(parseSiteMode("prod")).toBe("development");
    expect(parseSiteMode("op")).toBe("development");
  });
});
