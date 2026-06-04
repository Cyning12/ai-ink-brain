import { describe, expect, it } from "vitest";

import {
  nextTypewriterVisibleLen,
  nextTypewriterVisibleLenWithReset,
  sliceRoundStreamingText,
} from "@/lib/unified-chat/hooks/useTypewriterReveal";

describe("nextTypewriterVisibleLen", () => {
  it("increases by charsPerTick until target length", () => {
    expect(nextTypewriterVisibleLen(0, 5, 2)).toBe(2);
    expect(nextTypewriterVisibleLen(2, 5, 2)).toBe(4);
    expect(nextTypewriterVisibleLen(4, 5, 2)).toBe(5);
    expect(nextTypewriterVisibleLen(5, 5, 2)).toBe(5);
  });

  it("handles target growth in subsequent ticks", () => {
    expect(nextTypewriterVisibleLen(5, 11, 3)).toBe(8);
    expect(nextTypewriterVisibleLen(8, 11, 3)).toBe(11);
  });
});

describe("nextTypewriterVisibleLenWithReset", () => {
  it("resets base when target shrinks", () => {
    expect(nextTypewriterVisibleLenWithReset(10, 3, 2)).toBe(2);
  });
});

describe("sliceRoundStreamingText", () => {
  it("returns empty when no new content yet", () => {
    expect(sliceRoundStreamingText("hello", "hello")).toBe("");
    expect(sliceRoundStreamingText("", "hello")).toBe("");
  });

  it("returns suffix when streaming extends baseline", () => {
    expect(sliceRoundStreamingText("hello world", "hello")).toBe(" world");
  });

  it("returns full text when new assistant replaces baseline", () => {
    expect(sliceRoundStreamingText("new answer", "old answer")).toBe("new answer");
  });
});
