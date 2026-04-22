"use client";

import { useMemo, useState } from "react";

import type { ChainEvent } from "@/components/chain-chat/types";
import { SqlResultTable } from "@/components/chain-chat/SqlResultTable";

type Props = {
  event: ChainEvent;
};

function fmtTs(ms: number): string {
  if (!Number.isFinite(ms)) return "";
  const d = new Date(ms);
  return d.toLocaleTimeString();
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

function badgeTone(type: ChainEvent["type"]): string {
  if (type === "error") return "bg-red-500/10 text-red-700 border-red-500/20";
  if (type.startsWith("tool.")) return "bg-slate-500/10 text-slate-700 border-slate-500/20";
  if (type === "sql.result") return "bg-indigo-500/10 text-indigo-700 border-indigo-500/20";
  if (type.startsWith("chart.")) return "bg-amber-500/10 text-amber-800 border-amber-500/20";
  return "bg-emerald-500/10 text-emerald-800 border-emerald-500/20";
}

export function ChainEventCard({ event }: Props) {
  const [open, setOpen] = useState(false);

  const title = useMemo(() => {
    const p = event.payload ?? {};
    if (event.type === "assistant.message") return "assistant.message";
    if (event.type === "sql.result") return "sql.result";
    if (event.type === "error") return "error";
    if (event.type.startsWith("tool.")) {
      const name = typeof p.tool === "string" ? p.tool : typeof p.name === "string" ? p.name : "tool";
      return `${event.type} · ${name}`;
    }
    return event.type;
  }, [event]);

  const renderBody = () => {
    if (event.type === "assistant.message") {
      const t = typeof event.payload.text === "string" ? event.payload.text : "";
      return <div className="whitespace-pre-wrap text-sm text-slate-800">{t}</div>;
    }
    if (event.type === "sql.result") {
      const sql = typeof event.payload.sql === "string" ? event.payload.sql : "";
      const columns = Array.isArray(event.payload.columns) ? (event.payload.columns as string[]) : undefined;
      const rows = Array.isArray(event.payload.rows)
        ? (event.payload.rows as Array<Record<string, unknown>>)
        : undefined;
      return (
        <div className="space-y-3">
          {sql ? (
            <div>
              <div className="text-[10px] text-slate-500">sql</div>
              <pre className="mt-1 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2 font-mono text-[11px] text-slate-700">
                {sql}
              </pre>
            </div>
          ) : null}
          <SqlResultTable columns={columns} rows={rows} maxRows={20} />
        </div>
      );
    }
    if (event.type === "chart.image") {
      const src = typeof event.payload.src === "string" ? event.payload.src : "";
      const alt = typeof event.payload.alt === "string" ? event.payload.alt : "chart";
      if (!src) return <div className="text-[11px] text-slate-500">（无图表）</div>;
      return (
        <div className="overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="h-auto w-full" />
        </div>
      );
    }
    if (event.type === "chart.spec") {
      return (
        <pre className="overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2 font-mono text-[11px] text-slate-700">
          {safeStringify(event.payload)}
        </pre>
      );
    }
    if (event.type === "error") {
      const msg =
        typeof event.payload.message === "string"
          ? event.payload.message
          : safeStringify(event.payload);
      return <div className="whitespace-pre-wrap text-sm text-red-700/90">{msg}</div>;
    }
    // tool.* and fallback
    return (
      <pre className="overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2 font-mono text-[11px] text-slate-700">
        {safeStringify(event.payload)}
      </pre>
    );
  };

  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7] p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={[
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono",
                badgeTone(event.type),
              ].join(" ")}
            >
              {event.type}
            </span>
            <span className="truncate font-serif text-[12px] text-[#2c2c2c]">
              {title}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            {fmtTs(event.ts)} · run={event.run_id} · step={event.step_id}
          </div>
        </div>
        <span className="shrink-0 text-[10px] text-slate-400">{open ? "收起" : "展开"}</span>
      </button>

      {open ? <div className="mt-3">{renderBody()}</div> : null}
    </div>
  );
}

