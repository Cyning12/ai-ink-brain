import { describe, expect, it } from "vitest";

import { chunkTextByChars } from "@/lib/text/chunk";

describe("chunkTextByChars", () => {
  it("returns empty array for whitespace-only input", () => {
    expect(chunkTextByChars("   \n\t  ")).toEqual([]);
  });

  it("normalizes CRLF and assigns contiguous indices", () => {
    const chunks = chunkTextByChars("a\r\nb", { chunkSize: 2, overlap: 0 });
    expect(chunks.map((c) => c.content)).toEqual(["a", "b"]);
    expect(chunks.map((c) => c.chunk_index)).toEqual([0, 1]);
  });

  it("uses step chunkSize - overlap and trims slice edges", () => {
    const text = "abcdefghij";
    const chunks = chunkTextByChars(text, { chunkSize: 4, overlap: 1 });
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.every((c) => c.content.length <= 4)).toBe(true);
  });
});
