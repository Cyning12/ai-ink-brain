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
    label: "Tech Graph 是什么",
  },
  {
    id: "Q3",
    label: "冷/温/热 和 架构三层 区别？",
  },
  {
    id: "Q4",
    label: "简单介绍下刘新宁",
  },
  {
    id: "Q5",
    label: "AI Ink Brain 的架构是怎样的",
  },
] as const;

/** portfolio 演示：Text2SQL 能力 chip（visitor 不禁 text2sql · T-05） */
export const PORTFOLIO_TEXT2SQL_CHIPS: readonly { id: "T1" | "T2"; label: string }[] = [
  {
    id: "T1",
    label: "统计 agent_info 表里有多少条数据",
  },
  {
    id: "T2",
    label: "按日期统计最近 7 天的订单数量",
  },
] as const;

/** 解锁前预览 + 静态降级：RAG 五问 + Text2SQL 两问 */
export const PORTFOLIO_ALL_DEMO_CHIPS = [
  ...PORTFOLIO_DEMO_CHIPS,
  ...PORTFOLIO_TEXT2SQL_CHIPS,
] as const;

/** development 模式保留的 3 条通用 chip（W4 不替换） */
export const DEVELOPMENT_SUGGESTED_PROMPTS: readonly string[] = [
  "统计 agent_info 表里有多少条数据",
  "这篇日志主要讲了什么？请给出引用来源",
  "总结一下 RRF 融合策略的核心思想",
] as const;
