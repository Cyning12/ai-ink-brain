# Task：主流程流式体验 — 迁移 Vercel AI SDK（面试演示核心路径）

> **状态**：`active`（**PR1+PR2 Phase 1 已落盘**；待 PR3 Timeline hook 化）  
> **执行帽 invoke（30）**：`content/harness/invokes/invoke_20260520_30_frontend-vercel-ai-sdk-main-stream-execute.md`  
> **登记日期**：2026-05-20  
> **需求帽回填**：2026-05-20  
> **任务审核 R1**：`content/harness/reviews/task_frontend_vercel_ai_sdk_main_stream_v1_audit_R1_20260520.md`（工作区指针：`docs/harness/reviews/pointer_task_frontend_vercel_ai_sdk_main_stream_v1_audit_R1_20260520.md`）  
> **分支建议**：`feat/unified-chat-ai-sdk-stream-v1`（自 `main`；当前文档分支 `docs/vercel-ai-sdk-streaming-backlog-v1` 仅含 Harness 落盘）  
> **需求帽 invoke**：`content/harness/invokes/invoke_20260520_10_frontend-vercel-ai-sdk-main-stream-requirements.md`  
> **审核帽 invoke**：`content/harness/invokes/invoke_20260520_22_frontend-vercel-ai-sdk-main-stream-audit.md`  
> **关联图谱**：`docs/_tech_graph/11_flow_api.md`、`13_flow_components.md`（Unified SSE 段）  
> **配对后端**：`POST /api/py/unified/chat/stream`（契约 **`X-ChatBI-Sse-Contract: 2`**，事件 `chain` / `done`）— **本阶段不要求改 Python 协议**

---

## 1. 背景与目标

**现状真值**：

| 项 | 现状 |
| --- | --- |
| 依赖 | `package.json` 已安装 `ai@^6`、`@ai-sdk/react@^3`、`@ai-sdk/openai`，**业务代码未使用** |
| Unified Chat | `components/unified-chat/UnifiedChatPageClient.tsx` 手写 `fetch` + `ReadableStream` + `\n\n` SSE 分帧（约 **2120 行**） |
| Legacy RAG | `lib/chat/chatApi.ts` · `streamChat()` 手写 `TextDecoder` 解析 |
| BFF | `app/api/py/unified/chat/stream/route.ts` **透传** Python SSE body（正确，**Phase 1 保留**） |

**痛点（面试演示）**：

- 首 token / 增量渲染依赖手写状态机，**易抖、难复用**（中止、重试、乐观 UI、流恢复）。  
- 与业界 **Vercel AI SDK `useChat`** 叙事不一致，演示时难以一句话说清「标准流式栈」。  
- Timeline（`chain`）与正文增量 **耦在同一大组件**，后续 vNext 双栏改动成本高。

**完成态（可演示）**：

1. **主路径** Unified Chat（`/unified-chat` 或现行入口）流式回答由 **AI SDK 6** 管理会话与流状态（`useChat` + **自定义 Transport**）。  
2. **保留** ChatBI 增量契约：请求 **`X-ChatBI-Sse-Contract: 2`**；解析 **`chain` / `done`**；顶层 **`token` 忽略**；`UNIFIED_SSE_CHAIN_TYPE_WHITELIST` 行为不退化。  
3. **面试可演示**：输入 → **肉眼可见的稳定流式出字** + Timeline **同步推进**（允许 Phase 1：正文走 SDK `text-delta`，Timeline 仍经 **现有 parser 适配层**）。  
4. Legacy 博客 RAG（`/api/py/chat` stream）**不在本单**；见 §非范围 Phase 2。

---

## 2. 技术选型（需求帽收敛 · 执行默认）

| 方案 | 摘要 | 本单 |
| --- | --- | --- |
| **A — 自定义 Transport + BFF 透传 SSE** | Transport 内解析 `event: chain` / `done`；助手正文映射为 SDK `text-delta`；Timeline 并行 reducer | **推荐默认 · Phase 1–2 主路径** |
| **B — BFF 转 AI SDK UI Stream** | 新路由转码为 UI Stream Protocol；客户端标准 `useChat({ api })` | **非 Phase 1**；若 R1 审查认为 A 阻塞再单开 spike |
| **C — 仅 Legacy RAG 用 SDK** | Unified 不动 | **不满足**本单目标 |

**分阶段里程碑**：

| 阶段 | 交付 | Timeline / 右栏 |
| --- | --- | --- |
| **Phase 1** | `lib/unified-chat/sse/` 抽取 + vitest；`useChat` + `chatbiSseTransport`；`UnifiedChatPageClient` 仅编排 | **沿用**现网 `chain` → `setEvents` / `buildExecutionTraceSections`（adapter，不删白名单逻辑） |
| **Phase 2（本单 PR3）** | Timeline 状态机迁入 `useUnifiedChatStream` / 专用 hook；组件行数 **≤1200** 或 SSE 逻辑 **100%** 在 `lib/unified-chat/` | 行为与 done 任务回归一致 |
| **Phase 3（另单）** | Legacy `streamChat` → SDK；或方案 B BFF 转码 | 不在本单验收 |

**非目标**：把 Python 改成 OpenAI-compatible `/v1/chat/completions`。

---

## 3. 范围（T0–T5 · 可勾选）

### T0 — 选型记录（阻塞 PR2 前须落盘）

- [x] 在 `docs/diary/` 或本任务 **§实现备忘** 写 **A vs B** 对比表：首 token 延迟、实现行数、Timeline 兼容、Abort/重连、测试成本。  
- [x] **结论句**：默认 **方案 A**；B 仅作备选一行说明。

### T1 — 抽取 SSE 纯函数（行为不变）

- [x] 从 `UnifiedChatPageClient.tsx` 迁出：`parseSseBlocks`、`safeJson`、`chainEventFromSse`（及仅 SSE 相关的 type guard）至 `lib/unified-chat/sse/`；`meta.run_id` 切换见 `applyChainSseFrame.ts`。  
- [x] **vitest**：固定 fixture（`chain` 序列、`done` ok/false、坏 JSON、`event: token` 分帧）见 `lib/unified-chat/sse/*.test.ts`。  
- [x] 页面改 import；**合并前** `pnpm test` 绿（2026-05-20）。

### T2 — AI SDK 接入（核心）

- [x] 新增 `lib/unified-chat/transport/chatbiSseTransport.ts`：`fetch` → `/api/py/unified/chat/stream`，带头 **`X-ChatBI-Sse-Contract: 2`**，解析 SSE → SDK 消息流（`text-delta` + 可选 `data` 供 Timeline）。  
- [x] 新增 `lib/unified-chat/hooks/useUnifiedChat.ts`（或薄封装 `@ai-sdk/react` `useChat`）：`status`（`submitted` / `streaming` / `ready` / `error`）、`stop()`、`messages`。  
- [x] **AbortSignal**：`stop()` / 卸载 / 新发送前 abort；与现网 `streamAbortRef` 语义一致。  
- [x] **发送中禁用**、**重复发送防抖**：连点发送仅 **一轮** in-flight（对齐现网 loading 门闩）。  
- [x] 错误展示：复用 `fetchWithAuthRecovery` + `pickErrorMessage` 路径。

### T3 — Timeline 解耦

- [ ] `ChainTimeline` 仅消费 **`chain` 事件数组**（来自 adapter，非手写 read loop 内联 `setState`）。  
- [ ] 右栏执行链路仍用 **`buildExecutionTraceSections`**（**不**在本单实现 vNext `single_panel`）。

### T4 — 面试演示清单

- [ ] `content/tasks/active/` 或 `docs/diary/` 附 **3 分钟演示脚本**（见 §可观测验收 · 演示）。

### T5 — 质量门

- [ ] `pnpm lint`、`pnpm test`、`pnpm build` 绿。  
- [ ] 新增/更新 vitest：`lib/unified-chat/sse/*.test.ts`、`lib/unified-chat/transport/*.test.ts`（mock `fetch` + `ReadableStream`）。

---

## 4. 非范围

- **不**改 Python `unified_chat.py` 事件 schema（另开后端契约 task）。  
- **不**要求 Python 提供 OpenAI-compatible API。  
- **不**在本单完成 vNext **双栏 / `single_panel` / localStorage** 全部 SPEC（见 `task_chatbi_v2_incremental_sse_timeline_frontend_v1.md`；可并行，**验收分离**）。  
- **不**替换 ChatBI 鉴权（`fetchWithAuthRecovery`、Token 弹窗保留）。  
- **不**改 BFF 透传语义（`route.ts` 禁止 `await upstream.text()` 缓冲全 body）。  
- **不**在本单迁移 `lib/chat/chatApi.ts` `streamChat`（Phase 3 另单）。

---

## 5. 依赖与引用

| 依赖项 | 路径 |
| --- | --- |
| 现网 SSE 实现 | `components/unified-chat/UnifiedChatPageClient.tsx` |
| BFF 透传 | `app/api/py/unified/chat/stream/route.ts` |
| Chain 类型与白名单 | `components/chain-chat/types.ts` · `UNIFIED_SSE_CHAIN_TYPE_WHITELIST` |
| v1 已验收基线 | `content/tasks/done/task_frontend_unified_chat_streaming_sse_v1.md` |
| vNext Timeline UI | `content/tasks/active/task_chatbi_v2_incremental_sse_timeline_frontend_v1.md` |
| vNext SPEC | `ai-ink-brain-api-python/docs/spec/v2-agent/SPEC-ChatBI-V2-Incremental-SSE-Timeline-vNext.md` |
| Events | `ai-ink-brain-api-python/docs/spec/v2-agent/SPEC-ChatBI-V2-Events.md` |
| AI SDK 版本 | `package.json` · `ai@^6`、`@ai-sdk/react@^3` |

---

## 6. PR 拆分建议（执行帽按序合并）

| PR | 对应 | 主要内容 | 合并门槛 |
| --- | --- | --- | --- |
| **PR1** | T0 + T1 | 选型短文 + `lib/unified-chat/sse/` + vitest；`UnifiedChatPageClient` 改 import，**无** SDK | `pnpm test` 绿；行为回归人测可选 |
| **PR2** | T2 Phase 1 | `chatbiSseTransport` + `useUnifiedChat`；主区正文流式走 SDK；Timeline adapter | 演示路径可流式出字；契约头 Network 可证 |
| **PR3** | T3 + 瘦身 | Timeline hook 化；删除重复 read loop；行数目标 | done 任务联调用例全过 |
| **PR4** | T4 + T5 | 演示脚本 + lint/test/build CI 对齐 | 全绿 + 3 分钟脚本走通 |

---

## 7. 目标文件清单（新建 / 修改）

| 操作 | 路径 | 说明 |
| --- | --- | --- |
| 新建 | `lib/unified-chat/sse/parseSseBlocks.ts` | `\n\n` 分帧 |
| 新建 | `lib/unified-chat/sse/chainEventFromSse.ts` | `chain` JSON → `ChainEvent` |
| 新建 | `lib/unified-chat/sse/safeJson.ts` | 坏帧返回 null |
| 新建 | `lib/unified-chat/sse/fixtures/*.json` | vitest 固定序列 |
| 新建 | `lib/unified-chat/sse/*.test.ts` | parser 单测 |
| 新建 | `lib/unified-chat/transport/chatbiSseTransport.ts` | AI SDK Transport |
| 新建 | `lib/unified-chat/transport/chatbiSseTransport.test.ts` | mock stream |
| 新建 | `lib/unified-chat/hooks/useUnifiedChat.ts` | `useChat` 封装 |
| 修改 | `components/unified-chat/UnifiedChatPageClient.tsx` | 编排层；删内联 SSE 循环 |
| 保持 | `app/api/py/unified/chat/stream/route.ts` | 仅当 Transport 需额外头时再动 |
| 不改 | `lib/chat/chatApi.ts` | Phase 3 |

---

## 8. 验收标准（母单 · 可勾选）

- [ ] **演示路径**：面试官 **3 分钟内** 完成 Unified Chat 一问，**稳定增量出字**（非整段卡顿后一次性显示）。  
- [ ] **契约不退化**：请求带 **`X-ChatBI-Sse-Contract: 2`**；BFF 透传；`chain` 白名单与现网一致。  
- [ ] **Timeline**：`tool.call.*` / `rag.sources` / `sql.result`（环境允许时）仍 **陆续出现**；`done` 后输入解锁。  
- [ ] **中止**：Abort 后流停止、输入解锁、无 ghost 更新。  
- [ ] **结构**：SSE/transport 逻辑位于 `lib/unified-chat/` 且 **有 vitest**；`UnifiedChatPageClient.tsx` 行数相对现网 **显著下降**（建议 **≤1200** 或 PR 说明不可再拆理由）。  
- [ ] **文档**：§实现备忘 回填选型、演示 URL、关键 PR 链。

---

## 9. 可观测验收表

| ID | 类型 | 命令 / 场景 | 通过判据 |
| --- | --- | --- | --- |
| **V-LINT** | CI | `pnpm lint` | exit 0 |
| **V-TEST** | CI | `pnpm test` | exit 0；含 `lib/unified-chat/**` 新增用例 |
| **V-BUILD** | CI | `pnpm build` | exit 0 |
| **V-PARSER** | 单测 | `vitest run lib/unified-chat/sse` | 坏 JSON 跳过；`token` 事件不抛；`done` 解析 ok/false |
| **V-TRANSPORT** | 单测 | `vitest run lib/unified-chat/transport` | mock SSE：至少 2 次 `text-delta`；`stop()` 后无后续 delta |
| **V-NET** | 人测 | DevTools → `/api/py/unified/chat/stream` | 请求头含 **`X-ChatBI-Sse-Contract: 2`**；`Content-Type` 为 event-stream；响应为流 |
| **V-RAG** | 人测 | `prefer=rag` 知识问 | Timeline 出现 `rag.sources`；正文流式 |
| **V-SQL** | 人测 | `prefer=text2sql`（环境可用） | 出现 `sql.result` |
| **V-DONE-FAIL** | 人测 | 触发 `done.ok=false` | 可读错误条；输入解锁 |
| **V-ABORT** | 人测 | 流式中点「停止」 | 无继续出字；可再次发送 |

### 3 分钟演示脚本（T4）

1. **0:00–0:30** 打开 `/unified-chat`，确认已登录 / Token（与现网一致）。  
2. **0:30–1:30** **RAG**：`prefer=rag`，问一知识类问题 → 指给面试官：**右侧/时间线** 陆续出现 chain，**主区逐字/逐段** 增长。  
3. **1:30–2:30** **Text2SQL**（若环境可用）：表统计类问题 → 指 `sql.result` + 流式正文。  
4. **2:30–3:00** 流式中 **中止** → 再发一问 → 证明 **无 ghost**、输入可用。

---

## 10. Harness

| 字段 | 值 |
| --- | --- |
| `test_strategy` | **`required`** |
| `test_strategy_note` | 流状态机 + SSE 契约为面试核心路径；须 **先** vitest（parser + transport mock）再改 `UnifiedChatPageClient`；合并前 **`pnpm test`** 绿。纯文案/演示脚本修订可用 `recommended` 子 PR。 |
| `failure_paths` | 见 §11 |
| `gates_before_code` | `failure_paths`、§9 验收表、§5 依赖路径已读 |
| `audit_profile` | `full`（建议 R1 → 执行 → R2 签收） |

---

## 11. failure_paths

| ID | 触发条件 | 系统行为 | 可重试 | 用户可见 |
| --- | --- | --- | --- | --- |
| **FP-503** | BFF 连不上 Python（`route.ts` catch） | HTTP **503** JSON `{ ok:false, error, detail }`；Transport 进 **`error`** | 是（改环境/重发） | Toast/inline：**无法连接…**（`pickErrorMessage`） |
| **FP-401** | 无有效 `Authorization` / ChatBI token | HTTP **401**；不进入 SSE 读流 | 是（登录/填 Token） | 鉴权提示 + `fetchWithAuthRecovery` 恢复流 |
| **FP-4xx** | 其他非 2xx（400/422 等） | 读 `res.text()` → `Error(pickErrorMessage(...))`；`status=error` | 视错误 | 后端 message 摘要 |
| **FP-NOBODY** | 2xx 但无 `res.body` | 抛 **SSE 响应无 body**；解锁输入 | 是 | 明确错误文案 |
| **FP-BAD-SSE** | `chain` 行 JSON 坏 / 非白名单 type | **`parse_error_count++`**（或 ref）；**跳过该帧**；不白屏 | N/A（流继续） | 默认 **不** 展示计数（`console.debug`） |
| **FP-TOKEN-IGNORE** | 顶层 `event: token` | **忽略**（与 v1 done 一致） | N/A | 无 |
| **FP-ABORT** | 用户点停止 / 新发送 abort 上一轮 / 卸载 | `AbortController.abort()`；`AbortError` **静默**；`streamAbortRef` 清空 | 是（新一问） | 输入解锁；无后续 delta |
| **FP-DUP-SEND** | 流式中再次点击发送 | **拒绝**第二轮 in-flight（loading 门闩） | 等当前结束或 Abort | 按钮 disabled / 无重复 run |
| **FP-DONE-FAIL** | `event: done` 且 `ok=false` | 结束 streaming；展示 **done 错误条**（现网已有） | 是（新一问） | 可读错误（与 persist 失败区分） |
| **FP-DONE-OK** | `event: done` 且 `ok=true` | 解锁输入；持久化逻辑与现网一致 | N/A | 正常 |
| **FP-SESSION** | 刷新页 / 切换 `session_id` | 从服务端或 local 恢复历史；**新流** 须新 `run_id` | 是 | 历史消息展示；不发 ghost chain 到旧 run |
| **FP-CHAIN-ERROR** | 流中 `chain.type=error` | Timeline 展示；仍期待 **`done`**（后端 §8.3） | 视 `done.ok` | 时间线错误卡 + 终态条 |

---

## 12. 矛盾扫描（须执行帽知晓 · 不和稀泥）

| # | 矛盾 | 出处 A | 出处 B | 处理约定（本单） |
| --- | --- | --- | --- | --- |
| **C1** | v1 done 要求「以仓库代码为真值」 vs 本单大改 `UnifiedChatPageClient` | `task_frontend_unified_chat_streaming_sse_v1.md` §代码真值 | 本 task §T2 | **回归表 §9** 覆盖 done 验收；parser 迁出前后 vitest **等价** |
| **C2** | vNext SPEC 要 **`single_panel` + LS** | vNext SPEC §6 | 现网 **固定双栏**；vNext 任务差异表 | **本单不验收** single_panel；**禁止**破坏现网双栏 |
| **C3** | 本单「SDK 标准栈」vs **禁止**改 Python OpenAI API | 用户约束 / 本 task §2 | 方案 B 叙事 | Phase 1 **仅 A**；B 不阻塞面试演示 |
| **C4** | `package.json` 已装 `@ai-sdk/openai` 但 **无** OpenAI 上游 | `package.json` | BFF 仍打 Python SSE | **不要求**使用 `@ai-sdk/openai` 连真 OpenAI；可保留依赖待 Phase 3 |
| **C5** | 行数「显著下降」vs Timeline 逻辑仍复杂 | 本 task §8 | vNext 右栏 `agent.llm.*` | Phase 2 以 **抽模块** 满足；右栏逻辑可暂留 adapter |

---

## 13. 给执行帽必读（开工前）

1. 先读 **done** `content/tasks/done/task_frontend_unified_chat_streaming_sse_v1.md` 与现网 `UnifiedChatPageClient.tsx` **993–1200 行** 附近 SSE 循环（迁出基准）。  
2. **禁止** BFF 缓冲全 body；**禁止** 去掉 **`X-ChatBI-Sse-Contract: 2`**。  
3. **T1 先于 T2**：无 parser 单测不接入 `useChat`。  
4. Timeline **Phase 1** 允许 adapter 双写（SDK 正文 + 原 `setEvents`），须在 PR2 描述中写明，PR3 收敛。  
5. 与 `task_chatbi_v2_incremental_sse_timeline_frontend_v1.md` **勿混 PR**；冲突时 **本单契约优先**。  
6. 合并前：`pnpm lint` → `pnpm test` → `pnpm build`（根 `AGENTS.md` §8）。

---

## 14. 与后端需求池的协同

| 后端 backlog | 关系 |
| --- | --- |
| `task_rag_graphrag_pilot_explore_v1` | **独立**；不依赖 |

---

## 15. 实现备忘（执行帽回填）

- **需求帽（2026-05-20）**：默认 **方案 A**；PR1–PR4；`lib/unified-chat/` 目录树见 §7。  
- 选型记录（T0，落盘于本小节）：默认 **方案 A**；B 仅 spike 备选。对比：A 低延迟/BFF 无转码、Timeline 沿用 chain parser；B 需 UI Stream 转码与双协议维护。  
- 主要 PR：**PR1** @ `4e0789e`（`lib/unified-chat/sse/`）；**PR2 Phase 1** @ `feat/unified-chat-ai-sdk-stream-v1`（`chatbiSseTransport` + `useUnifiedChat` + `UnifiedChatPageClient` adapter 双写）  
- **Phase 1 说明**：正文经 SDK `text-delta`（`agent.llm.delta` / `assistant.message`）；Timeline 仍 `setEvents` + `buildExecutionTraceSections`（PR3 收敛）  
- 演示录屏 / 脚本路径：**待 PR4**

### 自检结论（执行者）

| 项 | 值 |
| --- | --- |
| 工作目录 | `ai-ink-brain` |
| 分支 | `feat/unified-chat-ai-sdk-stream-v1` |
| HEAD（R3 自检时） | **`906a062`**（与分支 tip 一致） |
| 实现修复 commit | `23a053b`（`normalizeRequestHeaders` · V-BUILD） |
| 变更范围 | `git diff 393f877..HEAD`（transport TS + task/invoke 文档） |
| 本轮范围 | **PR2（T2 Phase 1）· R3 执行者自检** |
| 自检帽 invoke | `content/harness/invokes/invoke_20260520_40_frontend-vercel-ai-sdk-main-stream-self-check-r3.md` |

#### 命令与退出码（40 · R3 · 2026-05-18）

| 命令 | cwd | 退出码 | 要点 |
| --- | --- | ---: | --- |
| `pnpm lint` | `ai-ink-brain` | **0** | eslint 无 error；Node v25.9.0（engines 24.x 告警，非阻塞） |
| `pnpm test` | `ai-ink-brain` | **0** | 6 files / **20** tests passed |
| `pnpm exec vitest run lib/unified-chat/sse lib/unified-chat/transport` | `ai-ink-brain` | **0** | 3 files / **12** tests；`ChatbiSseTransport` 断言契约头 + ≥2 `text-delta`；abort 后无后续 delta |
| `pnpm build` | `ai-ink-brain` | **0** | Next 16.2.3 webpack build；TS 通过（**R3 在 HEAD `906a062` 复跑，非 flaky**） |

#### 验收项（§9 · PR2 子集）

| ID | 结果 | 证据 |
| --- | --- | --- |
| V-LINT | **pass** | `pnpm lint` exit 0 |
| V-TEST | **pass** | `pnpm test` exit 0 |
| V-BUILD | **pass** | `pnpm build` exit 0（R2 修复后 R3 二次全绿） |
| V-PARSER | **pass** | vitest `lib/unified-chat/sse`（含坏 JSON / token 忽略 / done） |
| V-TRANSPORT | **pass** | vitest `lib/unified-chat/transport`；`chatbiSseTransport.test.ts` 捕获 `X-ChatBI-Sse-Contract: 2` |
| V-NET | **pass** | 人测 DevTools：`X-ChatBI-Sse-Contract: 2`；SSE `chain`/`done` |
| V-RAG | **pass** | 人测 `prefer=rag`：UI 流式 + `rag.sources` / `agent.llm.delta` |
| V-SQL | **pass** | 人测 `prefer=text2sql`：`sql.result`（`agent_info` count=13） |
| V-DONE-FAIL | **pass** | 人测：可读错误条；结束后输入/发送可恢复 |
| V-ABORT | **pass** | 人测 **方式 B（新会话）**；无 ghost；结束后可再发 |
| 母单 §8 / T3 行数 | **未测** | `UnifiedChatPageClient.tsx` **1908** 行（PR3 目标） |

#### R3 结论（PR2 · 可否进 PR 描述 / 50 帽）

- **PR 描述可写**：PR2 Phase 1 交付（`chatbiSseTransport` + `useUnifiedChat` + adapter 双写）；**CI 子集全绿**（V-LINT / V-TEST / V-BUILD / V-PARSER / V-TRANSPORT）。  
- **50 独立复检**：`content/harness/reviews/task_frontend_vercel_ai_sdk_main_stream_v1_reinspect_R1_20260520.md`（`393f877..906a062`）。

#### 人测签收（维护者 · 2026-05-18）

| ID | 结果 | 备注 |
| --- | --- | --- |
| V-NET / V-RAG / V-SQL / V-DONE-FAIL / V-ABORT | **pass** | `localhost:3000/unified-chat?debug=1`；流式中 **发送 disabled**（防连点，保留） |
| **PR2 合并 `main`** | **准许** | 与 50 帽复检 + 本表一致；**母单**仍 open（PR3 Timeline hook、PR4 演示/CI 对齐） |

#### 已知未测 / 阻塞

- **无 PR2 CI / 人测阻塞**。  
- Timeline adapter 双写 → **PR3**；T3/T4/T5 仍 open。  
- **后续提案**（非 PR2）：报错后确保 `loading` 解除；可选流式「停止」按钮（`unifiedChat.stop()` 已接）。

---

## 给 Cursor

`Vercel AI SDK`、`useChat`、`ChatTransport`、`chatbiSseTransport`、`Unified Chat`、`X-ChatBI-Sse-Contract`、`chain`、`done`、`test_strategy required`、`failure_paths`、`vitest`、`面试演示`、`PR1`
