# 任务审核报告：chatbi-v3-lowconf-rag-preview-frontend · R1

| 字段 | 值 |
|------|-----|
| task | `docs/tasks/active/task_chatbi_v3_lowconf_rag_preview_frontend_v1.md` |
| 配对后端 task | `ai-ink-brain-api-python/docs/tasks/active/task_chatbi_v3_lowconf_rag_preview_v1.md` |
| SPEC | `ai-ink-brain-api-python/docs/spec/v3-agent/SPEC-ChatBI-V3-LowConfidence-Plan-Confirm.md`（§2 RAG 预览 · §4 确认令牌） |
| audit_round | R1 |
| freeze_id（前端） | `CHATBI-LOWCONF-RAG-PREVIEW-FE@2026-05-31` |
| freeze_id（后端） | `CHATBI-LOWCONF-RAG-PREVIEW@2026-05-31` |
| audit_profile | `full` |
| test_strategy | `required` |
| kpi_aggregator | `CLOSE` |
| invoke_snapshot | `docs/harness/invokes/by-task/chatbi-v3-lowconf-rag-preview-frontend/invoke_20260531_22_chatbi-v3-lowconf-rag-preview-frontend.md` |
| prev_review | 无 |
| reviewer | Agent（22 帽） |
| date | 2026-05-31 |

---

## 审查结论摘要

**文档层零阻塞 · R1 通过（pass-with-notes）**

前端 task 与配对后端 task、SPEC 对齐；**FE-1～FE-5** 与 **failure_paths F2** 可观测、可验收；`test_strategy: required` 与 `pnpm lint` → `pnpm test` → `pnpm build`（D5）一致。现网 re-baseline 确认：5-2 已落地 Text2SQL 预览链，**`isValidAgentPlanPreviewPayload` 仍强制 `sql_draft`**，与本单 F2 / FE-1 目标冲突——属 **预期缺口**，由 30 红绿测例驱动修复，**不构成 R1 文档阻塞**。

**30 实际开工条件**（Agent **不得**代批 `human_gate`）：

1. 人将 **`HG-TASK-DRAFT`**、**`HG-AUDIT-R1`** 置为 `approved`（本 R1 供人签 **HG-AUDIT-R1** 依据）。
2. **C1 契约增量键** 按下文「22 拍板建议」与后端 manifest **同 PR 或紧耦合双 PR** 落盘后再改消费逻辑（可与 30 首 commit 并行，但 **merge 前** 须双端一致）。

---

## HARNESS_V2_PLAN §5 核对

| # | 字段 / 小节 | 结论 |
|---|-------------|------|
| 1 | `test_strategy: required` | ☑ 与 AGENTS.md §8、task D5 一致 |
| 2 | `failure_paths` ≥1 且可操作 | ☑ F1–F4；**F2 与现网代码一致**（见下） |
| 3 | `freeze_id` | ☑；开跑前与后端 commit 对齐（ID 后缀不同，task 已注明） |
| 4 | `kpi_rubric` + `kpi_aggregator` + `### KPI（00）` 占位 | ☑ |
| 5 | `semi_auto` + `audit_profile: full` | ☑ |
| 6 | `human_gate` 表 | ☑；当前 **pending** → **阻塞 30**，不阻塞 **22 落盘** |
| 7 | 非范围 | ☑ 后端 agent/token 不在本仓 |
| 8 | Harness 落盘路径 | ☑ invoke/review/reinspect 已写明 |

---

## FE-1～FE-5 可测性

| 项 | task 表述 | 可测性 | 备注 |
|----|-----------|--------|------|
| **FE-1** | `tool === rag_search` 时消费 RAG 键，不假定 `sql_draft` 非空 | ☑ | 验收：SSE fixture + validator 单测；无 `sql_draft` 的 RAG 帧 **须** 通过校验 |
| **FE-2** | 按 `tool` 分支标题/正文；保留执行/取消 | ☑ | UI 快照或 RTL 测「非预览 SQL」标题；与 5-2 卡片 diff 可对照 |
| **FE-3** | 续跑 body 含 `plan_execution_token`；问句一致 | ☑ | 可测 transport mock；failure F3/F4 已写 |
| **FE-4** | `ChainEventCard` RAG 分支 | ☑ | 依赖 FE-1 类型/载荷；Timeline 非空断言 |
| **FE-5** | 烟测 Timeline×2 + 截图 + diary 互链 | ☑ | 路径 §实现备忘待 30 填；与后端 `docs/diary/samples/chatbi-v3-lowconf-rag-preview/` 对称 |

**30 建议先红后绿测试（`required`）**：

- `lib/unified-chat/sse/chainPayloadValidators.ts`：`rag_search` + 仅 `rewrite_query`（无 `sql_draft`）→ **须通过**。
- 可选：`UnifiedChatPageClient` 解析分支（mock SSE 事件）。

当前 **无** 针对 `isValidAgentPlanPreviewPayload` 的 Vitest；与 `required` 一致，**须在 30 补测后再改实现**。

---

## F2 · validator 勿强制 `sql_draft`（现网对照）

| 位置 | 现状 | 与 task 关系 |
|------|------|----------------|
| `lib/unified-chat/sse/chainPayloadValidators.ts` L19 | `typeof p.sql_draft !== "string"` → **丢弃整帧** | 命中 task **failure_paths F2** |
| `components/chain-chat/types.ts` | `AgentPlanPreviewPayload.sql_draft: string` **必填** | 30 须改为 **按 `tool` discriminated** 或 optional |
| `UnifiedChatPageClient.tsx` | 卡片文案偏 SQL；`sqlDraft` 状态 | FE-2 范围 |
| `ChainEventCard.tsx` | 仅 `sql_draft` 围栏 | FE-4 范围 |

后端 manifest（`main` 摘要）：`agent.plan.preview` 最小键仍为 `plan_id`,`tool`,`sql_draft`,…（`ai-ink-brain-api-python/docs/_tech_graph/_contract_manifest.json` L89）。**C1** 须在双端 **MODIFIED** 后，前端 validator **不得** 再对 RAG 路径强制 `sql_draft`。

---

## 验证命令（D5）

与 task、根 `AGENTS.md` §8 一致：

```bash
cd ai-ink-brain
pnpm lint && pnpm test && pnpm build
```

契约触达时追加（task §实现触点）：`pnpm tech-graph:manifest-check`（Ink `_contract_manifest.json` 与后端对齐后）。

---

## 跨仓契约 · C1（22 拍板建议）

后端 task §8 **C1** 要求 22 前拍板 `rag_plan` 对象 vs 扁平键。本 R1 **建议**（供 30 + 后端 30 对齐，**非**替代人审双 PR）：

| 决策 | 建议 |
|------|------|
| 形态 | **扁平键**（与现网 `sql_draft` 风格一致，便于 manifest `payload_min_keys`） |
| `tool=rag_search` 时 **新增承诺键** | `rewrite_query`（string，必填）、`planned_top_k`（number，可选）、`preview_headlines`（string[]，可选，标题级摘要） |
| `sql_draft` | **Text2SQL 路径保留**；**RAG 路径 optional**（manifest 与 validator 按 `tool` 分支） |
| 不变键 | `plan_id`, `tool`, `warnings`, `plan_execution_token`, `expires_in_sec` |
| PR 策略 | 与 task 一致：**双 PR 互锁** 或同火车；Ink `docs/_tech_graph/_contract_manifest.json` 与后端 **键名一致** |

**后端 C2**（token purpose）不在本前端 task 范围；前端仅消费 `plan_execution_token` 字段名不变。

task §实现备忘「契约增量键」仍为待填——**非 R1 阻塞**；建议 **30 开编首 commit** 将上表写入 task §实现备忘并与后端 PR 链接。

---

## human_gate

| gate_id | task 状态 | blocks_hats | R1 结论 |
|---------|-----------|-------------|---------|
| HG-TASK-DRAFT | approved | 22-R1, 30 | 人扫 task 后 **approved** → 方可 30 |
| HG-AUDIT-R1 | approved | 30 | 本 R1 **供签收**；人置 **approved** 后 30 可开 |
| HG-REINSPECT | pending | done | 预期；不阻塞 30 |

---

## 阻塞项

**无 task 文档层阻塞。**

---

## 非阻塞 · 30 开编前须闭合

- [ ] **C1** 键名写入双端 manifest + task §实现备忘（见上表建议）。
- [ ] `freeze_id` 与后端 **同一 commit** 钉死（task 已要求）。
- [ ] 后端 **G1–G2** 已发 RAG preview 或提供 **联调 staging**；否则 FE-5 烟测仅能做 mock（task 允许联调在 30 后，但关账前须真机两轮）。

---

## 是否建议执行帽（30）开工

| 维度 | 结论 |
|------|------|
| **22 / 文档** | **可批准** — R1 签收通过 |
| **30 / 实开** | **条件批准** — `HG-TASK-DRAFT` + `HG-AUDIT-R1` 均为 `approved` 后开工；首改 validator/类型须带 **可失败** Vitest |
| **拒开工** | 若 30 Agent 仍见 `human_gate: pending` → 仅输出 `gate_id` 与路径，**禁止**改业务代码 |

---

## 签收 / 关闭

- **R1**：前端 task **可进入执行帽**（文档与 Harness 字段合格）。
- **关账**：本 task **未结束**；待 FE-1～F5、D5、Harness 40/50、`### KPI（00）`。
- **配对**：后端关账 **阻塞**于本单 FE 勾选或书面 defer（人签）— 与后端 task 一致。

---

## 下一棒可复制 Prompt

```text
你正在扮演工作区 Harness「执行编码帽」，严格遵循：
- docs/harness/prompts/30-execute-code.md（身份、只做什么、禁止什么、拒开工、输出形状、交接物）
- docs/harness/prompts/40-self-check.md（验证命令、回填 task「### 自检结论（执行者）」）
- docs/harness/HARNESS_V2_PLAN.md §5（test_strategy、failure_paths、gates_before_code）
- 子仓 AGENTS.md、task 内「给执行帽的必读列表」、根 AGENTS.md §8（合并前必绿命令真值，若与本条 VERIFY 冲突以 task + 子仓 workflow 为准）

输入（已由人工替换占位符；若你仍看到 {{…}} 或「待填」，须先追问用户，不得开工写业务代码）：
- 主 task 路径（相对工作区根 Projects/）：
ai-ink-brain/docs/tasks/active/task_chatbi_v3_lowconf_rag_preview_frontend_v1.md
- 逻辑子仓（task 路径前缀；相对 Projects/）：
ai-ink-brain
- Worktree 研发目录（所有 git/pytest/pnpm 默认 cwd；并行时须与 invoke 元信息 worktree_root 一致，见 docs/harness/README.md「并行分支与 Git worktree」）：
ai-ink-brain
- 合并前须跑通的验证命令（与 CI / task 一致）：
pnpm lint && pnpm test && pnpm build
- 关联任务审核书面结论路径（无则「无」）：
ai-ink-brain/docs/harness/reviews/task_chatbi_v3_lowconf_rag_preview_frontend_v1_audit_R1_20260531.md
- 关联 SPEC / 总规（无则「无」）：
ai-ink-brain-api-python/docs/spec/v3-agent/SPEC-ChatBI-V3-LowConfidence-Plan-Confirm.md

你必须完成：
0. **Invoke 快照（开帽起点）**：在输出下列第 1 条起的实质性结果之前，先将 **本用户消息全文**（= 本模板 §3、占位符已全部替换）按 `docs/harness/invokes/README.md` 落盘到 `ai-ink-brain/docs/harness/invokes/by-task/chatbi-v3-lowconf-rag-preview-frontend/`（含元数据表 + 快照 fenced code）。同一会话内追问 **不** 再新增快照文件。
0b. **人工闸**：扫描 task / 关联 reviews 的 `human_gate`（见 docs/harness/prompts/HANDOFF_SEMI_AUTO.md）。若任一对 **本帽（30）** 为 `pending` → 仅输出须人改的 `gate_id` 与路径，**拒开工**；禁止代填 `approved`。
1. 通读 task 全文：头部 `gates_before_code`、`audit_profile`、`semi_auto`、`test_strategy` / `test_strategy_note`、`freeze_id`、`failure_paths`、拒开工条件、验收标准、必读列表、非范围。
2. 若 task 明示拒开工条件未满足（缺 failure_paths 可操作性、缺验收命令、必读未覆盖等）→ **仅输出 Markdown 阻塞清单**（缺什么、建议回填的小节标题、推荐下一棒角色），**不写**业务实现代码。
3. `test_strategy: required` 时：先增加或调整 **可失败** 的自动化测试（或与实现同 PR 且满足 task 所述 red-green / 可复现失败语义），再改实现；禁止「只写实现、后补测」绕过 task 约定。
4. 在 `ai-ink-brain` 内按 task 范围改代码/配置（**禁止**在并行另一 worktree/checkout 改同一子仓）；禁止静默扩大 scope；SPEC/task 矛盾走变更请求或交回需求帽，不擅自调和为代码假设。
5. 在 `ai-ink-brain` 执行 `pnpm lint && pnpm test && pnpm build`（及 task 另行要求的命令），保留可核对输出要点；修复直至通过或记录环境阻塞并停止扩写。
6. 按 `40-self-check.md` 将结论与命令摘要 **回填** 至 task 正文 **`### 自检结论（执行者）`**（无则新增该小节）。
7. 对话回复：生成可以完整复制的 Prompt，用于直接交给下一棒执行；须兼顾打回、二次审查等情形，下一棒也可能是上一棒（由其修复问题）。
8. **自动 commit**：在输出下一棒 Prompt 且本轮代码/测试/task 自检回填已落盘后，按 docs/harness/prompts/HANDOFF_AUTO_COMMIT.md 在 ai-ink-brain 对应 git 根 commit（仅本轮路径；禁止 git add -A；对话报 short-hash）。用户写明「不要 commit」则跳过。
9. **半自动下一棒（可选）**：若 task `semi_auto: true` 且下一棒（如 40）无 `human_gate` 阻塞：先将 **下一棒 §3 全文** 落盘新 invoke 并 commit，再切换角色执行；规则见 HANDOFF_SEMI_AUTO.md §3。否则仅输出下一棒 Prompt 供人开新会话。

禁止：在未读完必读与 failure_paths 的情况下改路由/契约；删除与 task 无关的大段重构；口头宣称「已测过」而无命令输出。

**本单 30 必读追加（来自 R1）**：
- 先红后绿：`isValidAgentPlanPreviewPayload` 对 `tool=rag_search` **不得** 强制 `sql_draft`（见审查 md F2 · task failure_paths F2）。
- C1：扁平键 `rewrite_query`（RAG 必填）+ 可选 `planned_top_k` / `preview_headlines`；与后端 `_contract_manifest.json` 同 PR 或紧耦合 PR。
- 触点：`chainPayloadValidators.ts`、`types.ts`、`UnifiedChatPageClient.tsx`、`ChainEventCard.tsx`、Ink `_contract_manifest.json`。

Judgment（本帽 · 对话末尾必填；warn/fail 须可写入 00 的 judgment_notes）：
- experience_capture: 维持 | 建议升级 required | 维持 n/a（≤1 行理由）
- gate/risk: 无 | human_gate:<id> | 证据不足
- hat_self: pass | pass-with-notes | blocked
```
