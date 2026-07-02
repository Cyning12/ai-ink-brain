"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { OpsChatClient } from "@/components/ops/OpsChatClient";
import { OpsSessionAuthPanel } from "@/components/ops/OpsSessionAuthPanel";
import { OpsSessionDeliverablesPanel } from "@/components/ops/OpsSessionDeliverablesPanel";
import { copyTextToClipboard } from "@/lib/ops/chat";
import { formatDateTime } from "@/lib/ops/format";
import {
  fetchOpsSession,
  postOpsSessionAuth,
  serializeOpsSessionRecentMessage,
  serializeOpsSessionRecentMessages,
  type OpsSessionAuthAction,
  type OpsSessionDetailResponse,
} from "@/lib/ops/session";

function statusBadgeClass(status: string): string {
  switch (status) {
    case "awaiting_auth":
      return "bg-amber-100 text-amber-900";
    case "dispatched":
      return "bg-emerald-100 text-emerald-900";
    case "blocked":
      return "bg-rose-100 text-rose-900";
    case "planning":
      return "bg-sky-100 text-sky-900";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

type StatusHint = {
  tone: "success" | "info";
  text: string;
};

function hintForAuthAction(action: OpsSessionAuthAction, apiMessage?: string): StatusHint {
  if (action === "approve") {
    return {
      tone: "success",
      text:
        apiMessage ??
        "已授权 · Session 已进入 dispatched。可在下方继续深析；subagent 产出将写入 deliverables。",
    };
  }
  if (action === "revise") {
    return {
      tone: "info",
      text:
        apiMessage ??
        "已回到规划中。请在下方 Chat 输入修改后的需求，系统将重新生成计划并再次进入「待授权」。",
    };
  }
  return {
    tone: "info",
    text: apiMessage ?? "已取消授权。可在下方重新描述需求以生成新计划。",
  };
}

export function OpsSessionDetailClient({ sessionId }: { sessionId: string }) {
  const [detail, setDetail] = useState<OpsSessionDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [statusHint, setStatusHint] = useState<StatusHint | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

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

  const planSummary = useMemo(() => {
    if (!detail) return null;
    const latest = detail.recent_messages[0];
    return latest?.answer_preview ?? null;
  }, [detail]);

  const handleAuth = useCallback(
    async (action: OpsSessionAuthAction) => {
      const result = await postOpsSessionAuth(sessionId, action);
      if (!result.ok) return result;
      const apiMessage = result.data.message ?? result.data.answer;
      setStatusHint(hintForAuthAction(action, apiMessage));
      return { ok: true as const };
    },
    [sessionId],
  );

  const handleCopy = useCallback(async (text: string, label: string) => {
    const ok = await copyTextToClipboard(text);
    setCopyFeedback(ok ? `已复制${label}` : "复制失败");
    window.setTimeout(() => setCopyFeedback(null), 2000);
  }, []);

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

  const { meta, gate_summary: gateSummary, recent_messages: recentMessages, deliverables = [] } = detail;
  const showAuthPanel = meta.status === "awaiting_auth";
  const isBlocked = meta.status === "blocked";
  const pendingGates = gateSummary.pending.length > 0 ? gateSummary.pending : meta.gate_summary?.pending ?? [];

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
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-xl text-[#2c2c2c]">{meta.title}</h1>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusBadgeClass(meta.status)}`}
            >
              {meta.status}
            </span>
          </div>
          <p className="mt-1 font-mono text-[10px] text-slate-500">{sessionId}</p>
        </div>
        <div className="text-right text-[11px] text-slate-500">
          更新于 {formatDateTime(meta.updated_at)}
        </div>
      </div>

      {statusHint ? (
        <section
          className={`rounded-xl border px-4 py-3 text-sm ${
            statusHint.tone === "success"
              ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
              : "border-sky-200 bg-sky-50/80 text-sky-950"
          }`}
          role="status"
        >
          {statusHint.text}
        </section>
      ) : null}

      {meta.status === "planning" && !statusHint ? (
        <section className="rounded-xl border border-sky-200/80 bg-sky-50/60 px-4 py-3 text-sm text-sky-900">
          规划中 · 在下方 Chat 发送消息以更新 00 计划草稿；生成后将进入「待授权」。
        </section>
      ) : null}

      {meta.status === "dispatched" && !statusHint ? (
        <section className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-950">
          已派工 · 计划已授权。在下方 Chat 发送问题将走 deep / ReAct / fast 编排，事件流与单轮 Ops Chat 一致；产出见交付物区。
        </section>
      ) : null}

      {isBlocked && pendingGates.length > 0 ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-4">
          <div className="font-serif text-sm text-rose-950">Session 已阻塞</div>
          <ul className="mt-2 space-y-1 text-sm text-rose-900">
            {pendingGates.map((gateId) => (
              <li key={gateId}>
                <span className="font-mono">{gateId}</span>
                <span className="text-rose-800/80"> · 请检查 session task 草稿与 gate 表</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {showAuthPanel ? (
        <OpsSessionAuthPanel
          sessionId={sessionId}
          planSummary={planSummary}
          onAuth={handleAuth}
          onAuthComplete={refreshDetail}
        />
      ) : null}

      {gateSummary.approved.length > 0 ? (
        <section className="rounded-xl border border-slate-200/80 bg-white/40 px-3 py-2 text-xs text-slate-600">
          已签收闸：{gateSummary.approved.join(" · ")}
        </section>
      ) : null}

      {recentMessages.length > 0 ? (
        <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-serif text-sm text-[#2c2c2c]">最近对话摘要</div>
            <div className="flex items-center gap-2">
              {copyFeedback ? (
                <span className="text-[10px] text-slate-500">{copyFeedback}</span>
              ) : null}
              <button
                type="button"
                onClick={() =>
                  void handleCopy(serializeOpsSessionRecentMessages(recentMessages), "全部摘要")
                }
                className="rounded-md border border-slate-200 bg-white/80 px-2 py-0.5 text-[10px] text-slate-600 hover:border-slate-300"
              >
                复制全部
              </button>
            </div>
          </div>
          <ul className="mt-3 space-y-2">
            {recentMessages.map((msg) => (
              <li
                key={msg.run_id}
                className="rounded-lg border border-slate-200/80 bg-[#f9f9f7]/80 px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500 font-mono">run {msg.run_id}</div>
                  <button
                    type="button"
                    onClick={() =>
                      void handleCopy(serializeOpsSessionRecentMessage(msg), "本条摘要")
                    }
                    className="rounded-md border border-slate-200 bg-white/80 px-2 py-0.5 text-[10px] text-slate-600 hover:border-slate-300"
                  >
                    复制
                  </button>
                </div>
                <div className="mt-1 text-slate-800">{msg.content_preview}</div>
                {msg.answer_preview ? (
                  <div className="mt-1 text-[12px] text-slate-600 whitespace-pre-wrap">
                    ↳ {msg.answer_preview}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {deliverables.length > 0 ? (
        <OpsSessionDeliverablesPanel
          deliverables={deliverables}
          onCopyFeedback={(label) => {
            setCopyFeedback(`已复制${label}`);
            window.setTimeout(() => setCopyFeedback(null), 2000);
          }}
        />
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
