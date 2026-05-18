import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { parseSseBlocks } from "@/lib/unified-chat/sse/parseSseBlocks";
import { safeJson } from "@/lib/unified-chat/sse/safeJson";

const fixturePath = path.join(__dirname, "fixtures", "sse-blocks.txt");

describe("parseSseBlocks", () => {
  it("parses chain / token / done blocks from fixture", () => {
    const raw = readFileSync(fixturePath, "utf8");
    const blocks = parseSseBlocks(raw);
    expect(blocks.map((b) => b.event)).toEqual(["chain", "chain", "token", "done", "done"]);
    const doneOk = safeJson(blocks[3]!.data) as Record<string, unknown>;
    expect(doneOk.ok).toBe(true);
    const doneFail = safeJson(blocks[4]!.data) as Record<string, unknown>;
    expect(doneFail.ok).toBe(false);
  });

  it("joins multi-line data fields", () => {
    const chunk = "event: chain\ndata: {\"a\":1}\ndata: {\"b\":2}\n\n";
    const blocks = parseSseBlocks(chunk);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]!.data).toBe('{"a":1}\n{"b":2}');
  });
});

describe("safeJson", () => {
  it("returns null on bad JSON", () => {
    expect(safeJson("{")).toBeNull();
  });

  it("parses valid JSON", () => {
    expect(safeJson('{"ok":true}')).toEqual({ ok: true });
  });
});
