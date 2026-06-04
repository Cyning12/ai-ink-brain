import { describe, expect, it, beforeEach } from "vitest";

import {
  parseSuggestedQuestionsPayload,
  resetSuggestedQuestionsSessionCache,
  loadSuggestedQuestionsOnce,
  peekSuggestedQuestionsSessionCache,
} from "@/lib/unified-chat/suggestedQuestionsApi";
import { getDefaultSuggestedQuestions } from "@/lib/unified-chat/suggestedQuestionsDefaults";

describe("parseSuggestedQuestionsPayload", () => {
  it("returns trimmed questions when ok=true", () => {
    const raw = JSON.stringify({
      ok: true,
      questions: ["  Tech Graph 是什么  ", "简单介绍下刘新宁"],
    });
    expect(parseSuggestedQuestionsPayload(raw)).toEqual([
      "Tech Graph 是什么",
      "简单介绍下刘新宁",
    ]);
  });

  it("returns null when ok=false or questions missing", () => {
    expect(parseSuggestedQuestionsPayload(JSON.stringify({ ok: false }))).toBeNull();
    expect(parseSuggestedQuestionsPayload(JSON.stringify({ ok: true }))).toBeNull();
    expect(parseSuggestedQuestionsPayload("not-json")).toBeNull();
  });
});

describe("loadSuggestedQuestionsOnce", () => {
  beforeEach(() => {
    resetSuggestedQuestionsSessionCache();
  });

  it("caches fallback after failed fetch without throwing", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      throw new Error("network down");
    };

    const list = await loadSuggestedQuestionsOnce({ mode: "portfolio" });
    expect(list).toEqual(getDefaultSuggestedQuestions("portfolio"));
    expect(peekSuggestedQuestionsSessionCache()).toEqual(list);

    let callCount = 0;
    globalThis.fetch = async () => {
      callCount += 1;
      return new Response(JSON.stringify({ ok: true, questions: ["x"] }));
    };

    const again = await loadSuggestedQuestionsOnce({ mode: "portfolio" });
    expect(again).toEqual(list);
    expect(callCount).toBe(0);

    globalThis.fetch = originalFetch;
  });
});
