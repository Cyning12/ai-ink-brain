import type { ChainEvent } from "@/components/chain-chat/types";
import { chainEventFromSse } from "@/lib/unified-chat/sse/chainEventFromSse";

export type ApplyChainSseFrameResult =
  | { kind: "parse_error" }
  | {
      kind: "chain";
      event: ChainEvent;
      /** `meta.payload.run_id` 若存在，供外层切换 canonical run_id */
      serverRunFromMeta: string | null;
    };

/** 从 chain 原始 JSON 提取服务端 canonical `run_id`（仅 `type=meta`） */
export function extractServerRunIdFromChainRaw(raw: Record<string, unknown>): string | null {
  const chainType = typeof raw.type === "string" ? raw.type : "";
  if (chainType !== "meta") return null;
  const pl = raw.payload;
  if (!pl || typeof pl !== "object") return null;
  const rid = (pl as Record<string, unknown>).run_id;
  if (typeof rid === "string" && rid.trim()) return rid.trim();
  return null;
}

/** 解析单帧 `event: chain` 的 data JSON（含 meta.run_id 与白名单归一化） */
export function applyChainSseFrame(args: {
  dataJson: unknown;
  currentRunId: string;
  fallbackStepId?: string;
}): ApplyChainSseFrameResult {
  if (args.dataJson == null) return { kind: "parse_error" };
  const rawObj = args.dataJson as Record<string, unknown>;
  const serverRunFromMeta = extractServerRunIdFromChainRaw(rawObj);
  const runIdForEvent = serverRunFromMeta ?? args.currentRunId;
  const ev = chainEventFromSse({
    runId: runIdForEvent,
    raw: args.dataJson,
    fallbackStepId: args.fallbackStepId ?? "chain",
  });
  if (!ev) return { kind: "parse_error" };
  return { kind: "chain", event: ev, serverRunFromMeta };
}
