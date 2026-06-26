"use client";

import type { ReactNode } from "react";

type OpsCollapsibleSectionProps = {
  title: string;
  subtitle?: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  actions?: ReactNode;
  children: ReactNode;
};

/** Ops 面板折叠容器 · 默认由父组件控制 expanded 初值 */
export function OpsCollapsibleSection({
  title,
  subtitle,
  expanded,
  onExpandedChange,
  actions,
  children,
}: OpsCollapsibleSectionProps) {
  return (
    <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40">
      <div className="flex items-start justify-between gap-2 border-b border-[color:var(--color-border)] px-4 py-3">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <button
            type="button"
            onClick={() => onExpandedChange(!expanded)}
            aria-expanded={expanded}
            aria-label={expanded ? "收起" : "展开"}
            className="shrink-0 rounded-md border border-slate-200 bg-white/80 px-2 py-0.5 text-[10px] text-slate-600 hover:border-slate-300 hover:text-slate-800"
          >
            {expanded ? "收起" : "展开"}
          </button>
          <div className="min-w-0">
            <div className="font-serif text-sm text-[#2c2c2c]">{title}</div>
            {subtitle ? (
              <div className="mt-0.5 text-[11px] text-slate-500">{subtitle}</div>
            ) : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {expanded ? (
        <div className="max-h-[60vh] overflow-auto px-4 py-3">{children}</div>
      ) : null}
    </section>
  );
}
