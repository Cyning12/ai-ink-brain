import { describe, expect, it } from "vitest";

import { parseSiteMode } from "@/lib/site-mode";

describe("parseSiteMode", () => {
  it("returns portfolio only for exact portfolio value", () => {
    expect(parseSiteMode("portfolio")).toBe("portfolio");
  });

  it("falls back to development for unset, empty, or invalid values", () => {
    expect(parseSiteMode(undefined)).toBe("development");
    expect(parseSiteMode("")).toBe("development");
    expect(parseSiteMode("development")).toBe("development");
    expect(parseSiteMode("PORTFOLIO")).toBe("development");
    expect(parseSiteMode("prod")).toBe("development");
  });
});
