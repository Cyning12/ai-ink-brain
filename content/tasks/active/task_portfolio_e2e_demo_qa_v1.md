# Task：Portfolio W6 · 五问 E2E 联调与演示验收

> **状态**：`ready_for_audit`（**HG-TASK-DRAFT** `approved` · 待 22 R1）  
> **关联图谱**：`docs/_tech_graph/11_flow_api.md`（admin/sync 代理）· `13_flow_components.md`（Unified Chat / chip）  
> **关联 Issue/PR**：`main` @ `ea8ac48`（#50 W3+W4 已合并）  
> **后端依赖**：**有** — `POST /api/py/admin/sync` · ingest · RAG 检索质量（配对后端 SPEC / RUNBOOK）

---

## Harness 元信息（2026-05-31 起 · 新建 task 必填）

| 字段 | 值 |
|------|-----|
| **task_slug** | `portfolio-e2e-demo-qa-v1` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | 以 **Preview/生产 URL 人工五问预跑 + Timeline/sources 留证** 为主；`pnpm lint/test/build` 回归为关账门禁；**不**在本 task 首回合强上 Playwright E2E |
| **freeze_id** | `PORTFOLIO-RAG-DEMO@2026-06-01` |
| **semi_auto** | `true` |
| **audit_profile** | `full` |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **git_branch** | `task/portfolio-e2e-demo-qa-v1` |
| **harness_mode** | `looptask` |
| **stop_after_hat** | `CLOSE` |
| **worktree_root** | `ai-ink-brain`（本仓根） |

- **LoopTask 启动 Prompt**（待 10 帽定稿后补链）：`content/tasks/specs/PROMPT_looptask_startup_portfolio_w6_v1_zh.md`  
- **关账前**：正文须有 **`### KPI（00）`**

### Harness LoopTask 帽链（草案）

```text
00 → 10 → 22(R1) ⇄ 10 → 30 → 40 → 22(R2) → Task·50 → CLOSE
```

| 帽 | 要点 |
|----|------|
| **00** | 扫 gates · 确认 W1–W5 已进 `main` · 派 10 |
| **10** | 冻结五问验收表 · 联调环境 · 录屏 checklist · failure_paths |
| **22 R1** | 跨仓 ingest/RAG 风险审计 · reviews 落盘 |
| **30** | **最小代码**（可选 `/evidence` Q3/Q5 锚点 · `PROJECT_CONFIG` env 补登记）+ **联调执行** |
| **40** | 五问预跑记录 · sync 留证 · `pnpm lint/test/build` |
| **22 R2** | 签收 → 派 50 |
| **50** | reinspect · 五问全绿判定 |
| **CLOSE** | KPI · `git mv` done |

### 人工闸 `human_gate`

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | approved | 22-R1, 30 | 维护者 2026-06-03 签收 |
| HG-AUDIT-R1 | approved | 30 | 22 R1 书面通过后 |
| HG-REINSPECT | pending | done | 50 后 · 五问全绿 + 录屏人签 |

---

## 背景与目标

Epic Portfolio（[`SPEC-portfolio_demo_site_v1_zh.md`](../specs/SPEC-portfolio_demo_site_v1_zh.md) **§6.4** · **§6.7** · **§6.8** · **§7 W6**）在 **W1–W5 与 W3/W4（#50）已合并 `main`** 后，本 task 交付 **四屏 + 五问 RAG 端到端联调验收**、**录屏素材**与 **6/9 投递硬门槛** 的可复现留证。

**完成态一句话**：在 **同一 Vercel 项目** Preview 或生产 URL（`NEXT_PUBLIC_SITE_MODE=portfolio`）上，维护者 unlock 后 **五问 chip 逐字预跑通过**（5/5 能答 · sources ≥4/5 正确 category · 单问重试 ≤3）；`content/` 经 **admin/sync + ingest** 与展示同源；留 **录屏 3–5 min** + **reinspect 落盘**。

**W3/W4 已拍板（本 task 不得推翻）**

- portfolio unlock **主路径**：ChatBI 明文 token + `GET /api/py/chatbi/access/verify` · `access_level` 档位裁剪（W4 已实现）
- 五问 chip 文案以 [`投递冲刺_20260609_v1_zh.md`](../specs/投递冲刺_20260609_v1_zh.md) **§2** 与 SPEC **§6.4** 为准

---

## 预跑基线（2026-06-02 · 非阻塞 · 本地 diary）

> 展示素材：`docs/diary/assets/portfolio-w4-unified-chat/`（gitignore · 维护者本地）

| ID | 状态 | 备注 |
|----|------|------|
| Q1 | ✅ 答对 | 推荐展示 **08** + Timeline v2（`methodology/vol3` 命中） |
| Q2 | ⚠️ | 仅 **09 降级**（rag 不确定 → direct_answer）；**W6 须补 RAG 成功** |
| Q3 | ⚠️ | 答对 · sources **未** evidence-only 严格口径 |
| Q4 | ✅ | `resume/cv-online.md` 命中 |
| Q5 | ⚠️ | 答对 · sources 偏 tasks · 目标 `evidence/*` |

**维护者签收**：上述缺口 **不阻塞** 开 W6 task；**关账前** Q2 成功 RAG + sources 严格口径须达标或 SPEC 豁免人签。

---

## 范围

- [ ] **联调**：`CONTENT_ROOT` → 本仓 `content/` · `POST /api/py/admin/sync` → ingest · 三 category 各 ≥1 文档（§6.5）
- [ ] **五问预跑**：Q1–Q5 逐字 chip · 每问记录 **Timeline JSON** + 执行链路截图（或录屏段）
- [ ] **全绿判定**：5/5 能答 · sources **≥4/5** 指向 SPEC 期望 category · 单问重试 **≤3**（投递 §2）
- [ ] **四屏冒烟**：`/` · `/resume` · `/methodology` · `/unified-chat` · 可选 `/evidence` **200**
- [ ] **录屏 checklist**：3–5 min（方法论 → unlock → Q1 + Q5 → sources 可见）— SPEC §6.7 / 投递 P0-D
- [ ] **reinspect 落盘**：`content/tasks/reinspect_results/task_portfolio_e2e_demo_qa_v1_reinspect_*.md`
- [ ] **（可选 · 30）** `/evidence` 页 Q3/Q5 锚点增强（SPEC §6.4 可选）
- [ ] **（可选 · 30）** `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` 登记 portfolio env（SPEC §2 缺口）

## 非范围

- 撤销 W3 ChatBI token 主路径 · 恢复 `PORTFOLIO_VISITOR_*` env 为主路径
- 大规模 Unified Chat UI 重构（W4 已交付）
- 后端 ingest 算法 / hybrid 参数 **实现**（归配对后端 task；本 task **验收**其行为）
- 新建第二套演示前后端（须 **同一 Vercel 项目** · §6.7）
- 五问 chip 文案变更（除非投递 §2 人审修订）

---

## 依赖与引用

| 依赖项 | 路径/说明 |
|--------|-----------|
| Epic SPEC | [`SPEC-portfolio_demo_site_v1_zh.md`](../specs/SPEC-portfolio_demo_site_v1_zh.md) §6.4–§6.8 |
| 投递五问真值 | [`投递冲刺_20260609_v1_zh.md`](../specs/投递冲刺_20260609_v1_zh.md) §2 · §3.3 |
| W4 done | [`task_portfolio_unified_chat_ui_v1.md`](../done/task_portfolio_unified_chat_ui_v1.md) |
| W3 done | [`task_portfolio_visitor_auth_v1.md`](../done/task_portfolio_visitor_auth_v1.md) |
| sync 脚本 | `tools/sync-portfolio-content.sh` · `tools/README-portfolio-content-sync.md` |
| chip 常量 | `lib/unified-chat/portfolio-demo-chips.ts` |
| admin/sync BFF | `app/api/admin/sync/route.ts` |
| 后端 governance | `ai-ink-brain-api-python/docs/spec/governance/SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md`（跨仓只读） |
| PROJECT_CONFIG | `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` |

---

## 五问验收表（冻结引用 · 与 SPEC §6.4 一致）

| ID | chip 展示文案（逐字） | 期望命中 `content/` | 合格回答要点 |
|----|----------------------|---------------------|--------------|
| Q1 | 《AI 编程可闭环协作》**卷三**讲什么？Harness 和签收是什么？ | `methodology/vol3_*` | 任务单 + 书面签收 + 合并前 CI；sources 含 vol3 |
| Q2 | **RAG 混合检索**怎么做的？ | `resume/*` 或项目段 | 向量 + 混合检索 + rerank 至少两项 |
| Q3 | **冷/温/热** 和 **架构三层** 区别？ | **`evidence/*` only**（vol3 **不计** Q3 通过） | 记忆分层 ≠ 架构分层 |
| Q4 | **11 年经历**里 AI Coding 相关成果？ | `resume/*` | 百果园 Cursor + Ink/RAG + 连载；不虚构 |
| Q5 | 按需读图相对整图灌入 **token/效果**？**边界**？ | `evidence/*` | 约 1/9 + **小样本、非全行业** |

---

## 验收标准

- [ ] Preview/生产 URL 配置：`NEXT_PUBLIC_SITE_MODE=portfolio` + ChatBI token 档位 + **同** Supabase / `CONTENT_ROOT` 语义（§6.7）
- [ ] sync 后 `filesScanned=0` → **硬 FAIL**（对齐后端 SPEC §4.2.3）
- [ ] 五问 **全绿**（见上表 + 投递 §2 全绿判定）
- [ ] 录屏文件或等价分镜截图集落盘（路径写入 reinspect）
- [ ] `pnpm lint` · `pnpm test` · `pnpm build` · `NEXT_PUBLIC_SITE_MODE=portfolio pnpm build` 全绿（关账门禁）
- [ ] Harness：22 R1/R2 · 50 reinspect · CLOSE · KPI · task 归档 `done/`

---

## 失败路径

| # | 触发条件 | 系统/验收行为 | 可重试 | 用户可见 |
|---|----------|---------------|--------|----------|
| F1 | sync 未跑或 `filesScanned=0` | **阻塞**五问验收；先 sync+ingest | 是 | 维护者见 job 日志 |
| F2 | 单问 RAG 降级 / sources  category 不符 | 同一问重试 **≤3**；仍失败记 **FAIL** 项 | 是（≤3） | Unified Chat 正常/error UI |
| F3 | Q2 仅 direct_answer 通识答 | **不算** Q2 通过 | 调 ingest/rewrite 后重跑 | — |
| F4 | Preview env 与生产 Supabase 不一致 | **缺陷**；修正 env 后重验 | 是 | — |
| F5 | 录屏缺失 | **阻塞** HG-REINSPECT | — | — |

---

## 实现备忘（由子 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | （30 帽回填 · 预期少量：`PROJECT_CONFIG` · 可选 `app/evidence/` 锚点） |
| 联调 URL | （40 帽：Preview deployment URL） |
| sync jobId | （40 帽留证） |
| 五问 run_id | （每问 Timeline · reinspect 表） |
| 图谱变更点 | 若无代码改动可填「无」 |

---

## ### KPI（00）

> **由 `kpi_aggregator` 填写**（默认 CLOSE）；格式见工作区 `KPI_RUBRIC_v1_2.md`。

（占位 · 关账后删除）

---

## ### 自检结论（执行者）

（40 帽回填）
