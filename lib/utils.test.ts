import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges tailwind classes and resolves conflicts toward the last token", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("drops falsy fragments", () => {
    expect(cn("base", false && "hidden", "block")).toBe("base block");
  });
});
