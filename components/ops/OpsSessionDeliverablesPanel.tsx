"use client";

import { copyTextToClipboard } from "@/lib/ops/chat";
import type { OpsSessionDeliverable } from "@/lib/ops/session";

type OpsSessionDeliverablesPanelProps = {
  deliverables: OpsSessionDeliverable[];
  onCopyFeedback?: (label: string) => void;
};

function serializeDeliverable(item: OpsSessionDeliverable): string {
  const lines = [`run_id: ${item.run_id}`, `path: ${item.path}`];
  if (item.type) lines.push(`type: ${item.type}`);
  if (item.route) lines.push(`route: ${item.route}`);
  if (item.files?.length) {
    lines.push("files:");
    for (const file of item.files) {
      lines.push(`  - ${file.path}${file.type ? ` (${file.type})` : ""}`);
    }
  }
  return lines.join("\n");
}

export function OpsSessionDeliverablesPanel({
  deliverables,
  onCopyFeedback,
}: OpsSessionDeliverablesPanelProps) {
  if (deliverables.length === 0) return null;

  return (
    <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40 px-4 py-4">
      <div className="font-serif text-sm text-[#2c2c2c]">交付物（deliverables）</div>
      <p className="mt-1 text-[11px] text-slate-500">
        只读镜像 · 落盘于 session 目录 deliverables/
      </p>
      <ul className="mt-3 space-y-2">
        {deliverables.map((item) => (
          <li
            key={item.run_id}
            className="rounded-lg border border-slate-200/80 bg-[#f9f9f7]/80 px-3 py-2 text-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-mono text-[11px] text-slate-600">
                run {item.run_id}
                {item.route ? (
                  <span className="ml-2 rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] text-slate-700">
                    {item.route}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() =>
                  void copyTextToClipboard(serializeDeliverable(item)).then((ok) => {
                    if (ok) onCopyFeedback?.("交付物路径");
                  })
                }
                className="rounded-md border border-slate-200 bg-white/80 px-2 py-0.5 text-[10px] text-slate-600 hover:border-slate-300"
              >
                复制路径
              </button>
            </div>
            <div className="mt-1 font-mono text-[11px] text-slate-700">{item.path}</div>
            {item.files && item.files.length > 0 ? (
              <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
                {item.files.map((file) => (
                  <li key={file.path} className="font-mono">
                    {file.name}
                    {file.type ? ` · ${file.type}` : ""}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
