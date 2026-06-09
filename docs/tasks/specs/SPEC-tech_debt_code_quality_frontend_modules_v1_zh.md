# SPEC · 前端编码规范 tech-debt — 模块拆分（v1）

| 项 | 内容 |
| --- | --- |
| **状态** | `active` — **00 编排帽 2026-06-09 确认** |
| **版本** | v1.0 |
| **日期** | 2026-06-09 |
| **Epic** | [`task_tech_debt_code_quality_frontend_epic_v1.md`](../active/task_tech_debt_code_quality_frontend_epic_v1.md) |
| **规范真值** | [`docs/standards/CODING_FRONTEND_L2_v1_zh.md`](../../standards/CODING_FRONTEND_L2_v1_zh.md)（**active** v1.2） |
| **L1** | 工作区 [`CODING_BASELINE_L1`](../../../docs/standards/CODING_BASELINE_L1_v1_zh.md) |

---

## 1. 用途

本 SPEC 定义 **前端历史代码** 按模块对齐 L2（F-01～F-14 · AF-01～AF-06）的 **拆分边界、顺序与验收口径**。

- **00 编排帽**：可合并/拆分模块、调整 `depends_on`、修订路径 glob；修订后 **commit 本 SPEC** 再派发子 task。
- **子 task**：每模块（或关联组）对应 `docs/tasks/active/task_tech_debt_cq_frontend_m*.md` 之一。
- **禁止**：单会话全仓无边界重构。

---

## 2. 全局约束

| 项 | 约定 |
| --- | --- |
| **git_branch** | `task/tech-debt-code-quality-frontend`（Epic 全序列 **共用**） |
| **PR 目标** | **`production`**（**禁止**本 Epic PR merge 至 `main`） |
| **code_quality_bar** | `strict`（L2 §4 + L1 §4 + 22 证据） |
| **每模块门禁** | `pnpm lint` → `pnpm test` → `pnpm build`（F-14） |
| **图谱** | 仅结构/边界变更时更新 `docs/_tech_graph/` |
| **非范围** | `content/` 正文、`content/diary/`、纯样式重绘、依赖大版本升级 |

---

## 3. 模块编排表（初稿 · 00 可修订）

> **执行顺序**：严格串行；上一模块 **40 自检 pass + commit** 后链式派发下一模块。

| module_id | task 文件 | 路径范围（初稿） | 重点条文 / AF | depends_on | 状态 |
|-----------|-----------|------------------|---------------|------------|------|
| **M01** | `task_tech_debt_cq_frontend_m01_py_proxy_v1.md` | `lib/py-service-proxy.ts`、`lib/server/`、相关 `lib/*client*` | F-03, F-05, AF-01 | Epic SPEC 人签 | draft |
| **M02** | `task_tech_debt_cq_frontend_m02_bff_routes_v1.md` | `app/api/py/**/route.ts` | F-01, F-02, F-05 | M01 done | draft |
| **M03** | `task_tech_debt_cq_frontend_m03_unified_chat_v1.md` | `lib/unified-chat/`、`components/unified-chat/`、`app/unified-chat/` | F-09, F-10, AF-02, AF-03 | M02 done | draft |
| **M04** | `task_tech_debt_cq_frontend_m04_chat_rag_v1.md` | `lib/chat/`、`components/ChatPanel*`、`app/chat/` | F-09, F-10, F-11 | M03 done | draft |
| **M05** | `task_tech_debt_cq_frontend_m05_auth_env_v1.md` | `lib/auth.ts`、`lib/site-mode*`、`lib/supabase*` | F-03, F-13, AF-06 | M04 done | draft |
| **M06** | `task_tech_debt_cq_frontend_m06_components_misc_v1.md` | `components/`（M03/M04 未覆盖）、`lib/hooks/`、`lib/utils*` | F-01, F-11, F-02 | M05 done | draft |

### 3.1 00 修订记录（落盘时填写）

| 日期 | 修订人 | 变更摘要 |
|------|--------|----------|
| 2026-06-09 | 总设初稿 | M01～M06 初稿边界 |
| 2026-06-09 | 10 帽 + 00 确认 | 各 module task 验收细项落盘；扫描 8×route AF-01、UnifiedChatPageClient 1147 行、ChainEventCard 1106 行 |

---

## 4. 每模块最小交付

1. 代码符合 L2 焦点条文；无新增 `any` / 硬编码 `PY_API_URL`。
2. 本模块路径内 AF 对应项已处理或 **明示例外**（task 内一行理由 + 偿还子项）。
3. `### 自检结论（执行者）` pass；命令输出要点已填。
4. **commit** 至 `task/tech-debt-code-quality-frontend`。
5. 链式派发下一 `module_id`（见 Epic `chain_prompt`）。

---

## 5. Epic 关账 PR

- **base**：`production`
- **head**：`task/tech-debt-code-quality-frontend`
- **Required checks**：`quality` / `lint-and-build` 全绿
- **禁止**：merge 至 `main`；禁止 Required 未绿时 `gh pr merge`

---

## 6. 修订记录

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| v1.0 | 2026-06-09 | 总设初稿；待 00 帽确认 |
| v1.1 | 2026-06-09 | 00 确认 active；M01～M06 10 帽验收细项 |
