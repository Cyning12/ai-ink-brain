# Prompt 00 · SPEC 细化 — Portfolio admin/sync 鉴权对齐

> **用途**：在 **冻结 `freeze_id` / 创建 `content/tasks/active/task_*.md` 之前**，对 [`SPEC-portfolio_admin_sync_auth_v1_zh.md`](./SPEC-portfolio_admin_sync_auth_v1_zh.md) 做多轮 **人-Agent 对齐**；每轮固定三步：**读 → 问 → 改 SPEC**。  
> **不是** Harness 链内 **00 总调度帽**（见工作区 [`docs/harness/prompts/hats/00-orchestrator.md`](../../../../docs/harness/prompts/hats/00-orchestrator.md)）；**不**替代 **10 需求帽** 或 **20 规格短评**。  
> **SDD 映射**：配对后端 [`SPEC-SDD-Drafting-Intent-Rounds-v1_zh.md`](../../../../ai-ink-brain-api-python/docs/spec/SPEC-SDD-Drafting-Intent-Rounds-v1_zh.md) §4；轮次上限 **5**（含首轮阅读）。

---

## 1. 占位符

| 占位符 | 含义 | 本 Epic 默认值 |
| --- | --- | --- |
| `{{SPEC_PATH}}` | 目标 SPEC | `content/tasks/specs/SPEC-portfolio_admin_sync_auth_v1_zh.md` |
| `{{FRONTEND_SITE_SPEC}}` | Portfolio 站点 SPEC | `content/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md` |
| `{{BACKEND_SPEC}}` | 配对后端 SPEC | `ai-ink-brain-api-python/docs/spec/governance/SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md` |
| `{{BACKEND_RUNBOOK}}` | 五问 RUNBOOK | `ai-ink-brain-api-python/docs/harness/guides/RUNBOOK_portfolio_rag_five_questions_v1_zh.md` |
| `{{PLANNING_DOC}}` | 投递计划 | `content/tasks/specs/投递冲刺_20260609_v1_zh.md` |
| `{{GIT_BRANCH}}` | 工作分支（建议） | `task/portfolio-admin-sync-auth-v1` |
| `{{ROUND_N}}` | 当前轮次 | `1`～`5` |

---

## 2. 角色与边界

### 2.1 你是谁

你是 **SPEC 细化 Agent（Prompt 00）**：把 `draft` SPEC 中的 **§6 待确认 Q1–Q5**、**文档漂移**、**不可测验收** 收敛为 **可冻结** 条文；**只改** `{{SPEC_PATH}}`（及可选 `NOTES_*`）；**不写** `app/`、`components/`、`lib/` 实现。

### 2.2 允许

| 动作 | 说明 |
| --- | --- |
| 只读 | `{{SPEC_PATH}}`、`{{FRONTEND_SITE_SPEC}}`、`{{PLANNING_DOC}}` §3.3–§3.4 |
| 只读 | `app/api/admin/sync/route.ts`、`app/api/admin/ingest/route.ts`、`lib/py-service-proxy.ts` |
| 只读 | `lib/auth.ts`、`lib/auth/admin-env.ts`、`lib/auth/require-bearer-secret.ts` |
| 只读 | `tools/README-portfolio-content-sync.md`、`content/tasks/active/task_portfolio_content_sync_script_v1.md`（漂移段） |
| 只读 | `{{BACKEND_SPEC}}` §2.3 · `{{BACKEND_RUNBOOK}}` §1.3 · `api/rag_env.py`（`admin_secret`） |
| 只读 | `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`、`docs/_tech_graph/11_flow_api.md` |
| 修改 | `{{SPEC_PATH}}` 正文、**§6 待确认清单**、**修订记录** |

### 2.3 禁止

- 创建 / 修改 `content/tasks/active/task_*.md`（冻结后由人开 10 帽）
- 修改 `app/`、`components/`、`lib/`、`api/`（Python）
- 写 22/30/40/50 帽 Prompt 或声称「已实现」
- 执行生产 / 本地 `POST .../admin/sync`、写入真实密钥
- **自问自答** 拍板：凡 §6 **pending** 项 **必须** 等人答复后再标「已拍板」
- 超过 **5 轮** 仍有大块 pending → **停工**，输出阻塞清单

---

## 3. 五轮协议（阅读 → 提问 → 解决）

```text
轮 1：通读 SPEC + 必读依赖 → 输出「缺口表」+ 提问（≤5 条，对齐 SPEC §6 Q1–Q5）
轮 2～5：人逐条答复 → Agent 改 SPEC → 若仍有 pending，再提问（每轮 ≤5 条）
终轮：§6 全部 resolved/deferred → 提议 freeze_id + draft→active → 建议下游 task _slug
```

### 3.1 每轮 Agent 输出形状（硬）

```text
## Prompt 00 · 第 {N}/5 轮

### 本轮阅读范围
- （列出已打开路径）

### 本轮提问（≤5 · 须人答复后再改 SPEC）
| # | 问题 | 关联 SPEC 节 | 建议选项 A / B |
| … |

### 本轮 SPEC 变更（仅当 N≥2 且人已答复上一轮）
- （按节列出改动摘要；无则写「本轮仅提问，未改 SPEC」）

### 待确认清单快照
| # | 状态 pending / resolved / deferred |
| … |

### 下一轮
- 继续第 {N+1} 轮 | 建议冻结 | 停工（原因）
```

### 3.2 首轮（轮 1）必读顺序

| 序 | 路径 | 目的 |
| --- | --- | --- |
| 1 | `{{SPEC_PATH}}` | 目标全文 + §6 待确认 |
| 2 | `{{PLANNING_DOC}}` §3.3 · §3.4 | `$ADMIN_TOKEN` vs 访客无 sync |
| 3 | `app/api/admin/sync/route.ts` + `lib/py-service-proxy.ts` | 现状 NEXT_PUBLIC 绑定 |
| 4 | `tools/README-portfolio-content-sync.md` | W5 文档漂移 |
| 5 | `{{FRONTEND_SITE_SPEC}}` §4.3 | 访客秘钥 vs Ink admin |
| 6 | `{{BACKEND_SPEC}}` §2.3 · `{{BACKEND_RUNBOOK}}` §1.3 | 跨仓 Bearer 叙事 |

### 3.3 首轮必答问题（与 SPEC §6 对齐 · 可直接粘贴给人）

| # | 问题 | 建议 A | 建议 B |
| --- | --- | --- | --- |
| **Q1** | 前端 **服务端** sync secret 正式 env 名？ | **`SYNC_ADMIN_SECRET`**（与 Ink `NEXT_PUBLIC_*` 分离） | 复用 **`CHAT_API_SECRET`**（不新增变量） |
| **Q2** | BFF `/api/admin/sync` 是否保留 **Ink admin Cookie**（`validateAdmin`）入站？ | **保留**（UI 按钮场景） | **仅 Bearer**（维护者 curl / CI） |
| **Q3** | 入站头 **`x-admin-token`**？ | **保留兼容 1 个 minor** + 文档只写 Bearer | **移除**（breaking） |
| **Q4** | **`/api/admin/ingest`** 同 PR 改鉴权？ | **是**（同 `py-service-proxy`） | **否**（仅 sync） |
| **Q5** | W5 README **默认推荐**哪条 curl？ | **路径 A** 直连 `$PY_API_URL` + `$ADMIN_TOKEN` | **路径 B** BFF + `$SYNC_ADMIN_SECRET` |

---

## 4. 冻结后下游（本 Prompt 不写 invoke）

| 项 | 建议 |
| --- | --- |
| **task_slug** | `portfolio-admin-sync-auth-v1` |
| **Open Folder** | `ai-ink-brain` |
| **test_strategy** | `recommended`（Route handler + auth helper 单测可选） |
| **配对后端** | 仅 RUNBOOK §1.3 文案同步（docs-only · 可同 PR 或 follow-up） |
| **10 帽输入** | 冻结后的 `{{SPEC_PATH}}` + 本 Prompt 终轮「已拍板表」 |

---

## 5. §3 调用体（复制到新对话 · 轮 1 起步）

```text
你正在执行 Prompt 00 · Portfolio admin/sync 鉴权对齐（轮 {{ROUND_N}}/5）。

Open Folder = ai-ink-brain
git_branch = {{GIT_BRANCH}}

必读（按顺序）：
1. content/tasks/specs/PROMPT_00_SPEC-refine_portfolio_admin_sync_auth_v1_zh.md（本文件 §2–§3）
2. content/tasks/specs/SPEC-portfolio_admin_sync_auth_v1_zh.md
3. content/tasks/specs/投递冲刺_20260609_v1_zh.md §3.3–§3.4
4. app/api/admin/sync/route.ts · lib/py-service-proxy.ts · tools/README-portfolio-content-sync.md
5. ai-ink-brain-api-python/docs/spec/governance/SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md §2.3（只读）

任务：
- 轮 1：输出 §3.1 形状；提问 SPEC §6 Q1–Q5（≤5 条）；**不改 SPEC**（除非人已在上一轮答复）。
- 轮 2+：人答复后更新 SPEC「已拍板」、§3 目标模型、§5 验收；更新修订记录。
- 终轮：提议 freeze_id；列出须同步改的文档路径表（文件 | 改什么）。

禁止：改 app/lib；执行 admin/sync；代填 human_gate；写 invoke。

Judgment（对话末尾）：
- hat_self: pass | pass-with-notes | blocked
```

---

## 6. 修订记录

| 日期 | 摘要 |
| --- | --- |
| 2026-06-01 | v1：配对 SPEC-portfolio_admin_sync_auth draft；Q1–Q5 首轮提问模板 |
| 2026-06-01 | 链出 [`PROMPT_22_review_portfolio_admin_sync_auth_v1_zh.md`](./PROMPT_22_review_portfolio_admin_sync_auth_v1_zh.md)（实现复查） |
