"use client";

import { useMemo } from "react";

type Props = {
  columns?: string[];
  rows?: Array<Record<string, unknown>>;
  maxRows?: number;
};

function toCell(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export function SqlResultTable({ columns, rows, maxRows = 20 }: Props) {
  const safeRows = Array.isArray(rows) ? rows.slice(0, maxRows) : [];
  const cols = useMemo(() => {
    if (Array.isArray(columns) && columns.length) return columns;
    if (!safeRows.length) return [];
    return Object.keys(safeRows[0] ?? {});
  }, [columns, safeRows]);

  if (!cols.length) {
    return <div className="text-[11px] text-slate-500">（无 rows）</div>;
  }

  return (
    <div className="overflow-auto rounded-xl border border-[color:var(--color-border)] bg-white/60">
      <table className="w-full border-collapse text-left text-[11px]">
        <thead>
          <tr className="border-b border-[color:var(--color-border)]">
            {cols.map((c) => (
              <th key={c} className="px-3 py-2 font-mono text-slate-600">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeRows.map((r, i) => (
            <tr key={i} className="border-b border-[color:var(--color-border)]/60 last:border-b-0">
              {cols.map((c) => (
                <td key={c} className="px-3 py-2 font-mono text-slate-700">
                  {toCell(r?.[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

