"use client";

import { useEffect, useState } from "react";

import { OpsCollapsibleSection } from "@/components/ops/OpsCollapsibleSection";

export type OpsArtifact = {
  id?: string;
  run_id: string;
  kind: string;
  payload: Record<string, unknown>;
  created_at?: string;
};

type OpsRunArtifactsProps = {
  runId: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
};

export function OpsRunArtifacts({ runId, expanded, onExpandedChange }: OpsRunArtifactsProps) {
  const [artifacts, setArtifacts] = useState<OpsArtifact[]>([]);

  useEffect(() => {
    if (!runId) return;

    let cancelled = false;

    fetch(`/api/ops/runs/${encodeURIComponent(runId)}/artifacts`)
      .then((res) => {
        // 404 / 5xx 静默降级：不抛出，返回空数组
        if (!res.ok) return null;
        return res.json().catch(() => null);
      })
      .then((data: unknown) => {
        if (cancelled) return;
        if (
          data &&
          typeof data === "object" &&
          Array.isArray((data as Record<string, unknown>).artifacts)
        ) {
          setArtifacts((data as { artifacts: OpsArtifact[] }).artifacts);
        } else {
          setArtifacts([]);
        }
      })
      .catch(() => {
        if (!cancelled) setArtifacts([]);
      });

    return () => {
      cancelled = true;
    };
  }, [runId]);

  // 无数据时不展示（静默降级）
  if (!runId || artifacts.length === 0) return null;

  return (
    <OpsCollapsibleSection
      title="Artifacts"
      subtitle="本次 run 生成的结构化摘要"
      expanded={expanded}
      onExpandedChange={onExpandedChange}
    >
      <ul className="space-y-3">
        {artifacts.map((art) => (
          <li
            key={`${art.run_id}-${art.kind}`}
            className="rounded-lg border border-slate-200/80 bg-[#f9f9f7]/80 px-3 py-2"
          >
            <div className="text-[11px] font-medium text-slate-600">{art.kind}</div>
            <pre className="mt-2 max-h-[32vh] overflow-auto whitespace-pre-wrap break-words rounded border border-slate-200/60 bg-white/80 p-2 font-mono text-[10px] text-slate-700">
              {JSON.stringify(art.payload, null, 2)}
            </pre>
          </li>
        ))}
      </ul>
    </OpsCollapsibleSection>
  );
}
