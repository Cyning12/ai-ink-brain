# 前端 Task：Unified Chat SSE `request_id` 对齐与可选消费（v1）
 
> **状态**：draft  
> **关联图谱**：`docs/_tech_graph/11_flow_api.ai.md`、`docs/_tech_graph/00_main.ai.md`  
> **关联 Issue/PR**：无  
> **后端依赖**：`ai-ink-brain-api-python/docs/tasks/task_tech_graph_p6_cross_repo_contract_guardrail_v1.md`（已新增 `done.data.request_id`）
 
---
 
## 背景与目标
 
后端 Unified Chat 的 SSE `done.data` 已新增并承诺稳定输出 `request_id`（当前与 `run_id` 等价），用于端到端链路追踪/调试对齐。  
本任务目标是在前端 **不破坏现有逻辑** 的前提下，明确 `request_id` 的语义并提供最小可验证的接入点（日志 / 状态 / UI 展示为可选）。
 
---
 
## 范围
 
- [ ] 在前端明确 `request_id` 的语义：**backend_required（后端最小输出）**，前端可选消费，但不得越界读取未承诺字段。
- [ ] 在 SSE 消费链路中解析 `done.data.request_id`，并落到一次请求的会话状态中（例如 `lastDone.request_id` / `activeRequestId`）。
- [ ] 将 `request_id` 透传到调试日志（console 或内部 debug 面板），便于和后端日志/trace 对齐。
- [ ]（可选）在 UI 的 debug 区域显示 `request_id`（默认隐藏或仅 debug 模式展示）。
- [ ] 同步更新前端 `_tech_graph`（仅文档层：标明 `done.data` 的稳定字段包含 `request_id`，并注明其与 `run_id` 的当前关系）。
 
## 非范围
 
- 不要求把所有现有逻辑从 `run_id` 迁移到 `request_id`（v1 只做“兼容+可见”）。
- 不新增复杂埋点系统/Observability 平台接入（例如 Sentry trace 等），除非另有任务单。
- 不修改后端字段含义（后端当前 `request_id == run_id` 视为既定事实）。
 
---
 
## 依赖与引用
 
| 依赖项 | 路径/说明 |
|--------|-----------|
| PROJECT_CONFIG | `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` |
| Python API | `POST /api/py/unified/chat/stream`（SSE） |
| SSE 契约真值 | `../ai-ink-brain-api-python/docs/_tech_graph/_contract_manifest.json` |
| 跨仓门禁脚本 | `../ai-ink-brain-api-python/tools/tech_graph_contract_check.py` |
| 前端 SSE 路由（候选） | `app/api/py/unified/chat/stream/route.ts`（以仓内实际为准） |
| 前端消费点（候选） | `components/unified-chat/UnifiedChatPageClient.tsx`（以仓内实际为准） |
| 前端图谱 | `docs/_tech_graph/11_flow_api.ai.md`、`docs/_tech_graph/00_main.ai.md` |
 
---
 
## 验收标准
 
- [ ] 前端能够从 SSE `done` 事件的 `data` 中读到 `request_id`，并在本地状态中可见（例如 DevTools/console 日志可确认）。
- [ ] 前端未读取任何契约外字段；在跨仓门禁脚本扫描前端代码时不产生越界报错（`frontend_expect ⊆ contract`）。
- [ ] 前端 `_tech_graph` 更新：`done.data` 的稳定字段清单包含 `request_id`，并注明当前与 `run_id` 等价（避免误解）。
- [ ] 手测用例通过（见下）。
 
---
 
## 手动测试用例（必须执行）
 
### 用例 1：SSE done 事件包含 request_id
- 操作：本地启动前端并触发一次 Unified Chat 流式请求
- 期望：在 SSE `done` 到达时，前端日志/状态中出现 `request_id`（非空字符串）
 
### 用例 2：兼容性（不依赖 request_id 也能工作）
- 操作：保持 UI 主流程不使用 `request_id` 做关键判断（仅记录/展示）
- 期望：聊天收尾、按钮状态、会话切换等行为与改动前一致
 
### 用例 3：越界读取防回归（可选强测）
- 操作：临时在 SSE 消费点加一行读取不存在字段（例如 `data.nonexistent_key`），运行后端仓脚本（见后端 CI 任务）
- 期望：脚本失败并指出 forbidden key；撤销后恢复 OK
 
---
 
## 实现备忘（由子 Agent 回填）
 
| 项 | 内容 |
|----|------|
| 涉及文件 | `<待回填>` |
| 新增/更新类型 | `<例如：SSE DoneEventData 增加 request_id>` |
| 状态落点 | `<例如：store/chatState.ts 的 doneMeta>` |
| 图谱变更点 | `docs/_tech_graph/11_flow_api.ai.md`（done.data keys） |
| 注意事项 | `request_id` 在 v1 与 `run_id` 等价，避免双写引入歧义 |
