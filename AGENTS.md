<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 本仓库协作（给 Agent）

- 动手改代码前，先扫一眼 **`docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`**（环境变量、目录职责、API 契约摘要）。
- 有明确需求时，以 **`content/tasks/task_*.md`** 为执行与验收依据；任务里写了涉及路径则优先遵循。
- 全栈/ RAG / 视觉等长期约定见根目录 **`.cursorrules`**（勿与任务单条冲突时随意删改既有逻辑）。
- 多子仓协作（总设职责、任务单规范与落盘路径）见工作区根 `Projects/AGENTS.md` **§2**，跨仓任务按该约定先写任务初稿再分派子 Agent 丰富。
- 日记/日志规则（含截图占位、引用 ≤ 300 字、禁止本地路径）见工作区根 `DIARY_GUIDE.md`；前端“知识总结”素材写在 `docs/diary/`（按日期命名）。
