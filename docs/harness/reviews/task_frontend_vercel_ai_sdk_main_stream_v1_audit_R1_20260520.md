# 任务审核：主流程流式体验 — 迁移 Vercel AI SDK（R1）

## 元信息

| 项 | 内容 |
|----|------|
| **关联 task** | [`../../tasks/active/task_frontend_vercel_ai_sdk_main_stream_v1.md`](../../tasks/active/task_frontend_vercel_ai_sdk_main_stream_v1.md) |
| **轮次** | R1 |
| **审查日期** | 2026-05-20 |
| **invoke_snapshot（22 帽）** | `../invokes/by-task/frontend-vercel-ai-sdk-main-stream/invoke_20260520_22_frontend-vercel-ai-sdk-main-stream-audit.md`（**未入库** · 本 review 全文为准） |
| **需求帽 invoke** | `../invokes/by-task/frontend-vercel-ai-sdk-main-stream/invoke_20260520_10_frontend-vercel-ai-sdk-main-stream-requirements.md`（**未入库**） |
| **上一轮审查** | 无 |
| **关联 SPEC** | `ai-ink-brain-api-python/docs/spec/v2-agent/SPEC-ChatBI-V2-Incremental-SSE-Timeline-vNext.md`、`ai-ink-brain-api-python/docs/spec/v2-agent/SPEC-ChatBI-V2-Events.md` |
| **对照规约** | `docs/harness/prompts/22-task-audit.md`、`docs/harness/HARNESS_V2_PLAN.md` §5（工作区根） |
| **建议分支** | `feat/unified-chat-ai-sdk-stream-v1`（自 `main`） |

---

## 审查结论摘要

待审 task 已由需求帽回填为 **implementation 级** 正文：`test_strategy: required` 与 `test_strategy_note`、§9 可观测验收表（含 **V-PARSER / V-TRANSPORT** vitest）、§11 **failure_paths**（12 条 FP）、§12 **C1–C5** 矛盾扫描、PR1–PR4 与 T0–T5 拆分均齐备。对照现网代码（`UnifiedChatPageClient.tsx` 内 `parseSseBlocks` / `safeJson` / `send` SSE 循环、`route.ts` 503 透传、`loading` 门闩与 `streamAbortRef`），**方案 A + Phase 1 Timeline adapter** 可执行，且与 done v1 回归叙事一致。

**结论**：**零阻塞**；**建议 30 执行帽** 按 PR1→PR4 开工（分支 `feat/unified-chat-ai-sdk-stream-v1`）。`audit_profile: full` 表示执行完成后须 **R2 签收**，本轮 R1 **不** 声明 task 可关闭。

---

## 阻塞 / 非阻塞

| 类型 | 说明 |
|------|------|
| **阻塞** | 无 |
| **非阻塞（已核对）** | （1）**HARNESS §5.1 `required`**：§9 **V-PARSER / V-TRANSPORT**、§13 第 3 条「T1 先于 T2」、PR1（仅抽取+测）先于 PR2（SDK）满足「先可失败自动化再改 UI」。（2）**§5.3 failure_paths**：FP-503/401/4xx/NOBODY/BAD-SSE/TOKEN-IGNORE/ABORT/DUP-SEND/DONE-*/SESSION/CHAIN-ERROR 均含触发→行为→可重试→用户可见；与 `route.ts`（503 JSON）、`fetchWithAuthRecovery`、`pickErrorMessage`、`loading`+`disabled={loading}`（约 L2109）、`streamAbortRef`（约 L965–991、L1778+）一致。（3）**v1 回归**：§8 + §9 人测项覆盖 done 任务 CHATBI/RAG/SQL/done/abort/契约头；C1 要求 parser vitest 等价。（4）**scope**：§4 明确不验收 vNext `single_panel`、不改 Python、不迁 `chatApi.ts`；C2/C5 与 vNext 任务分离；§13 第 5 条禁止混 PR。（5）**方案 A Phase 1**：允许 SDK 正文 + 原 `setEvents` adapter 双写，PR3 收敛，与现网 ~2k 行组件可渐进拆分。（6）**BFF**：`route.ts` 已透传 `body` 与 `X-ChatBI-Sse-Contract`，本单「保持」合理。 |
| **非阻塞（执行帽注意，不必 R2 前改 task）** | （1）§7 所列 `chainEventFromSse.ts` 为 **拟抽取名**；现网 chain 归一化在 `send` 循环内联（约 L1048+），T1 须一并迁出白名单/`meta.run_id` 切换逻辑，避免只迁 `parseSseBlocks`。（2）§13「993–1200 行」与当前文件略有漂移；以 `parseSseBlocks`（约 L506）、`send`（约 L938）、read loop（约 L1034）为准。（3）T0 选型短文阻塞 **PR2 前** 落盘，不阻塞 R1 签执行。（4）`plan_execution_token` 预览执行路径现网已有（约 L942–959），task 未单列 FP，执行时 **勿回归**。 |

---

## 需任务帽回填清单（若有）

本轮 **无必须回填项**（零阻塞）。上表「执行帽注意」由执行阶段自检即可；若执行中发现 transport 无法复用 `fetchWithAuthRecovery` 401 恢复语义，再交 **10 帽** 增补 FP 或 §13 一条，并触发 **R2** 再审。

---

## 是否建议执行帽开工

**建议开工**。

1. 开工前读完：done [`../../tasks/done/task_frontend_unified_chat_streaming_sse_v1.md`](../../tasks/done/task_frontend_unified_chat_streaming_sse_v1.md)、本 task §11–§13、两份 vNext SPEC（**不实现** single_panel）。  
2. 严格 **PR1→PR4**；**禁止** PR2 前无 `lib/unified-chat/sse/*.test.ts`。  
3. 合并前：`pnpm lint` → `pnpm test` → `pnpm build`（根 `AGENTS.md` §8）。  
4. 与 [`../../tasks/active/task_chatbi_v2_incremental_sse_timeline_frontend_v1.md`](../../tasks/active/task_chatbi_v2_incremental_sse_timeline_frontend_v1.md) **分 PR**；冲突时本单契约优先（§13-5）。

---

## 签收 / 关闭

| 项 | 结论 |
|----|------|
| **本轮 R1** | **通过审查**；**准许进入 30 执行帽**；task 头部可维持 `draft` 直至执行开 PR，或由任务帽改为 `active`（纪律项，非阻塞）。 |
| **task 正式关闭** | **未满足**。须：§8 验收全勾、§15 实现备忘回填、vitest+CI 绿、演示脚本走通；执行后 **40 自检** 回填 `### 自检结论（执行者）`；再由 **R2** 在「签收 / 关闭」声明可 `done`。 |

---

## 下一棒可复制 Prompt

以下与 **对话回复** 中「下一棒」块 **逐字一致**。

```text
你正在扮演工作区 Harness「执行编码帽」，严格遵循：
- docs/harness/prompts/30-execute-code.md（身份、只做什么、禁止什么、拒开工、输出形状、交接物）
- docs/harness/prompts/40-self-check.md（验证命令、回填 task「### 自检结论（执行者）」）
- docs/harness/HARNESS_V2_PLAN.md §5（test_strategy、failure_paths、gates_before_code）
- 子仓 AGENTS.md、task 内「给执行帽的必读列表」、根 AGENTS.md §8（合并前必绿命令真值，若与本条 VERIFY 冲突以 task + 子仓 workflow 为准）

输入（已由人工替换占位符；若你仍看到 {{…}} 或「待填」，须先追问用户，不得开工写业务代码）：
- 主 task 路径（相对工作区根 Projects/）：
ai-ink-brain/docs/tasks/active/task_frontend_vercel_ai_sdk_main_stream_v1.md
- 子仓根（相对 Projects/；所有 git/pytest/pnpm 默认 cwd）：
ai-ink-brain
- 合并前须跑通的验证命令（与 CI / task 一致）：
pnpm lint && pnpm test && pnpm build
- 关联任务审核书面结论路径（无则「无」）：
ai-ink-brain/docs/harness/reviews/task_frontend_vercel_ai_sdk_main_stream_v1_audit_R1_20260520.md
- 关联 SPEC / 总规（无则「无」）：
ai-ink-brain-api-python/docs/spec/v2-agent/SPEC-ChatBI-V2-Incremental-SSE-Timeline-vNext.md
ai-ink-brain-api-python/docs/spec/v2-agent/SPEC-ChatBI-V2-Events.md

你必须完成：
0. **Invoke 快照（开帽起点）**：在输出下列第 1 条起的实质性结果之前，先将 **本用户消息全文**（= 本模板 §3、占位符已全部替换）按 `docs/harness/invokes/README.md` 落盘。前端 task 落盘至 `ai-ink-brain/docs/harness/invokes/`（含元数据表 + 快照 fenced code）。同一会话内追问 **不** 再新增快照文件。
0b. **人工闸**：扫描 task / 关联 reviews 的 `human_gate`（见 docs/harness/prompts/HANDOFF_SEMI_AUTO.md）。若任一对 **本帽（30）** 为 `pending` → 仅输出须人改的 `gate_id` 与路径，**拒开工**；禁止代填 `approved`。
1. 通读 task 全文：头部 `gates_before_code`、`audit_profile`、`semi_auto`、`test_strategy` / `test_strategy_note`、`freeze_id`、`failure_paths`、拒开工条件、验收标准、必读列表、非范围。
2. 若 task 明示拒开工条件未满足（缺 failure_paths 可操作性、缺验收命令、必读未覆盖等）→ **仅输出 Markdown 阻塞清单**（缺什么、建议回填的小节标题、推荐下一棒角色），**不写**业务实现代码。
3. `test_strategy: required` 时：先增加或调整 **可失败** 的自动化测试（或与实现同 PR 且满足 task 所述 red-green / 可复现失败语义），再改实现；禁止「只写实现、后补测」绕过 task 约定。
4. 在 `ai-ink-brain` 内按 task 范围改代码/配置；在分支 **`feat/unified-chat-ai-sdk-stream-v1`** 上工作；禁止静默扩大 scope；SPEC/task 矛盾走变更请求或交回需求帽，不擅自调和为代码假设。
5. 在子仓根执行 `pnpm lint && pnpm test && pnpm build`（及 task 另行要求的命令），保留可核对输出要点；修复直至通过或记录环境阻塞并停止扩写。
6. 按 `40-self-check.md` 将结论与命令摘要 **回填** 至 task 正文 **`### 自检结论（执行者）`**（无则新增该小节）。
7. 对话回复：生成可以完整复制的 Prompt，用于直接交给下一棒执行；须兼顾打回、二次审查等情形，下一棒也可能是上一棒（由其修复问题）。
8. **自动 commit**：在输出下一棒 Prompt 且本轮代码/测试/task 自检回填已落盘后，按 docs/harness/prompts/HANDOFF_AUTO_COMMIT.md 在 ai-ink-brain 对应 git 根 commit（仅本轮路径；禁止 git add -A；对话报 short-hash）。用户写明「不要 commit」则跳过。
9. **半自动下一棒（可选）**：若 task `semi_auto: true` 且下一棒（如 40）无 `human_gate` 阻塞：先将 **下一棒 §3 全文** 落盘新 invoke 并 commit，再切换角色执行；规则见 HANDOFF_SEMI_AUTO.md §3。否则仅输出下一棒 Prompt 供人开新会话。

禁止：在未读完必读与 failure_paths 的情况下改路由/契约；删除与 task 无关的大段重构；口头宣称「已测过」而无命令输出。
```

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-05-20 | R1：零阻塞；建议 30 执行；签收待执行与 R2 |
| 2026-05-18 | 真值迁入 `ai-ink-brain/docs/harness/reviews/`；工作区根改指针 |
