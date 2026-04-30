# 前端：Unified Chat 展示 router.evidence（v1）— 降级前证据节点与调试面板

状态：pending  
后端依赖：`ai-ink-brain-api-python/docs/tasks/done/task_unified_chat_router_evidence_event_v1.md`（后端已验收通过）  
关联：`content/tasks/task_frontend_intent_router_debug_v1.md`（router.decision 既有展示）

---

## 背景与目标

后端已新增 `router.evidence` 事件，用于把“候选模式 → 证据（DDL/FTS）→ 最终模式 → 降级原因”从 `router.decision.evidence` 中解耦出来，变成 Timeline 上更直观的节点。

前端目标：
- 在 Unified Chat 的 Timeline 中把 `router.evidence` 作为一个可展开节点展示
- 在调试区（或右栏）提供结构化视图，帮助快速定位误降级/误路由

---

## 范围

- [ ] 事件解析：在前端 SSE events 流中识别 `type=router.evidence`
- [ ] Timeline 展示：新增一个“路由证据（router.evidence）”节点
  - [ ] 展示字段：`candidate_mode` / `final_mode` / `fallback`
  - [ ] 展示 DDL 证据：`ddl.hits` / `ddl.top_score` / `ddl.topk` / `ddl.min_score`
  - [ ] 展示 FTS 证据：`fts.hits` / `fts.top1_score` / `fts.topk`
- [ ] 调试面板（可复用 router.decision 的现有区域）
  - [ ] 若已有 JSON 折叠区：直接追加 router.evidence 的 JSON 预览即可
  - [ ] 若已有结构化卡片：新增一个 Evidence 卡片，按 DDL/FTS 分组展示

---

## 非范围

- 不改变后端契约或事件顺序（后端已验收通过）
- 不做复杂可视化（图表/统计），v1 只做可读展示

---

## 依赖与引用

| 依赖项 | 路径/说明 |
|--------|-----------|
| 后端任务（已 done） | `ai-ink-brain-api-python/docs/tasks/done/task_unified_chat_router_evidence_event_v1.md` |
| SSE 契约真值 | `ai-ink-brain-api-python/docs/_tech_graph/_contract_manifest.json`（type=router.evidence） |
| 前端消费入口 | `components/unified-chat/UnifiedChatPageClient.tsx`（事件解析/渲染） |

---

## 验收标准

- [ ] 发起一次 Unified Chat（prefer=auto），Timeline 中出现 `router.evidence` 节点
- [ ] 展开后能看到 `candidate_mode/final_mode/fallback` 与 DDL/FTS 的 hits/score/阈值
- [ ] 前端遇到未知 type 仍能安全忽略（不报错）
- [ ] 不影响现有 `router.decision`、`sql.result`、`rag.sources` 等节点渲染

---

## 实现备忘（由子 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | `components/unified-chat/UnifiedChatPageClient.tsx`、（如有）Timeline 子组件文件 |
| 事件类型 | `router.evidence` |
| 展示策略 | Timeline 新节点 + 右栏调试区结构化卡片/JSON 预览 |

