import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { UIMessageChunk } from "ai";

import {
  CHATBI_SSE_CONTRACT_HEADER,
  CHATBI_SSE_CONTRACT_V2,
} from "@/lib/unified-chat/transport/constants";
import {
  createChatbiSseUiMessageStream,
  readAllUiMessageChunks,
} from "@/lib/unified-chat/transport/chatbiSseStream";
import { ChatbiSseTransport } from "@/lib/unified-chat/transport/chatbiSseTransport";

const deltaFixture = readFileSync(
  path.join(__dirname, "fixtures", "stream-llm-deltas.sse.txt"),
  "utf8",
);

function sseBodyFromText(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text));
      controller.close();
    },
  });
}

function countTextDeltas(chunks: UIMessageChunk[]): number {
  return chunks.filter((c) => c.type === "text-delta").length;
}

describe("createChatbiSseUiMessageStream", () => {
  it("emits at least 2 text-delta chunks for llm.delta fixture", async () => {
    const stream = createChatbiSseUiMessageStream({
      sseBody: sseBodyFromText(deltaFixture),
      initialRunId: "local-run",
    });
    const chunks = await readAllUiMessageChunks(stream);
    expect(countTextDeltas(chunks)).toBeGreaterThanOrEqual(2);
    const joined = chunks
      .filter((c): c is { type: "text-delta"; delta: string } => c.type === "text-delta")
      .map((c) => c.delta)
      .join("");
    expect(joined).toBe("Hello world");
  });

  it("emits no text-delta after abort", async () => {
    const ac = new AbortController();
    const encoder = new TextEncoder();
    const part1 =
      'event: chain\ndata: {"type":"agent.llm.delta","ts":1,"step_id":"s1","payload":{"text":"Hello"}}\n\n';
    const part2 =
      'event: chain\ndata: {"type":"agent.llm.delta","ts":2,"step_id":"s1","payload":{"text":" world"}}\n\n';

    const sseBody = new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(encoder.encode(part1));
        await new Promise((r) => setTimeout(r, 30));
        controller.enqueue(encoder.encode(part2));
        controller.close();
      },
    });

    const stream = createChatbiSseUiMessageStream({
      sseBody,
      abortSignal: ac.signal,
      initialRunId: "local-run",
    });

    const reader = stream.getReader();
    const deltas: string[] = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (value?.type === "text-delta") {
        deltas.push(value.delta);
        if (deltas.length === 1) ac.abort();
      }
    }

    expect(deltas).toEqual(["Hello"]);
  });
});

describe("ChatbiSseTransport", () => {
  it("sends X-ChatBI-Sse-Contract: 2 and ChatBI JSON body", async () => {
    let capturedHeaders: HeadersInit | undefined;
    let capturedBody: string | undefined;

    const transport = new ChatbiSseTransport({
      getHeaders: () => ({ Authorization: "Bearer test-token" }),
      fetch: async (_url, init) => {
        capturedHeaders = init?.headers;
        capturedBody = typeof init?.body === "string" ? init.body : undefined;
        return new Response(sseBodyFromText(deltaFixture), {
          status: 200,
          headers: { "Content-Type": "text/event-stream" },
        });
      },
    });

    const stream = await transport.sendMessages({
      trigger: "submit-message",
      chatId: "chat-1",
      messageId: undefined,
      messages: [{ id: "u1", role: "user", parts: [{ type: "text", text: "hi" }] }],
      abortSignal: undefined,
      body: {
        session_id: "sess-1",
        query: "hi",
        prefer: "rag",
      },
    });

    const chunks = await readAllUiMessageChunks(stream);
    expect(countTextDeltas(chunks)).toBeGreaterThanOrEqual(2);

    const headers = capturedHeaders as Record<string, string>;
    expect(headers[CHATBI_SSE_CONTRACT_HEADER]).toBe(CHATBI_SSE_CONTRACT_V2);
    expect(headers.Authorization).toBe("Bearer test-token");
    const parsed = JSON.parse(capturedBody ?? "{}") as Record<string, unknown>;
    expect(parsed.session_id).toBe("sess-1");
    expect(parsed.query).toBe("hi");
    expect(parsed.prefer).toBe("rag");
  });
});
