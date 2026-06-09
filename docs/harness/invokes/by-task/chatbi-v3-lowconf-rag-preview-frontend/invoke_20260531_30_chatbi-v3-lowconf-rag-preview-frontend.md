# Invoke · 30 执行编码 · chatbi-v3-lowconf-rag-preview-frontend

| 字段 | 值 |
|------|-----|
| **hat** | 30-execute-code |
| **task_slug** | `chatbi-v3-lowconf-rag-preview-frontend` |
| **task_path** | `ai-ink-brain/docs/tasks/active/task_chatbi_v3_lowconf_rag_preview_frontend_v1.md` |
| **git_branch** | `task/chatbi-v3-lowconf-rag-preview`（建议 · 与后端同火车） |
| **worktree_root** | `ai-ink-brain` |
| **human_gate** | 开工前确认 `HG-TASK-DRAFT` / `HG-AUDIT-R1` 非 `pending`（若仍 pending → 仅输出 gate_id，拒开工） |
| **audit_review** | `ai-ink-brain/docs/harness/reviews/task_chatbi_v3_lowconf_rag_preview_frontend_v1_audit_R1_20260531.md`（22 落盘后填；首轮无则先跑 22） |

---

## §3 可复制 Prompt 正文（交给前端 Agent · Open `ai-ink-brain/`）

```text
你正在扮演工作区 Harness「执行编码帽」，严格遵循：
- Projects/docs/harness/prompts/30-execute-code.md
- Projects/docs/harness/prompts/40-self-check.md
- Projects/docs/harness/HARNESS_V2_PLAN.md §5
- ai-ink-brain/AGENTS.md（§ Harness KPI v1.2 · §8 合并前必绿）
- ai-ink-brain/.cursor/rules/05-harness-semi-auto.mdc、06-harness-content.mdc
- ai-ink-brain/docs/harness/README.md

【Open Folder】必须 Open 子仓根 ai-ink-brain/（勿只开 Projects 却改前端路径）。

输入：
- 主 task（相对 Projects/）：
  ai-ink-brain/docs/tasks/active/task_chatbi_v3_lowconf_rag_preview_frontend_v1.md
- 逻辑子仓 / worktree（命令 cwd）：
  ai-ink-brain
- 配对后端 task（只读 · 契约真值）：
  ai-ink-brain-api-python/docs/tasks/active/task_chatbi_v3_lowconf_rag_preview_v1.md
- 需求 SPEC（只读）：
  ai-ink-brain-api-python/docs/spec/v3-agent/SPEC-ChatBI-V3-LowConfidence-Plan-Confirm.md
- 5-2 对照（SQL 预览已做 · 勿误判为未实现）：
  ai-ink-brain/components/unified-chat/UnifiedChatPageClient.tsx
  ai-ink-brain/lib/unified-chat/sse/chainPayloadValidators.ts
  ai-ink-brain/components/chain-chat/ChainEventCard.tsx
- 合并前验证（须全绿 · D5）：
  cd ai-ink-brain && pnpm lint && pnpm test && pnpm build
- 任务审核（22 后填路径；首轮无则先拒开工或先完成 22）：
  ai-ink-brain/docs/harness/reviews/task_chatbi_v3_lowconf_rag_preview_frontend_v1_audit_R1_20260531.md

你必须完成：
0. Invoke 快照：将本 Prompt 全文落盘到
   ai-ink-brain/docs/harness/invokes/by-task/chatbi-v3-lowconf-rag-preview-frontend/
   文件名 invoke_YYYYMMDD_30_chatbi-v3-lowconf-rag-preview-frontend.md
   （同帽同会话不重复落盘）。
0b. human_gate：若 HG-TASK-DRAFT 或 HG-AUDIT-R1 对 30 为 pending → 仅输出 gate_id + 路径，拒开工。
1. 通读前端 task + 后端 task §6（FE-1～FE-5）+ failure_paths F2（validator 禁止强制 sql_draft 导致 RAG 帧丢弃）。
2. 22 阻塞项：契约 RAG payload 键须与后端 _contract_manifest.json 对齐；键名未定 → 先读后端 manifest 草案或向后端 task §8 C1 对齐，禁止臆造未承诺键。
3. test_strategy: required — 先补/改可失败单测（validator、tool 分支渲染逻辑），再改 UI；禁止只改 UI 无测。
4. 实现范围（最小 diff）：
   - lib/unified-chat/sse/chainPayloadValidators.ts：按 tool 分支校验（text2sql vs rag_search）；RAG 不要求 sql_draft 非空。
   - components/chain-chat/types.ts：AgentPlanPreviewPayload discriminated union（按 manifest）。
   - UnifiedChatPageClient.tsx：pendingPlanConfirm 扩展 RAG 字段；确认卡片按 tool 分支文案；续跑 plan_execution_token 保持 5-2 行为。
   - ChainEventCard.tsx：agent.plan.preview RAG 展示块。
   - docs/_tech_graph/_contract_manifest.json：与后端同 PR 或紧耦合 PR 对齐承诺键。
5. 非范围：不改 ai-ink-brain-api-python/api/；不复制 Projects/docs/harness/prompts/ 到本仓。
6. 执行验证命令并摘要写入 task「### 自检结论（执行者）」。
7. 对话末尾输出「下一棒可复制 Prompt」（40 自检或 50 复检）；semi_auto 时可落盘下一 invoke 再续跑。
8. 按 HANDOFF_AUTO_COMMIT.md 在 ai-ink-brain git 根 commit（仅本轮路径；用户说不要 commit 则跳过）。

禁止：静默扩 scope；未读 failure_paths 改契约；口头宣称已测无命令输出。

Judgment（必填）：
- experience_capture: recommended | 建议升级 required（≤1 行）
- gate/risk: 无 | human_gate:HG-* | 契约键未对齐
- hat_self: pass | pass-with-notes | blocked
```

---

## 修订

| 日期 | 摘要 |
|------|------|
| 2026-05-31 | 草案：5-3 前端 30 帽 · P0 Harness 已落盘 |
