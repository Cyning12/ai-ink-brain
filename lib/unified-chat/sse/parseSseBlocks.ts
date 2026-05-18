import type { SseBlock } from "@/lib/unified-chat/sse/types";

/** 将已按 `\n\n` 切出的 chunk 文本解析为 SSE 块列表（跨 chunk 组包由调用方 buffer 负责） */
export function parseSseBlocks(chunkText: string): SseBlock[] {
  const blocks: SseBlock[] = [];
  const parts = chunkText.split("\n\n").filter((p) => p.trim());
  for (const part of parts) {
    let eventName = "message";
    const dataLines: string[] = [];
    for (const rawLine of part.split("\n")) {
      const line = rawLine.trimEnd();
      if (!line) continue;
      if (line.startsWith("event:")) {
        eventName = line.slice("event:".length).trim() || "message";
        continue;
      }
      if (line.startsWith("data:")) {
        dataLines.push(line.slice("data:".length).trimStart());
        continue;
      }
    }
    blocks.push({ event: eventName, data: dataLines.join("\n") });
  }
  return blocks;
}
