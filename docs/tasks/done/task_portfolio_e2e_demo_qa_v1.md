# Task：Portfolio W6 · 五问 E2E 联调与演示验收

> **状态**：`done`（2026-06-03 · HG-REINSPECT approved · Portfolio W6 五问 E2E 关账）  
> **验收清单**：[`docs/tasks/reinspect_results/CHECKLIST_portfolio_e2e_demo_qa_v1_acceptance_zh.md`](../reinspect_results/CHECKLIST_portfolio_e2e_demo_qa_v1_acceptance_zh.md)  
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
| **acceptance_interaction** | `required` |
| **验收清单** | [`CHECKLIST_portfolio_e2e_demo_qa_v1_acceptance_zh.md`](../reinspect_results/CHECKLIST_portfolio_e2e_demo_qa_v1_acceptance_zh.md)（规约 [`SPEC-harness_acceptance_checklist_v1_zh.md`](../specs/SPEC-harness_acceptance_checklist_v1_zh.md)） |

- **LoopTask 启动 Prompt**：`docs/tasks/specs/PROMPT_looptask_startup_portfolio_w6_v1_zh.md`  
- **Invoke**：`docs/harness/invokes/by-task/portfolio-e2e-demo-qa-v1/`（`invoke_20260603_00_*` · `invoke_20260603_10_*`）  
- **关账前**：正文须有 **`### KPI（00）`**

### Harness LoopTask 帽链（草案）

```text
00 → 10 → 22(R1) ⇄ 10 → 30 → 40 → 22(R2) → Task·50 → CLOSE
```

| 帽 | 要点 |
|----|------|
| **00** | ✅ 2026-06-03：`main` @ `ea8ac48` · gates 扫描 · 已派 **10** |
| **10** | ✅ 2026-06-03：Preview env · sync 计划 · 录屏分镜 · chip 逐字 · 必读列表 |
| **22 R1** | ✅ `reviews/task_portfolio_e2e_demo_qa_v1_audit_R1_20260603.md` · 零阻塞 → **30** |
| **30** | ✅ PROJECT_CONFIG W6 登记 · 无业务 patch · sync **未跑**（API down） |
| **40** | ✅ CI 全绿 · content 三目录 OK · 五问/录屏 **待维护者** |
| **22 R2** | ✅ `reviews/..._audit_R2_20260603.md` |
| **50** | ✅ `reinspect_20260603.md` · **pass-with-notes** |
| **CLOSE** | ✅ 2026-06-03：HG-REINSPECT approved · KPI 90% · git mv done |

### 人工闸 `human_gate`

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | approved | 22-R1, 30 | 维护者 2026-06-03 签收 |
| HG-AUDIT-R1 | approved | 30 | 22 R1 书面通过后 |
| HG-REINSPECT | approved | done | 维护者 2026-06-03 签收 · checklist §A–F · sync/五问/录屏 |

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

## 文档矛盾（10 帽 · 验收真值）

| 矛盾 | 出处 A | 出处 B | **W6 真值** |
|------|--------|--------|-------------|
| 解锁主路径 | SPEC §4.3 草稿：portfolio 秘钥 + 邮件 | W3/W4 done + 代码：`UnifiedChatPageClient` ChatBI token + verify | **ChatBI 明文 token**（`requestChatbiAccessVerify`）；`PORTFOLIO_VISITOR_*` 仅 **后门**（`unlock` `secret` 分支） |
| Q3 命中目录 | 投递 §2：`evidence/*` **或 vol3** | SPEC §6.4 / 本 task：**evidence only** | **evidence only**（vol3 **不计** Q3 通过） |
| chip 逐字 | task/SPEC 表含 Markdown `**强调**` | UI：`lib/unified-chat/portfolio-demo-chips.ts` `label` | **以 `label` 字段为准**（下表「UI 逐字」列） |
| Preview env 变量名 | SPEC §8：`PORTFOLIO_VISITOR_*` | Vercel 实际联调 | `NEXT_PUBLIC_SITE_MODE` + **ChatBI token**（DB 发放）+ 与生产 **同** Supabase/`EMBEDDING_DIM`/`CONTENT_ROOT` 语义 |

---

## 联调环境（Preview · 同一 Vercel 项目 · §6.7）

> **禁止**在 task 中写入密钥明文；维护者在 Vercel / 本地 `.env` 配置。

| 层 | 变量 / 配置 | 要求 |
|----|-------------|------|
| **前端（Vercel Preview + 生产）** | `NEXT_PUBLIC_SITE_MODE` | `portfolio` |
| | `PY_API_URL` | 指向 **同一套** 已部署 api-python（非 localhost 混用，除非 40 明确标注「仅本地」） |
| | `NEXT_PUBLIC_SUPABASE_URL` · `SUPABASE_SERVICE_ROLE_KEY`（或别名） | 与 **生产演示** 同一 Supabase 项目 |
| | `EMBEDDING_DIM` · `EMBEDDING_PROVIDER` 等 | 与生产一致（见 `PROJECT_CONFIG` §C） |
| | `SYNC_ADMIN_SECRET` | 与 Python `admin_secret()` **同值**；仅服务端；curl 文档别名 `ADMIN_TOKEN` |
| **解锁（主路径 · W4）** | ChatBI DB 明文 token | 邮件 `231127227@qq.com` 发放；浏览器 `requestChatbiAccessVerify` → `access_level` |
| **档位 → UI**（`lib/unified-chat/portfolio-chat-tier.ts`） | `access_level` **2** → `visitor` | 无 Timeline · 无 `?debug=1` · 无 Router Debug |
| | `access_level` **0 或 1** → `visitor-admin` | Timeline + ExecutionTrace · `?debug=1` 可开；**仍无** Router Debug |
| **后端（api-python 进程 / 托管）** | `CONTENT_ROOT` | **本仓** `content/` 绝对路径（与展示同源） |
| **五问入口 URL** | （40 回填） | `https://<preview-or-prod>/unified-chat` · 占位 `[DEMO_URL]/unified-chat` |

**硬约束**：Preview 与生产 **不得** 各连不同 Supabase 项目（F4）；**不得** 另起第二套前后端项目（非范围）。

---

## sync 执行计划（W6 · 对齐投递 §3.3）

| 步 | 动作 | 通过门槛 / 留证 |
|----|------|-----------------|
| 1 | `./tools/sync-portfolio-content.sh`（新卷后 `--force`） | stdout manifest；`methodology/` · `resume/` · `evidence/` 各 ≥1 `.md` |
| 2 | 确认 api-python `CONTENT_ROOT=<本仓>/content` | 与 `tools/README-portfolio-content-sync.md` 一致 |
| 3 | **POST admin/sync** | **路径 A（推荐）**：`$PY_API_URL/api/py/admin/sync` + `Authorization: Bearer $ADMIN_TOKEN`（`ADMIN_TOKEN`=`SYNC_ADMIN_SECRET`） · **路径 B**：本地 `pnpm dev` → `POST /api/admin/sync` 同 Bearer |
| 4 | 轮询 job | `GET .../admin/sync?jobId=<id>` 至 `done`；记录 **jobId** → 实现备忘 |
| 5 | 结果断言 | `filesScanned > 0` 且 `chunksUpserted > 0`；**`filesScanned===0` → F1 硬 FAIL** |
| 6 | 五问预跑 | Preview/生产 URL · `/unified-chat` · 逐字 chip · 每问 Timeline JSON + sources category |

**release 后**：公众仓新卷 release → 重复步 1–5，否则 Q1 可能仍命中旧摘要（投递 §2）。

---

## 录屏 checklist（3–5 min · P0-D · §6.7）

| 序 | 镜头 | 时长建议 | 验收点 |
|----|------|----------|--------|
| 1 | `/methodology` 卷三目录或正文首屏 | ~30s | 公开区 **无** unlock；去 Ink 品牌 |
| 2 | `/unified-chat` 解锁说明 + 邮件文案 | ~30s | 不暗示站点公开；输入 ChatBI token 解锁 |
| 3 | 解锁后点击 **Q1** chip（UI 逐字） | ~60s | 能答；**sources** 含 `methodology/vol3`；可选展开 Timeline（visitor-admin） |
| 4 | 点击 **Q5** chip | ~60s | 能答；sources 主路径 `evidence/*` |
| 5 | sources 面板特写 | ~30s | ≥1 条可核对 `filename` / category |
| 6 | （可选）四屏快切：`/` · `/resume` · `/methodology` · `/evidence` | ~30s | 均 **200** |

**落盘**：录屏文件或分镜截图集路径写入 `reinspect_results`；**F5** 缺失阻塞 HG-REINSPECT。

---

## 给执行帽必读（22-R1 / 30 / 40）

| 帽 | 必读（相对本仓根） |
|----|-------------------|
| **22 R1** | 本 task · [`SPEC-portfolio_demo_site_v1_zh.md`](../specs/SPEC-portfolio_demo_site_v1_zh.md) §6.4–6.7 · 配对后端 `SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md`（只读） |
| **30** | 上表 + `tools/README-portfolio-content-sync.md` · `lib/unified-chat/portfolio-demo-chips.ts` · `lib/unified-chat/portfolio-chat-tier.ts` · **禁止**改 ChatBI 主路径 |
| **40** | 本 task §联调环境 · §sync 计划 · §五问验收表 · §录屏 checklist · `docs/tasks/reinspect_results/README.md` |

**test_strategy**：`recommended` — 自动化以 `pnpm lint/test/build` + portfolio build 为主；五问以 URL 人工 + Timeline 留证。

---

## 范围

- [x] **联调（部分）**：三 category 各 ≥1 `.md` · **admin/sync 未跑**（维护者 checklist §B）
- [ ] **五问预跑**：Q1–Q5 · Timeline + sources（**维护者** checklist §D）
- [ ] **全绿判定**：待 Preview 复验（50：**pass-with-notes**）
- [x] **四屏冒烟**：`next build` 含五路由 · 运行时 URL **待维护者** §C
- [ ] **录屏 checklist**：路径待填 checklist §E
- [x] **reinspect 落盘**：`task_portfolio_e2e_demo_qa_v1_reinspect_20260603.md`
- [ ] **（可选 · 30）** `/evidence` 锚点 — **跳过**（页内已有五问说明）
- [x] **（30）** `PROJECT_CONFIG` portfolio W6 表已登记

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

## 五问验收表（冻结 · UI 逐字真值 · `portfolio-demo-chips.ts`）

| ID | UI 逐字（`label` · 点击发送文案） | 期望命中 `content/` | 合格回答要点 | sources 判定 |
|----|-----------------------------------|---------------------|--------------|--------------|
| Q1 | 《AI 编程可闭环协作》卷三讲什么？Harness 和签收是什么？ | `methodology/vol3_*` | 任务单 + 书面签收 + 合并前 CI | 含 vol3 |
| Q2 | RAG 混合检索怎么做的？ | `resume/*` 或项目段 | 向量 + 混合 + rerank ≥2 项；**非** 仅 direct_answer（F3） | category `resume` |
| Q3 | 冷/温/热 和 架构三层 区别？ | **`evidence/*` only** | 记忆分层 ≠ 架构分层 | **仅** `evidence`（vol3 不计） |
| Q4 | 11 年经历里 AI Coding 相关成果？ | `resume/*` | 百果园 Cursor + Ink/RAG + 连载；不虚构 | category `resume` |
| Q5 | 按需读图相对整图灌入 token/效果？边界？ | `evidence/*` | 约 1/9 + 小样本、非全行业 | category `evidence` |

**全绿**：5/5 能答 · sources **≥4/5** 行「sources 判定」满足 · 单问重试 **≤3**（投递 §2）。

---

## 验收标准

- [x] Preview/生产 URL 配置（维护者 checklist §A · 2026-06-03）
- [x] sync · `filesScanned>0`（jobId `c44158a5-6e28-4583-ab6b-f5db9ca1866d` · 维护者 §B）
- [x] 五问 **全绿**（维护者 §D · 后端 samples 留证）
- [x] 录屏路径（`~/Desktop/录屏2026-06-03 18.15.00.mov` · §E）
- [x] `pnpm lint` · `pnpm test` · `pnpm build` · `NEXT_PUBLIC_SITE_MODE=portfolio pnpm build`（2026-06-03 ✅）
- [x] Harness：22 R1/R2 · 50 reinspect · 验收清单 · **CLOSE** · KPI 90% · **HG-REINSPECT approved**（2026-06-03）

---

## 失败路径

| # | 触发条件 | 系统/验收行为 | 可重试 | 用户可见 |
|---|----------|---------------|--------|----------|
| F1 | sync 未跑或 `filesScanned=0` | **阻塞**五问验收；先 sync+ingest | 是 | 维护者见 job 日志 |
| F2 | 单问 RAG 降级 / sources  category 不符 | 同一问重试 **≤3**；仍失败记 **FAIL** 项 | 是（≤3） | Unified Chat 正常/error UI |
| F3 | Q2 仅 direct_answer 通识答 | **不算** Q2 通过 | 调 ingest/rewrite 后重跑 | — |
| F4 | Preview env 与生产 Supabase 不一致 | **缺陷**；修正 env 后重验 | 是 | — |
| F5 | 录屏缺失 | **阻塞** HG-REINSPECT | — | — |
| F6 | `access_level` 未知（-1）仍发消息 | 先 re-verify；联调记录档位 | 是 | tier 提示 |
| F7 | Q3 sources 含 `methodology` 且无 `evidence` | **Q3 FAIL**（R4-1 口径） | 调 ingest/问法后 ≤3 | sources 面板 |

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-06-03 | **10 帽定稿**：联调环境 · sync 计划 · 录屏 checklist · 矛盾真值 · UI 逐字五问表 · F6/F7 |
| 2026-06-03 | **维护者留证**：sync jobId · 五问后端 samples · 录屏 · checklist §A–F 签收 |

---

## 实现备忘（由子 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`（Portfolio W6 表） |
| 联调 URL | Preview/生产 · `/unified-chat`（维护者 §A 已签 · 2026-06-03） |
| sync jobId | **`c44158a5-6e28-4583-ab6b-f5db9ca1866d`** · `filesScanned=3` · `chunksUpserted=72` · W6 清语料后重跑（见 checklist §B · 后端 `sync-job-final.json`） |
| 五问留证 | 配对后端 `docs/diary/samples/portfolio-rag-demo/`（`five-questions-results.md` + `q*-sources-run*.json` + `screenshots/`） |
| 录屏 | `~/Desktop/录屏2026-06-03 18.15.00.mov`（本地 · §E） |
| 图谱变更点 | 无 |
| 50 / 清单 | `reinspect_results/task_portfolio_e2e_demo_qa_v1_reinspect_20260603.md` · `CHECKLIST_*_acceptance_zh.md` |

---

## ### KPI（00）

**rubric**: KPI_RUBRIC_v1_2 · **汇总**: **90%** · **状态**: **pass** · **帽**: 00·10·22·30·40·50·CLOSE  
**关账**：HG-REINSPECT approved · 2026-06-03

| hat_code | round | agent_mode | D1 | D2 | D3 | D4 | D5 | judgment_notes |
|----------|-------|------------|----|----|----|----|-----|----------------|
| 00 | — | main_chat | 100 | 100 | 100 | 100 | — | 编排合规 |
| 10 | — | main_chat | 100 | 100 | 100 | 100 | — | 定稿完整 |
| 22 | R1 | main_chat | 100 | 100 | 100 | 100 | — | 零阻塞 |
| 30 | — | main_chat | 100 | 100 | 100 | 100 | 100 | sync 维护者留证 |
| 40 | — | main_chat | 100 | 100 | 100 | 100 | 100 | 演示层签收 |
| 22 | R2 | main_chat | 100 | 100 | 100 | 100 | 100 | R2 通过 |
| 50 | — | main_chat | 100 | 100 | 100 | 100 | 100 | 维护者补证后 pass |
| CLOSE | — | main_chat | 100 | 100 | 100 | 100 | 100 | HG-REINSPECT approved |

**blocked 原因**：无

---

## ### 自检结论（执行者）

**执行日期**：2026-06-03 · **分支**：`task/portfolio-e2e-demo-qa-v1`

| 项 | 结果 |
|----|------|
| lint / test / build | ✅ 全绿（portfolio build 含） |
| content 三目录 | ✅ methodology · resume · evidence 各 1 md |
| admin/sync | ✅ job `c44158a5-…` · 3/72（W6 清语料后 · 维护者 2026-06-03） |
| 五问 Preview | ✅ 5/5 · 后端 samples 留证 |
| 录屏 | ✅ `~/Desktop/录屏2026-06-03 18.15.00.mov` |
| 结论 | **done · W6 关账**（2026-06-03） |

---

## 关账前 · 维护者动作（COPY 用）

| 步骤 | 文件 | 位置 | 改什么 |
|------|------|------|--------|
| 1 | `docs/tasks/reinspect_results/CHECKLIST_portfolio_e2e_demo_qa_v1_acceptance_zh.md` | §A–§E | 逐项勾选 · 填录屏路径 · 填 Preview URL |
| 2 | `docs/tasks/active/task_portfolio_e2e_demo_qa_v1.md` | `human_gate` · `HG-REINSPECT` · `status` | 五问+录屏 OK 后：`pending` → **`approved`** |
| 3 | 同上 | `### KPI（00）` | CLOSE 帽按全绿结果 **重算** KPI% |
| 4 | Git | — | `git mv` → `docs/tasks/done/` · 更新 `_views/done.md` |
