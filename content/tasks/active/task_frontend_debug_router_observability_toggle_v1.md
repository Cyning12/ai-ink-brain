# 前端 Task：Debug Router Observability 开关与日志刷新（v1）

> **状态**：pending  
> **关联图谱**：无（本任务不改流程图谱）  
> **关联 Issue/PR**：无  
> **后端依赖**：后端 `unified_chat` 已支持请求级开关 `debug_router: true`；并默认异步落库 `router_debug`（见 `DEBUG_ROUTER_EVIDENCE_DB`）

---

## 背景与目标

目前后端已经支持 `router.evidence`/`router.evidence.details` 事件以及落库 `rag_conversation_logs.metadata.router_debug.router_evidence_details`。但前端缺少一个便捷入口来「按会话/按请求开启 Debug 并触发日志刷新/关闭」，导致排障效率低。

目标是提供一个**显式 Debug 开关**，让开发/排障时能快速开启 `router.evidence.details` 的 Timeline 展示，并在关闭时停止展示且避免误读旧日志。

---

## 范围

- [ ] **新增 Debug 开关 UI**：在 Chat 页面（或 Timeline 面板）提供一个「Router Debug」开关（默认关闭）。
- [ ] **请求级透传**：当开关开启时，发起 `POST /api/py/unified/chat` 与 `POST /api/py/unified/chat/stream` 时在 body 里附加 `debug_router: true`。
- [ ] **开启时的刷新策略**：
  - [ ] 若当前是 SSE 流：关闭当前连接并重新建立（保证后端按新开关吐 `router.evidence.details`）。
  - [ ] 若当前是非流式：重新触发一次请求或在下一次用户提问时生效（两者择一并写明）。
- [ ] **关闭时的清理策略**：
  - [ ] Timeline 中隐藏/折叠 Debug 节点（`router.evidence.details`）或标记为 “Debug 已关闭”。
  - [ ] 若存在「日志详情侧栏/面板」，关闭时清空当前会话的 debug 展示缓存（避免旧数据误导）。
- [ ] **与现有 Timeline 节点兼容**：`router.evidence` 仍按既定样式展示；`router.evidence.details` 仅在 Debug 开启时展示。

---

## 非范围

- 不改后端契约（event type / payload 字段）。
- 不引入新的数据库表或新的后端查询接口（仅使用已有会话历史拉取能力）。
- 不做权限系统改造（默认开发者环境/管理员可用，按现有鉴权）。

---

## 依赖与引用

| 依赖项 | 路径/说明 |
|--------|-----------|
| PROJECT_CONFIG | `ai-ink-brain/docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` |
| 现有 Timeline 实现 | （按实际代码定位：Timeline 解析 `chain` SSE events 的模块） |
| 后端事件契约 | `ai-ink-brain-api-python/docs/_tech_graph/_contract_manifest.json` |
| 后端落库字段 | `rag_conversation_logs.metadata.router_debug.router_evidence_details` |

---

## 验收标准

- [ ] 默认关闭 Debug 时：Timeline 不展示 `router.evidence.details` 节点；后端仍会默认落库（不影响前端）。
- [ ] 打开 Debug 后：下一次请求（或重连后）Timeline 能看到 `router.evidence.details`，且字段完整展示（阈值/候选列表）。
- [ ] 关闭 Debug 后：当前会话 UI 不再展示 Debug 节点，且不会继续复用旧 Debug 数据。
- [ ] 不影响原有聊天/Timeline 的性能与稳定性（无明显卡顿、无频繁重连抖动）。

---

## 实现备忘（由子 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | `<待补>` |
| 关键状态 | `debug_router: boolean`（建议放在页面级 state/store） |
| 请求改动点 | `POST /api/py/unified/chat(_/stream)` body 增加 `debug_router` |
| UI 入口 | `<待补：Settings/Timeline header/Debug panel>` |

