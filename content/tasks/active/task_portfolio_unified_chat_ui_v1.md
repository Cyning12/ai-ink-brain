# Task：Portfolio Unified Chat 展示裁剪（W4 · debug / 五问 chip）

> **状态**：`draft`  
> **关联图谱**：`docs/_tech_graph/13_flow_components.md` · `12_flow_auth.md`（按需增量 `.ai.md`）  
> **关联 Issue/PR**：（待开 · 基线分支 `task/portfolio-visitor-auth-v1` @ W3 `3d74537` · **暂不 PR**）  
> **后端依赖**：无（只读 ChatBI `access/verify` 的 `access_level`；五问 E2E 归 **W6**）

---

## Harness 元信息（2026-05-31 起 · 新建 task 必填）

| 字段 | 值 |
|------|-----|
| **task_slug** | `portfolio-unified-chat-ui-v1` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | portfolio 模式 UI 分支 + chip 文案常量；可选组件单测；五问答通归 W6 |
| **freeze_id** | `PORTFOLIO-RAG-DEMO@2026-06-01` |
| **semi_auto** | `true` |
| **audit_profile** | `full` |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **git_branch** | `task/portfolio-visitor-auth-v1`（**续当前分支 · 不新开**） |
| **harness_mode** | **`looptask`** |
| **stop_after_hat** | **`CLOSE`** |

- **LoopTask 启动 Prompt**：`content/tasks/specs/PROMPT_looptask_startup_portfolio_w4_v1_zh.md`  
- **关账前**：正文须有 **`### KPI（00）`**

### Harness LoopTask 帽链

```text
00 → 10 → 22(R1) ⇄ 10 → 30 → 40 → 22(R2) → Task·50 → CLOSE
```

### 人工闸 `human_gate`

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | `pending` | 22-R1, 30 | 10 定稿后人批 |
| HG-AUDIT-R1 | `pending` | 30 | 22 R1 书面通过后 |
| HG-REINSPECT | `pending` | done | 50 后 CLOSE 前 |

---

## 背景与目标

Epic Portfolio（[`SPEC-portfolio_demo_site_v1_zh.md`](../specs/SPEC-portfolio_demo_site_v1_zh.md) **§4.4** · **§6.4** · **§6.6** · **§7 W4**）在 W2 四屏 + W3 鉴权（**运维主路径：ChatBI 明文 token + Python verify**）已落在分支 `task/portfolio-visitor-auth-v1` 后，本 task 交付 **Unified Chat 在 portfolio 模式下的展示层裁剪** 与 **五问 chip 文案**。

**完成态一句话**：`NEXT_PUBLIC_SITE_MODE=portfolio` 时，Unified Chat **隐藏 Router Debug**；按 ChatBI **`access_level`** 区分 **visitor 档**（无 Timeline/ExecutionTrace、忽略 `?debug=1`）与 **visitor-admin 档**（Timeline 可见、`?debug=1` 可开 LLM Prompt）；推荐 chip 替换为 **Q1～Q5 逐字**（[`投递冲刺_20260609_v1_zh.md`](../specs/投递冲刺_20260609_v1_zh.md) §2）；development 模式 **行为回归不变**。

**W3 已拍板（本 task 不得推翻）**

- portfolio / development **均**用 ChatBI 明文 token unlock（邮件发时效 token）
- **不**恢复 `PORTFOLIO_VISITOR_*` env 为主路径

---

## 范围

- [ ] **`components/unified-chat/UnifiedChatPageClient.tsx`**（及必要子组件）：portfolio 下按档位裁剪 debug/Timeline/Router Debug。
- [ ] **档位映射（10 帽定稿 · 建议）**：unlock 成功后读取 `requestChatbiAccessVerify` 的 **`access_level`** — `0|1` → visitor-admin 档；`2` → visitor 档（与 SPEC visitor / visitor-admin 表对齐）。
- [ ] **五问 chip**：portfolio 模式展示 **5 条**，文案与 SPEC §6.4 / 投递计划 §2 **提问列逐字一致**；无 token 时 chip 可填 draft，发送仍受 locked 约束。
- [ ] 可选：抽 `lib/unified-chat/portfolio-demo-chips.ts` 或常量文件，避免魔法字符串散落。
- [ ] **`/evidence` 页**（可选增强）：展示 Q3/Q5 相关锚点或 chip 列表引用（W2 已有页壳则可链回 Unified）。
- [ ] 增量 **`docs/_tech_graph/13_flow_components*.md`**（Unified portfolio 分支）；按需 `_manifest`。
- [ ] **`pnpm lint`** · **`pnpm test`** · **`pnpm build`** · **`NEXT_PUBLIC_SITE_MODE=portfolio pnpm build`** 绿。

## 非范围

- **W6**：五问 5/5 端到端、ingest 质量、录屏、Python SSE 契约变更。
- **W5 补丁**：sync 卷一～五全量（另 task）。
- **改** unlock/session API 主路径（W3 已交付 ChatBI verify）。
- **删除** development 下现有 Router Debug / Timeline（仅 portfolio 裁剪）。

---

## 依赖与引用

| 依赖项 | 路径/说明 |
|--------|-----------|
| **冻结 SPEC** | §4.4 · §4.6.5 · §6.4 · §6.6 · §7 W4 |
| **五问真值** | [`投递冲刺_20260609_v1_zh.md`](../specs/投递冲刺_20260609_v1_zh.md) §2 |
| **W3（同分支）** | [`content/tasks/done/task_portfolio_visitor_auth_v1.md`](../done/task_portfolio_visitor_auth_v1.md) |
| **Unified 入口** | `components/unified-chat/UnifiedChatPageClient.tsx` |

---

## 验收标准

### §4.4 / §6.6 裁剪

- [ ] portfolio + **visitor 档**（建议 `access_level===2`）：**无** Router Debug 开关与面板；**无** Timeline + ExecutionTrace；URL `?debug=1` **不生效**（强制关 LLM Prompt 区）。
- [ ] portfolio + **visitor-admin 档**（建议 `access_level` 0 或 1）：Timeline + ExecutionTrace **可见**；`?debug=1` **可开** LLM Prompt / SSE done；**仍无** Router Debug。
- [ ] portfolio + 两档：**保留** Text2SQL / `prefer` auto·rag·text2sql。
- [ ] **development** 模式：现有 debug/Timeline/chip **回归**（仍为 3 条通用 chip，除非 10 帽明确统一）。

### §6.4 五问 chip

- [ ] portfolio 展示 **5 条** chip，与下表 **逐字一致**：

| ID | chip 展示文案（逐字） |
|----|------------------------|
| Q1 | 《AI 编程可闭环协作》**卷三**讲什么？Harness 和签收是什么？ |
| Q2 | **RAG 混合检索**怎么做的？ |
| Q3 | **冷/温/热** 和 **架构三层** 区别？ |
| Q4 | **11 年经历**里 AI Coding 相关成果？ |
| Q5 | 按需读图相对整图灌入 **token/效果**？**边界**？ |

- [ ] 无 token 时：页壳 200 + 邮件文案 + unlock（W3 已有）；chip 点击可填入输入框，**发送**仍 blocked。

### 工程

- [ ] `pnpm lint` · `pnpm test` · `pnpm build` 通过。
- [ ] `NEXT_PUBLIC_SITE_MODE=portfolio pnpm build` 通过。

---

## 失败路径（建议）

| # | 触发 | 期望行为 |
|---|------|----------|
| F1 | portfolio 误展示 Router Debug | **缺陷** |
| F2 | visitor 档仍可见 Timeline | **缺陷** |
| F3 | chip 文案与 §6.4 差一字 | **缺陷**（人审） |
| F4 | development 回归：Router Debug 被误隐藏 | **缺陷** |

---

## 实现备忘（30 帽回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | `UnifiedChatPageClient.tsx` · 可选 `lib/unified-chat/portfolio-demo-chips.ts` · `13_flow_components*.md` |
| 档位状态 | unlock 后持久化 `access_level`（sessionStorage 或组件 state + 与 token 同清） |
| 图谱变更点 | `docs/_tech_graph/13_flow_components.md` |

---

## ### KPI（00）

（占位 · CLOSE 填写）

---

## ### 自检结论（执行者）

（40 帽回填）
