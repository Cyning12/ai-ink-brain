/**
 * Text2SQL 子阶段 SSE：与 `_contract_manifest.json` 中
 * `text2sql.phase.start` / `text2sql.phase.end` 及 `tool.call.end.output.text2sql_phases_ms` 对齐的纯校验与抽取。
 */

export const TEXT2SQL_PHASE_KINDS = ["llm", "db", "io"] as const;
export type Text2SqlPhaseKind = (typeof TEXT2SQL_PHASE_KINDS)[number];

export function isText2SqlPhaseKind(s: string): s is Text2SqlPhaseKind {
  return (TEXT2SQL_PHASE_KINDS as readonly string[]).includes(s);
}

/** manifest：`text2sql.phase.start` → subphase_id, phase_id, phase_kind */
export function isValidText2SqlPhaseStartPayload(p: Record<string, unknown>): boolean {
  const sub = p.subphase_id;
  const pid = p.phase_id;
  const pk = p.phase_kind;
  return (
    typeof sub === "string" &&
    sub.trim().length > 0 &&
    typeof pid === "string" &&
    pid.trim().length > 0 &&
    typeof pk === "string" &&
    isText2SqlPhaseKind(pk)
  );
}

/** manifest：`text2sql.phase.end` → subphase_id, phase_id, latency_ms */
export function isValidText2SqlPhaseEndPayload(p: Record<string, unknown>): boolean {
  const sub = p.subphase_id;
  const pid = p.phase_id;
  const lat = p.latency_ms;
  return (
    typeof sub === "string" &&
    sub.trim().length > 0 &&
    typeof pid === "string" &&
    pid.trim().length > 0 &&
    typeof lat === "number" &&
    Number.isFinite(lat)
  );
}

/**
 * 仅读取 `output.text2sql_phases_ms`（终态分段 ms 真值）；不遍历 output 其它键。
 */
export function extractText2sqlPhasesMsFromToolOutput(output: unknown): Record<string, number> | null {
  if (!output || typeof output !== "object" || Array.isArray(output)) return null;
  const o = output as Record<string, unknown>;
  const raw = o.text2sql_phases_ms;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const src = raw as Record<string, unknown>;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(src)) {
    if (typeof v === "number" && Number.isFinite(v)) out[k] = Math.round(v);
  }
  return Object.keys(out).length > 0 ? out : null;
}
