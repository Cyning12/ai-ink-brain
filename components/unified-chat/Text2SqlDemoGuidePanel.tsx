"use client";

import { useState } from "react";

import {
  TEXT2SQL_DEMO_EXAMPLES,
  TEXT2SQL_DEMO_INTRO,
  TEXT2SQL_DEMO_TABLES,
  TEXT2SQL_DEMO_USAGE,
} from "@/lib/unified-chat/text2sql-demo-guide";

type Text2SqlDemoGuidePanelProps = {
  /** portfolio 访客默认展开 */
  defaultOpen?: boolean;
};

export function Text2SqlDemoGuidePanel({ defaultOpen = false }: Text2SqlDemoGuidePanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] px-4 py-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <div>
          <div className="text-[12px] font-medium text-indigo-950">Text2SQL 使用说明</div>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
            演示 Postgres 样例库 · 9 张业务表 · 与 RAG 文稿检索并存
          </p>
        </div>
        <span className="shrink-0 pt-0.5 text-[11px] text-indigo-800/80">{open ? "收起" : "展开"}</span>
      </button>

      {open ? (
        <div className="mt-3 space-y-4 border-t border-indigo-500/15 pt-3 text-[11px] leading-relaxed text-slate-700">
          <p>{TEXT2SQL_DEMO_INTRO}</p>

          <div>
            <div className="mb-2 font-medium text-slate-800">样例表一览</div>
            <ul className="space-y-2">
              {TEXT2SQL_DEMO_TABLES.map((t) => (
                <li
                  key={t.name}
                  className="rounded-lg border border-[color:var(--color-border)] bg-white/50 px-3 py-2"
                >
                  <span className="font-mono text-[11px] text-slate-800">{t.name}</span>
                  <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                    {t.domain}
                  </span>
                  <p className="mt-1 text-slate-600">{t.summary}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-2 font-medium text-slate-800">怎么用</div>
            <ul className="list-disc space-y-1 pl-4 text-slate-600">
              {TEXT2SQL_DEMO_USAGE.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-2 font-medium text-slate-800">示例问法</div>
            <ul className="list-disc space-y-1 pl-4 text-slate-600">
              {TEXT2SQL_DEMO_EXAMPLES.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
