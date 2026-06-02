# Task：Portfolio Unified Chat 展示裁剪（W4 · debug / 五问 chip）

> **状态**：`in_progress`（30 帽实现中）  
> **关联图谱**：`docs/_tech_graph/13_flow_components.md` · `12_flow_auth.md`（按需增量 `.ai.md`）  
> **关联 Issue/PR**：（待开 · 基线分支 `task/portfolio-visitor-auth-v1` @ W3 `3d74537` · **暂不 PR**）  
> **后端依赖**：无（只读 ChatBI `access/verify` 的 `access_level`；五问 E2E 归 **W6**）

---

## Harness 元信息（2026-05-31 起 · 新建 task 必填）


| 字段                     | 值                                                 |
| ---------------------- | ------------------------------------------------- |
| **task_slug**          | `portfolio-unified-chat-ui-v1`                    |
| **test_strategy**      | `recommended`                                     |
| **test_strategy_note** | portfolio 模式 UI 分支 + chip 文案常量；可选组件单测；五问答通归 W6    |
| **freeze_id**          | `PORTFOLIO-RAG-DEMO@2026-06-01`                   |
| **semi_auto**          | `true`                                            |
| **audit_profile**      | `full`                                            |
| **experience_capture** | `recommended`                                     |
| **kpi_rubric**         | `KPI_RUBRIC_v1_2`                                 |
| **kpi_aggregator**     | `CLOSE`                                           |
| **git_branch**         | `task/portfolio-visitor-auth-v1`（**续当前分支 · 不新开**） |
| **harness_mode**       | `**looptask`**                                    |
| **stop_after_hat**     | `**CLOSE`**                                       |


- **LoopTask 启动 Prompt**：`content/tasks/specs/PROMPT_looptask_startup_portfolio_w4_v1_zh.md`  
- **关账前**：正文须有 `**### KPI（00）`**

### Harness LoopTask 帽链

```text
00 → 10 → 22(R1) ⇄ 10 → 30 → 40 → 22(R2) → Task·50 → CLOSE
```

### 人工闸 `human_gate`


| human_gate_id | status    | blocks_hats | 说明           |
| ------------- | --------- | ----------- | ------------ |
| HG-TASK-DRAFT | approved  | 22-R1, 30   | 10 定稿后人批     |
| HG-AUDIT-R1   | approved  | 30          | 22 R1 书面通过后  |
| HG-REINSPECT  | `pending` | done        | 50 后 CLOSE 前 |


---

## 背景与目标

Epic Portfolio（`[SPEC-portfolio_demo_site_v1_zh.md](../specs/SPEC-portfolio_demo_site_v1_zh.md)` **§4.4** · **§6.4** · **§6.6** · **§7 W4**）在 W2 四屏 + W3 鉴权（**运维主路径：ChatBI 明文 token + Python verify**）已落在分支 `task/portfolio-visitor-auth-v1` 后，本 task 交付 **Unified Chat 在 portfolio 模式下的展示层裁剪** 与 **五问 chip 文案**。

**完成态一句话**：`NEXT_PUBLIC_SITE_MODE=portfolio` 时，Unified Chat **隐藏 Router Debug**；按 ChatBI `**access_level`** 区分 **visitor 档**（无 Timeline/ExecutionTrace、忽略 `?debug=1`）与 **visitor-admin 档**（Timeline 可见、`?debug=1` 可开 LLM Prompt）；推荐 chip 替换为 **Q1～Q5 逐字**（`[投递冲刺_20260609_v1_zh.md](../specs/投递冲刺_20260609_v1_zh.md)` §2）；development 模式 **行为回归不变**。

**W3 已拍板（本 task 不得推翻）**

- portfolio / development **均**用 ChatBI 明文 token unlock（邮件发时效 token）
- **不**恢复 `PORTFOLIO_VISITOR_*` env 为主路径
- unlock 主流程 **不改**：仍 `requestChatbiAccessVerify` → `writeChatbiToken`；本 task **仅追加** `access_level` 读写与 UI 分支

---

## 10 帽定稿（2026-06-02）

### access_level 持久化（冻结 · 30 帽按此实现）


| 项          | 决策                                                                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **存储键**    | `sessionStorage` · `chatbi_access_level`（与 `localStorage` token **分离**；token 仍用 `LS_CHATBI_KEY`）                                                                               |
| **写入时机**   | unlock 成功：`requestChatbiAccessVerify` 返回 `access_level` 后立即 `writeChatbiAccessLevel(level)` + React state                                                                      |
| **读取时机**   | mount：`readChatbiToken()` 非空 → `readChatbiAccessLevel()`；若 level 缺失 → **静默 re-verify** 同一 token 补 level                                                                        |
| **清除时机**   | `clearChatbiToken` / `clearAllBrowserAuthTokens` / 用户登出路径 **同步** `sessionStorage.removeItem`                                                                                   |
| **档位映射**   | `access_level === 2` → **visitor** 档；`0 \| 1` → **visitor-admin** 档；其他或 re-verify 失败 → portfolio 下 **保守 visitor**（隐藏 Timeline · 忽略 debug URL） |
| **辅助模块**   | `lib/unified-chat/portfolio-chat-tier.ts`（`resolvePortfolioChatTier(level)` · `portfolioDebugUrlAllowed` · `portfolioTimelineVisible` · `portfolioRouterDebugVisible` 恒 false） |
| **API 扩展** | 在 `lib/chatbi-client.ts` 增加 `read/write/clearChatbiAccessLevel`；**不**改 BFF / Python                                                                                            |


### development chip（冻结）

- **保持** 现有 3 条通用 chip（Text2SQL / 日志 / RRF）；**不**替换为五问。

### `/evidence` Q3/Q5 锚点（冻结 · 非阻塞）

- W2 已有 `/evidence` 页壳；本 task **不做** 页内 Q3/Q5 锚点增强（可选留给 W6 或后续 patch）。

### locked 态 chip（冻结）

- portfolio + locked：unlock 区 **下方** 展示 5 条五问 chip；`onClick` → `setDraft(text)`；**无** send 按钮（或 send 禁用），与 W3 页壳一致。

---

## 范围

- `**components/unified-chat/UnifiedChatPageClient.tsx`**（及必要子组件）：portfolio 下按档位裁剪 debug/Timeline/Router Debug；locked 态五问 chip。
- **档位映射**：unlock / re-verify 后读取 `**access_level`** — `0|1` → visitor-admin；`2` → visitor（与 SPEC §4.4 / §6.6 表对齐）。
- **五问 chip**：portfolio 模式（locked + unlocked）展示 **5 条**，文案与 SPEC §6.4 / 投递计划 §2 **提问列逐字一致**。
- `**lib/unified-chat/portfolio-demo-chips.ts`**：五问常量 + `PORTFOLIO_DEMO_CHIPS` 导出（避免魔法字符串）。
- `**lib/unified-chat/portfolio-chat-tier.ts`**：档位解析与 UI 布尔 helper。
- `**lib/chatbi-client.ts**`：`access_level` sessionStorage 读写 + clear 联动。
- 增量 `**docs/_tech_graph/13_flow_components*.md**`（Unified portfolio 分支）；按需 `_manifest`。
- `**pnpm lint**` · `**pnpm test**` · `**pnpm build**` · `**NEXT_PUBLIC_SITE_MODE=portfolio pnpm build**` 绿。

## 非范围

- **W6**：五问 5/5 端到端、ingest 质量、录屏、Python SSE 契约变更。
- **W5 补丁**：sync 卷一～五全量（另 task）。
- **改** unlock/session API 主路径（W3 已交付 ChatBI verify）。
- **删除** development 下现有 Router Debug / Timeline（仅 portfolio 裁剪）。
- `**/evidence` Q3/Q5 锚点**（10 帽明确 **不做**）。

---

## 依赖与引用


| 依赖项            | 路径/说明                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------------- |
| **冻结 SPEC**    | §4.4 · §4.6.5 · §6.4 · §6.6 · §7 W4                                                                 |
| **五问真值**       | `[投递冲刺_20260609_v1_zh.md](../specs/投递冲刺_20260609_v1_zh.md)` §2                                      |
| **W3（同分支）**    | `[content/tasks/done/task_portfolio_visitor_auth_v1.md](../done/task_portfolio_visitor_auth_v1.md)` |
| **Unified 入口** | `components/unified-chat/UnifiedChatPageClient.tsx`                                                 |
| **基线 commit**  | `3d74537`（W3）· 当前分支 HEAD 含 W4 task 草案                                                               |


---

## 验收标准

### §4.4 / §6.6 裁剪

- portfolio + **visitor 档**（`access_level===2`）：**无** Router Debug 开关与面板；**无** Timeline + ExecutionTrace；URL `?debug=1` **不生效**（强制关 LLM Prompt 区 · `debugEnabled` 恒 false）。
- portfolio + **visitor-admin 档**（`access_level` 0 或 1）：Timeline + ExecutionTrace **可见**；`?debug=1` **可开** LLM Prompt / SSE done；**仍无** Router Debug。
- portfolio + 两档：**保留** Text2SQL / `prefer` auto·rag·text2sql。
- **development** 模式：现有 debug/Timeline/chip **回归**（仍为 3 条通用 chip）。

### §6.4 五问 chip

- portfolio 展示 **5 条** chip，与下表 **逐字一致**：


| ID  | chip 展示文案（逐字）                         |
| --- | ------------------------------------- |
| Q1  | 《AI 编程可闭环协作》**卷三**讲什么？Harness 和签收是什么？ |
| Q2  | **RAG 混合检索**怎么做的？                     |
| Q3  | **冷/温/热** 和 **架构三层** 区别？              |
| Q4  | **11 年经历**里 AI Coding 相关成果？           |
| Q5  | 按需读图相对整图灌入 **token/效果**？**边界**？       |


- 无 token 时：页壳 200 + 邮件文案 + unlock（W3 已有）；chip 点击可填入输入框（locked 区 draft 或 unlock 后 textarea），**发送**仍 blocked。

### 工程

- `pnpm lint` · `pnpm test` · `pnpm build` 通过。
- `NEXT_PUBLIC_SITE_MODE=portfolio pnpm build` 通过。

---

## 失败路径


| #   | 触发                                     | 期望行为                                                              |
| --- | -------------------------------------- | ----------------------------------------------------------------- |
| F1  | portfolio 误展示 Router Debug             | **缺陷**                                                            |
| F2  | visitor 档仍可见 Timeline / ExecutionTrace | **缺陷**                                                            |
| F3  | chip 文案与 §6.4 差一字                      | **缺陷**（人审）                                                        |
| F4  | development 回归：Router Debug 被误隐藏       | **缺陷**                                                            |
| F5  | token 在 LS 但 re-verify 失败 / level 非法   | portfolio **保守 visitor** 档 UI；不 crash；可选 inline 提示「档位未知，已按访客视图展示」 |
| F6  | visitor 档 URL 带 `?debug=1`             | **忽略**；不展示 LLM Prompt / SSE done / session_id 调试条                 |


---

## 实现备忘（30 帽回填 · 2026-06-02）


| 项              | 内容                                                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 涉及文件           | `UnifiedChatPageClient.tsx` · `lib/unified-chat/portfolio-demo-chips.ts` · `lib/unified-chat/portfolio-chat-tier.ts` · `lib/chatbi-client.ts` · `13_flow_components*.md` |
| 档位状态           | sessionStorage `chatbi_access_level`；与 token 同清；mount re-verify 补 level                                                                                                  |
| 条件渲染锚点         | `showRouterDebug` · `showTimelinePanels` · `debugUrlAllowed` / `debugEnabled`                                                                                              |
| commit         | （30 帽 feat commit · 本分支）                                                                                                                                                |


---

## ### KPI（00）

（占位 · CLOSE 填写）

---

## ### 自检结论（执行者）

（40 帽回填）