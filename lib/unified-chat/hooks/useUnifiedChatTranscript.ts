"use client";

import { useEffect, useRef, useState } from "react";

import type { ChatHistoryRow } from "@/lib/chat/chatApi";
import { fetchChatHistory } from "@/lib/chat/chatApi";

/** 跨轮会话摘要（进入页面时从 GET /api/py/chat/history 恢复，与 session_id 对齐） */
export type TranscriptTurn = { id: string; user: string; assistant: string };

/** 将历史接口的扁平 messages（user/assistant 交替）转为 transcript 轮次 */
export function mapHistoryRowsToTranscript(
  messages: ChatHistoryRow[] | undefined,
): TranscriptTurn[] {
  if (!messages?.length) return [];
  const out: TranscriptTurn[] = [];
  let pendingUser = "";
  for (const m of messages) {
    if (m.role === "user") {
      pendingUser = typeof m.content === "string" ? m.content.trim() : "";
    } else if (m.role === "assistant") {
      const a = typeof m.content === "string" ? m.content.trim() : "";
      out.push({
        id: `hist-${out.length}`,
        user: pendingUser,
        assistant: a,
      });
      pendingUser = "";
    }
  }
  if (pendingUser) {
    out.push({
      id: `hist-pending-${out.length}`,
      user: pendingUser,
      assistant: "",
    });
  }
  return out;
}

type UseUnifiedChatTranscriptArgs = {
  mounted: boolean;
  locked: boolean;
  sessionId: string;
  headers: Record<string, string>;
};

/** 解锁后按 session_id 拉 history，刷新/重进页面恢复 transcript */
export function useUnifiedChatTranscript({
  mounted,
  locked,
  sessionId,
  headers,
}: UseUnifiedChatTranscriptArgs) {
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [historyReady, setHistoryReady] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  useEffect(() => {
    if (!mounted || locked) return;

    const ac = new AbortController();
    const sidAtStart = sessionId;
    setHistoryReady(false);
    setHistoryError(null);

    void (async () => {
      try {
        const data = await fetchChatHistory({
          sessionId: sidAtStart,
          headers,
          limit: 100,
          signal: ac.signal,
        });
        if (ac.signal.aborted || sessionIdRef.current !== sidAtStart) return;
        setTranscript(mapHistoryRowsToTranscript(data.messages));
      } catch (e) {
        if (ac.signal.aborted) return;
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (sessionIdRef.current !== sidAtStart) return;
        setHistoryError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!ac.signal.aborted && sessionIdRef.current === sidAtStart) {
          setHistoryReady(true);
        }
      }
    })();

    return () => ac.abort();
  }, [mounted, locked, sessionId, headers]);

  return {
    transcript,
    setTranscript,
    historyReady,
    historyError,
  };
}
