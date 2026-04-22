"use client";

import { useState, useTransition } from "react";

import type { ChatMessage } from "@/lib/types/chat";
import { sendChatViaApi } from "@/app/chat/actions";
import { Button } from "@/components/ui/button";

export function ChatPanel() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [useRag, setUseRag] = useState(true);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(nextMessages);
    setInput("");

    startTransition(async () => {
      try {
        const reply = await sendChatViaApi({
          messages: nextMessages,
          useRag,
        });
        setMessages((prev) => [...prev, reply]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `（错误）${msg}` },
        ]);
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={useRag}
            onChange={(e) => setUseRag(e.target.checked)}
          />
          启用 RAG（Top-k 检索；需已在 Supabase 创建 match_documents）
        </label>
      </div>

      <div className="min-h-[320px] space-y-4 rounded-2xl border border-border bg-card/40 p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            在下方输入问题。请求经 Server Action 代发，不会在浏览器暴露{" "}
            <code className="text-xs">NEXT_PUBLIC_ADMIN_SECRET</code>。
          </p>
        ) : (
          messages.map((m, idx) => (
            <div
              key={`${idx}-${m.role}`}
              className={[
                "rounded-xl px-4 py-3 text-sm leading-6",
                m.role === "user"
                  ? "ml-10 bg-[color:var(--color-wash)]/60 text-foreground"
                  : "mr-10 border border-border bg-background/60 text-foreground",
              ].join(" ")}
            >
              <div className="mb-1 text-xs text-muted-foreground">
                {m.role === "user" ? "你" : "助手"}
              </div>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例如：这篇文章里你如何看待向量检索与全文检索的结合？"
          className="h-11 flex-1 rounded-xl border border-border bg-background px-4 text-sm outline-none ring-ring/40 focus:ring-2"
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending} className="h-11 rounded-xl">
          {isPending ? "生成中…" : "发送"}
        </Button>
      </form>
    </div>
  );
}
