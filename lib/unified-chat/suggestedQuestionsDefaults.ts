import {
  DEVELOPMENT_SUGGESTED_PROMPTS,
  PORTFOLIO_ALL_DEMO_CHIPS,
} from "@/lib/unified-chat/portfolio-demo-chips";

export type SuggestedQuestionsMode = "portfolio" | "development" | "chain";

/** Chain Chat 解锁后推荐问法静态降级列表 */
export const CHAIN_SUGGESTED_PROMPTS: readonly string[] = [
  "统计 agent_info 表里有多少条数据",
  "按日期统计订单数量（最近 7 天）",
  "Top5 用户的订单金额",
] as const;

/** API 不可用时的静态默认列表（与 portfolio-demo-chips / Chain 页原硬编码一致） */
export function getDefaultSuggestedQuestions(mode: SuggestedQuestionsMode): string[] {
  switch (mode) {
    case "portfolio":
      return PORTFOLIO_ALL_DEMO_CHIPS.map((c) => c.label);
    case "development":
      return [...DEVELOPMENT_SUGGESTED_PROMPTS];
    case "chain":
      return [...CHAIN_SUGGESTED_PROMPTS];
    default: {
      const _exhaustive: never = mode;
      return _exhaustive;
    }
  }
}
