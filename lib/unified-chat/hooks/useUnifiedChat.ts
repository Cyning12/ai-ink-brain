"use client";

import { useChat } from "@ai-sdk/react";
import { useCallback, useEffect, useMemo } from "react";
import type { UIMessage } from "ai";

import { ChatbiSseTransport } from "@/lib/unified-chat/transport/chatbiSseTransport";
import type { ChatbiSseStreamCallbacks } from "@/lib/unified-chat/transport/chatbiSseStream";
import type { ChatbiStreamRequestBody } from "@/lib/unified-chat/transport/types";

export type UnifiedChatPreferMode = "auto" | "rag" | "text2sql";

export type UseUnifiedChatOptions = {
  sessionId: string;
  prefer: UnifiedChatPreferMode;
  debugRouter: boolean;
  debugLlmPrompts: boolean;
  headers: Record<string, string>;
  callbacks?: ChatbiSseStreamCallbacks;
  onError?: (error: Error) => void;
};

function assistantTextFromMessages(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (!m || m.role !== "assistant") continue;
    return (m.parts ?? [])
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
  }
  return "";
}

/**
 * Unified Chat 薄封装：`useChat` + `ChatbiSseTransport`（Phase 1：正文 SDK，Timeline 走 callbacks 双写）。
 */
export function useUnifiedChat(options: UseUnifiedChatOptions) {
  /** 可变桥：避免在 useMemo 内读 useRef（eslint react-hooks/refs） */
  const callbackBridge = useMemo(
    () => ({ handlers: options.callbacks }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 桥对象须稳定，handlers 由 effect 同步
    [],
  );
  useEffect(() => {
    callbackBridge.handlers = options.callbacks;
  }, [callbackBridge, options.callbacks]);

  const headersBridge = useMemo(
    () => ({ value: options.headers }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 桥对象须稳定
    [],
  );
  useEffect(() => {
    headersBridge.value = options.headers;
  }, [headersBridge, options.headers]);

  const transport = useMemo(
    () =>
      new ChatbiSseTransport({
        getHeaders: () => headersBridge.value,
        callbacks: {
          onChainEvent: (args) => callbackBridge.handlers?.onChainEvent?.(args),
          onParseError: () => callbackBridge.handlers?.onParseError?.(),
          onDone: (done) => callbackBridge.handlers?.onDone?.(done),
        },
      }),
    [callbackBridge, headersBridge],
  );

  const chat = useChat({
    transport,
    onError: options.onError,
  });

  const streamingText = useMemo(
    () => assistantTextFromMessages(chat.messages),
    [chat.messages],
  );

  const isLoading = chat.status === "submitted" || chat.status === "streaming";

  const sendQuery = useCallback(
    async (query: string, extra?: Pick<ChatbiStreamRequestBody, "plan_execution_token">) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      if (chat.status === "submitted" || chat.status === "streaming") return;

      const body: ChatbiStreamRequestBody = {
        session_id: options.sessionId,
        query: trimmed,
        prefer: options.prefer,
        ...(options.debugRouter ? { debug_router: true } : {}),
        ...(options.debugLlmPrompts ? { debug_llm_prompts: true } : {}),
        ...(extra?.plan_execution_token
          ? { plan_execution_token: extra.plan_execution_token }
          : {}),
      };

      await chat.sendMessage({ text: trimmed }, { body, headers: options.headers });
    },
    [
      chat,
      options.debugLlmPrompts,
      options.debugRouter,
      options.headers,
      options.prefer,
      options.sessionId,
    ],
  );

  return {
    id: chat.id,
    status: chat.status,
    messages: chat.messages,
    streamingText,
    isLoading,
    error: chat.error,
    stop: chat.stop,
    sendQuery,
    setMessages: chat.setMessages,
    clearError: chat.clearError,
  };
}
