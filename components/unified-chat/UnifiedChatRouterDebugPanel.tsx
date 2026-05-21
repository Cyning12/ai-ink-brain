"use client";

import {
  extractAgentIntentObs,
  extractRouterDecision,
  extractRouterEvidence,
  modeTone,
  type AgentIntentObsRow,
  type RouterDecision,
  type RouterEvidence,
} from "@/lib/unified-chat/chainEventSelectors";
import { safeStringify } from "@/lib/unified-chat/stringify";
import type { ChainEvent } from "@/components/chain-chat/types";

type Props = {
  events: ChainEvent[];
  debugRouter: boolean;
};

export function UnifiedChatRouterDebugPanel({ events, debugRouter }: Props) {
  const routerDecision = extractRouterDecision(events);
  const routerEvidence = extractRouterEvidence(events);
  const agentIntentObs = extractAgentIntentObs(events);

  return (
    <details className="rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7]/70 p-3">
      <summary className="cursor-pointer select-none text-[12px] text-slate-700">
        路由决策（intent router）
      </summary>
      <div className="mt-3 space-y-2">
        <RouterDecisionBlock routerDecision={routerDecision} />
        <RouterEvidenceBlock routerEvidence={routerEvidence} />
        {debugRouter ? <AgentIntentBlock agentIntentObs={agentIntentObs} /> : null}
      </div>
    </details>
  );
}

function RouterDecisionBlock({ routerDecision }: { routerDecision: RouterDecision | null }) {
  if (!routerDecision?.final_mode) {
    return (
      <div className="text-[11px] text-slate-500">
        （本轮 events 未发现 <span className="font-mono">router.decision</span>）
      </div>
    );
  }
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-700">
        <span className="text-slate-500">final_mode</span>
        <span
          className={[
            "rounded-full border px-2 py-0.5 font-mono",
            modeTone(routerDecision.final_mode),
          ].join(" ")}
        >
          {routerDecision.final_mode}
        </span>
        {routerDecision.candidate_mode ? (
          <>
            <span className="text-slate-500">candidate</span>
            <span className="rounded-full border border-[color:var(--color-border)] bg-white/60 px-2 py-0.5 font-mono text-slate-700">
              {routerDecision.candidate_mode}
            </span>
          </>
        ) : null}
        {routerDecision.prefer ? (
          <>
            <span className="text-slate-500">prefer</span>
            <span className="rounded-full border border-[color:var(--color-border)] bg-white/60 px-2 py-0.5 font-mono text-slate-700">
              {routerDecision.prefer}
            </span>
          </>
        ) : null}
      </div>
      {routerDecision.rule_hits?.length ? (
        <div className="space-y-1">
          <div className="text-[11px] text-slate-500">rule_hits</div>
          <div className="flex flex-wrap gap-2">
            {routerDecision.rule_hits.map((h) => (
              <span
                key={h}
                className="rounded-full border border-[color:var(--color-border)] bg-white/60 px-2 py-0.5 text-[11px] text-slate-700"
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {routerDecision.evidence ? (
        <div className="space-y-1">
          <div className="text-[11px] text-slate-500">evidence</div>
          <pre className="max-h-[22vh] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2 font-mono text-[10px] text-slate-700">
            {safeStringify(routerDecision.evidence)}
          </pre>
        </div>
      ) : null}
      {typeof routerDecision.fallback === "string" && routerDecision.fallback.trim() ? (
        <div className="space-y-1">
          <div className="text-[11px] text-slate-500">fallback</div>
          <div className="whitespace-pre-wrap text-[11px] text-slate-700">{routerDecision.fallback}</div>
        </div>
      ) : null}
    </>
  );
}

function RouterEvidenceBlock({ routerEvidence }: { routerEvidence: RouterEvidence | null }) {
  if (routerEvidence?.raw) {
    return (
      <div className="space-y-1">
        <div className="text-[11px] text-slate-500">router.evidence（raw）</div>
        <pre className="max-h-[22vh] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2 font-mono text-[10px] text-slate-700">
          {safeStringify(routerEvidence.raw)}
        </pre>
      </div>
    );
  }
  return (
    <div className="text-[11px] text-slate-500">
      （本轮 events 未发现 <span className="font-mono">router.evidence</span>）
    </div>
  );
}

function AgentIntentBlock({ agentIntentObs }: { agentIntentObs: AgentIntentObsRow | null }) {
  return (
    <div className="mt-4 border-t border-[color:var(--color-border)] pt-3">
      <div className="text-[11px] font-medium text-slate-600">Intent（V2）</div>
      <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
        同一 session 多轮对话时，<span className="font-mono">cache=miss</span> 很常见：Intent
        缓存键包含历史摘要，历史变化会导致复合键变化，不代表缓存失效。
      </p>
      {agentIntentObs ? (
        <dl className="mt-2 grid gap-1.5 text-[11px] text-slate-700">
          {(
            [
              ["tool", agentIntentObs.tool],
              ["mode", agentIntentObs.mode],
              ["confidence", agentIntentObs.confidence],
              ["cache", agentIntentObs.cache],
              ["cache_key_hash", agentIntentObs.cache_key_hash],
              ["latency_ms", agentIntentObs.latency_ms],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="flex flex-wrap items-baseline justify-between gap-2">
              <dt className="text-slate-500">{label}</dt>
              <dd className={label === "cache_key_hash" ? "break-all font-mono" : "font-mono"}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="mt-2 text-[11px] text-slate-500">
          （本轮 events 未发现 <span className="font-mono">agent.intent</span>，或 Agent 路径未启用）
        </div>
      )}
    </div>
  );
}
