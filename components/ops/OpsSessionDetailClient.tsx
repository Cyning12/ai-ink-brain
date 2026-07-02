"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { OpsChatClient } from "@/components/ops/OpsChatClient";
import { formatDateTime } from "@/lib/ops/format";
import { fetchOpsSession, type OpsSessionDetailResponse } from "@/lib/ops/session";

export function OpsSessionDetailClient({ sessionId }: { sessionId: string }) {
  const [detail, setDetail] = useState<OpsSessionDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const refreshDetail = useCallback(async () => {
    const data = await fetchOpsSession(sessionId);
    if (!data) return;
    setDetail(data);
    setNotFound(false);
  }, [sessionId]);

  useEffect(() => {
    let cancelled = false;
    void fetchOpsSession(sessionId).then((data) => {
      if (cancelled) return;
      if (!data) {
        setNotFound(true);
        setDetail(null);
      } else {
        setDetail(data);
        setNotFound(false);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (loading) {
    return <p className="text-sm text-slate-500">加载 session…</p>;
  }

  if (notFound || !detail) {
    return (
      <section className="space-y-4 rounded-2xl border border-rose-200/90 bg-rose-50/90 px-4 py-6">
        <div className="font-serif text-lg text-rose-950">未找到 session</div>
        <p className="text-sm text-rose-900/90">session_id 无效或已被删除：{sessionId}</p>
        <Link href="/ops/kimi-code/sessions" className="text-sm text-rose-800 underline">
          返回列表
        </Link>
      </section>
    );
  }

  const { meta, recent_messages: recentMessages } = detail;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/ops/kimi-code/sessions"
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            ← 返回 Sessions
          </Link>
        </div>
        <div className="text-right text-[11px] text-slate-500">
          更新于 {formatDateTime(meta.updated_at)}
        </div>
      </div>

      {recentMessages.length > 0 ? (
        <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40 px-4 py-4">
          <div className="font-serif text-sm text-[#2c2c2c]">最近对话摘要</div>
          <ul className="mt-3 space-y-2">
            {recentMessages.map((msg) => (
              <li
                key={msg.run_id}
                className="rounded-lg border border-slate-200/80 bg-[#f9f9f7]/80 px-3 py-2 text-sm"
              >
                <div className="text-[11px] text-slate-500 font-mono">run {msg.run_id}</div>
                <div className="mt-1 text-slate-800">{msg.content_preview}</div>
                {msg.answer_preview ? (
                  <div className="mt-1 text-[12px] text-slate-600">↳ {msg.answer_preview}</div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <OpsChatClient
        sessionId={sessionId}
        title={meta.title}
        subtitle={`Session 多轮续聊 · status=${meta.status}`}
        onRunComplete={() => void refreshDetail()}
      />
    </div>
  );
}
