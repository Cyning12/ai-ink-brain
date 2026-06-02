# Task 50 复检 · portfolio-unified-chat-ui-v1

| 字段 | 值 |
|------|-----|
| **task** | `content/tasks/active/task_portfolio_unified_chat_ui_v1.md` |
| **日期** | 2026-06-02 |
| **git_branch** | `task/portfolio-visitor-auth-v1` |
| **impl_commit** | `99015b7` |
| **复检帽** | 50（Fresh Context 对照） |

## 结论

**warn → 可关账**（UI/chip/裁剪就绪；五问 E2E 明确归 W6，非本 task 硬 FAIL）

| 维度 | 判定 |
|------|------|
| §6.6 裁剪逻辑 | **pass** |
| §6.4 chip 5 条 | **pass**（纯文本与 SPEC 语义逐字一致） |
| 双 mode build | **pass** |
| W3 unlock 未推翻 | **pass** |
| 五问 RAG 答通 | **defer W6**（warn 项，task 非范围已声明） |

## 自动化

| 命令 | 结果 |
|------|------|
| `pnpm lint` | ✅ |
| `pnpm test` | ✅ 45/45 |
| `pnpm build` | ✅ |
| `NEXT_PUBLIC_SITE_MODE=portfolio pnpm build` | ✅ |

## §6.4 chip 源码对照（`portfolio-demo-chips.ts`）

| ID | SPEC 提问列（可见语义） | 源码 `label` | |
|----|-------------------------|--------------|---|
| Q1 | 《AI 编程可闭环协作》卷三讲什么？Harness 和签收是什么？ | 一致 | ✅ |
| Q2 | RAG 混合检索怎么做的？ | 一致 | ✅ |
| Q3 | 冷/温/热 和 架构三层 区别？ | 一致 | ✅ |
| Q4 | 11 年经历里 AI Coding 相关成果？ | 一致 | ✅ |
| Q5 | 按需读图相对整图灌入 token/效果？边界？ | 一致 | ✅ |

## §6.6 裁剪（代码路径）

| 检查 | 文件 / 符号 | 结果 |
|------|-------------|------|
| L2 无 Timeline | `showTimelinePanels` | ✅ |
| 两档无 Router Debug | `showRouterDebug` / `portfolioRouterDebugVisible()` | ✅ |
| L2 忽略 debug URL | `debugUrlAllowed` + `debugEnabled` | ✅ |
| level 持久化 | `chatbi-client` sessionStorage | ✅ |
| locked chip | unlock 区 `PORTFOLIO_DEMO_CHIPS` | ✅ |

## warn 说明

- 未做浏览器目视 E2E（维护者本地 unlock 两档 token 可补验）。
- 五问 ingest/答通不在本 task 验收范围。

## 建议

**HG-REINSPECT 人签后 CLOSE** · KPI 聚合 · `git mv` → `done/`。
