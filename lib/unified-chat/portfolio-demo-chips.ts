/**
 * Portfolio / development 推荐问法静态降级列表（API 失败时使用）。
 * 运行时优先 `GET /api/py/chat/suggested-questions`（见 suggestedQuestionsApi.ts）。
 */

export type PortfolioDemoChip = { id: "Q1" | "Q2" | "Q3" | "Q4" | "Q5"; label: string };

export const PORTFOLIO_DEMO_CHIPS: readonly PortfolioDemoChip[] = [
  {
    id: "Q1",
    label: "《AI 编程可闭环协作》卷三讲什么？Harness 和签收是什么？",
  },
  {
    id: "Q2",
    label: "RAG 混合检索怎么做的？",
  },
  {
    id: "Q3",
    label: "冷/温/热 和 架构三层 区别？",
  },
  {
    id: "Q4",
    label: "11 年经历里 AI Coding 相关成果？",
  },
  {
    id: "Q5",
    label: "按需读图相对整图灌入 token/效果？边界？",
  },
] as const;

/** development 模式保留的 3 条通用 chip（W4 不替换） */
export const DEVELOPMENT_SUGGESTED_PROMPTS: readonly string[] = [
  "统计 agent_info 表里有多少条数据",
  "这篇日志主要讲了什么？请给出引用来源",
  "总结一下 RRF 融合策略的核心思想",
] as const;
