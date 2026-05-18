import type { UIMessageChunk } from "ai";

import type { ChainEvent } from "@/components/chain-chat/types";
import { applyChainSseFrame } from "@/lib/unified-chat/sse/applyChainSseFrame";
import { parseSseBlocks } from "@/lib/unified-chat/sse/parseSseBlocks";
import { safeJson } from "@/lib/unified-chat/sse/safeJson";

import type { ChatbiDonePayload } from "@/lib/unified-chat/transport/types";

const ASSISTANT_TEXT_PART_ID = "chatbi-assistant";

export type ChatbiSseStreamCallbacks = {
  onChainEvent?: (args: {
    event: ChainEvent;
    serverRunFromMeta: string | null;
    currentRunId: string;
  }) => void;
  onParseError?: () => void;
  onDone?: (done: ChatbiDonePayload | null) => void;
};

type StreamTextState = {
  started: boolean;
  accumulated: string;
};

function parseDonePayload(j: unknown): ChatbiDonePayload | null {
  if (!j || typeof j !== "object") return null;
  const obj = j as Record<string, unknown>;
  const ok = typeof obj.ok === "boolean" ? obj.ok : false;
  const mode = typeof obj.mode === "string" ? obj.mode : "";
  const run_id = typeof obj.run_id === "string" ? obj.run_id.trim() : "";
  const session_id = typeof obj.session_id === "string" ? obj.session_id : "";
  const request_id = typeof obj.request_id === "string" ? obj.request_id.trim() : "";
  const error = typeof obj.error === "string" ? obj.error : undefined;
  const persistRaw = obj.persist;
  const persist =
    persistRaw && typeof persistRaw === "object" && !Array.isArray(persistRaw)
      ? (persistRaw as Record<string, unknown>)
      : undefined;
  return {
    ok,
    mode,
    run_id,
    session_id,
    request_id,
    ...(persist ? { persist } : {}),
    ...(error ? { error } : {}),
  };
}

function extractAssistantMessageText(raw: Record<string, unknown>): string {
  const payload =
    raw.payload && typeof raw.payload === "object" && !Array.isArray(raw.payload)
      ? (raw.payload as Record<string, unknown>)
      : raw;
  const direct = typeof payload.text === "string" ? payload.text : "";
  if (direct.trim()) return direct;
  const answer = typeof payload.answer === "string" ? payload.answer : "";
  if (answer.trim()) return answer;
  const output =
    payload.output && typeof payload.output === "object"
      ? (payload.output as Record<string, unknown>)
      : null;
  const outAnswer = output && typeof output.answer === "string" ? output.answer : "";
  return outAnswer.trim() ? outAnswer : "";
}

function emitTextDelta(
  chunks: UIMessageChunk[],
  textState: StreamTextState,
  delta: string,
): void {
  if (!delta) return;
  if (!textState.started) {
    chunks.push({ type: "text-start", id: ASSISTANT_TEXT_PART_ID });
    textState.started = true;
  }
  textState.accumulated += delta;
  chunks.push({
    type: "text-delta",
    id: ASSISTANT_TEXT_PART_ID,
    delta,
  });
}

function emitAssistantMessageTail(
  chunks: UIMessageChunk[],
  textState: StreamTextState,
  fullText: string,
): void {
  const trimmed = fullText.trim();
  if (!trimmed) return;
  if (trimmed.length <= textState.accumulated.length) return;
  const tail = trimmed.slice(textState.accumulated.length);
  emitTextDelta(chunks, textState, tail);
}

function processSseReadyBuffer(args: {
  ready: string;
  currentRunId: string;
  textState: StreamTextState;
  callbacks: ChatbiSseStreamCallbacks;
  abortSignal?: AbortSignal;
}): { chunks: UIMessageChunk[]; currentRunId: string } {
  const chunks: UIMessageChunk[] = [];
  let currentRunId = args.currentRunId;
  const blocks = parseSseBlocks(args.ready);

  for (const b of blocks) {
    if (args.abortSignal?.aborted) break;
    const j = safeJson(b.data);
    if (b.event === "chain") {
      const applied = applyChainSseFrame({ dataJson: j, currentRunId });
      if (applied.kind === "parse_error") {
        args.callbacks.onParseError?.();
        continue;
      }
      const srvMeta = applied.serverRunFromMeta;
      if (srvMeta) currentRunId = srvMeta;
      args.callbacks.onChainEvent?.({
        event: applied.event,
        serverRunFromMeta: srvMeta,
        currentRunId,
      });

      if (applied.event.type === "agent.llm.delta") {
        const t =
          typeof applied.event.payload.text === "string" ? applied.event.payload.text : "";
        emitTextDelta(chunks, args.textState, t);
      } else if (applied.event.type === "assistant.message") {
        const raw = j as Record<string, unknown>;
        emitAssistantMessageTail(chunks, args.textState, extractAssistantMessageText(raw));
      }
      continue;
    }
    if (b.event === "token") {
      continue;
    }
    if (b.event === "done") {
      const done = parseDonePayload(j);
      args.callbacks.onDone?.(done);
      if (done && !done.ok) {
        const errText =
          typeof done.error === "string" && done.error.trim()
            ? done.error.trim()
            : "请求未完成（done.ok=false）";
        chunks.push({ type: "error", errorText: errText });
      }
    }
  }

  return { chunks, currentRunId };
}

function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === "AbortError";
}

/**
 * 将 ChatBI SSE body 转为 AI SDK `UIMessageChunk` 流（供 Transport 与 vitest 复用）。
 */
export function createChatbiSseUiMessageStream(args: {
  sseBody: ReadableStream<Uint8Array>;
  abortSignal?: AbortSignal;
  initialRunId: string;
  callbacks?: ChatbiSseStreamCallbacks;
}): ReadableStream<UIMessageChunk> {
  const callbacks = args.callbacks ?? {};
  let currentRunId = args.initialRunId;

  return new ReadableStream<UIMessageChunk>({
    async start(controller) {
      const textState: StreamTextState = { started: false, accumulated: "" };
      const reader = args.sseBody.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      const onAbort = () => {
        void reader.cancel().catch(() => undefined);
      };
      args.abortSignal?.addEventListener("abort", onAbort);

      try {
        controller.enqueue({ type: "start" });

        while (true) {
          if (args.abortSignal?.aborted) {
            if (textState.started) {
              controller.enqueue({ type: "text-end", id: ASSISTANT_TEXT_PART_ID });
            }
            controller.enqueue({ type: "abort" });
            controller.close();
            return;
          }

          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const idx = buffer.lastIndexOf("\n\n");
          if (idx < 0) continue;

          const ready = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);
          const { chunks, currentRunId: nextRunId } = processSseReadyBuffer({
            ready,
            currentRunId,
            textState,
            callbacks,
            abortSignal: args.abortSignal,
          });
          currentRunId = nextRunId;
          for (const c of chunks) controller.enqueue(c);
        }

        if (textState.started) {
          controller.enqueue({ type: "text-end", id: ASSISTANT_TEXT_PART_ID });
        }
        controller.enqueue({ type: "finish", finishReason: "stop" });
        controller.close();
      } catch (err) {
        if (isAbortError(err)) {
          if (textState.started) {
            controller.enqueue({ type: "text-end", id: ASSISTANT_TEXT_PART_ID });
          }
          controller.enqueue({ type: "abort" });
          controller.close();
          return;
        }
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue({ type: "error", errorText: msg });
        controller.close();
      } finally {
        args.abortSignal?.removeEventListener("abort", onAbort);
        reader.releaseLock();
      }
    },
  });
}

/** vitest：收集 chunk 列表 */
export async function readAllUiMessageChunks(
  stream: ReadableStream<UIMessageChunk>,
): Promise<UIMessageChunk[]> {
  const reader = stream.getReader();
  const out: UIMessageChunk[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) out.push(value);
  }
  return out;
}
