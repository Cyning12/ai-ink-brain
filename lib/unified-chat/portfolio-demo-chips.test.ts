import { describe, expect, it } from "vitest";

import { PORTFOLIO_DEMO_CHIPS } from "@/lib/unified-chat/portfolio-demo-chips";

/** 与 ai-ink-brain-api-python `chat_suggested_questions` 默认列表对齐（API 失败降级） */
const BACKEND_ALIGNED_LABELS = [
  "《AI 编程可闭环协作》卷三讲什么？Harness 和签收是什么？",
  "Tech Graph 是什么",
  "冷/温/热 和 架构三层 区别？",
  "简单介绍下刘新宁",
  "AI Ink Brain 的架构是怎样的",
] as const;

describe("PORTFOLIO_DEMO_CHIPS", () => {
  it("matches backend suggested-questions default list", () => {
    expect(PORTFOLIO_DEMO_CHIPS.map((c) => c.label)).toEqual([...BACKEND_ALIGNED_LABELS]);
  });
});
