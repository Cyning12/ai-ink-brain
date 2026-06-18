# SPEC · Kimi Code Ops Desk（Issue ChatBI + 看板 · MVP v1）

| 项 | 内容 |
| --- | --- |
| **状态** | `draft`（需求方向已拍板 · 待拆 task） |
| **类型** | 规格真值（`docs/tasks/specs/`） |
| **代号** | **Ops Desk** · `site_mode=ops` |
| **监控仓** | **`MoonshotAI/kimi-code`**（MVP 唯一；未来 **一仓一页**） |
| **test_strategy（建议）** | `required`（同步 job · 指标 API · analysis_job · 鉴权） |
| **关联** | [`PLAN_kimi_code_meta_harness_2x_v1_zh.md`](../../../../docs/harness/guides/PLAN_kimi_code_meta_harness_2x_v1_zh.md) · [`ISSUE_SCAN_kimi_code_open_c2_v1_zh.md`](../../../../docs/harness/guides/ISSUE_SCAN_kimi_code_open_c2_v1_zh.md) · [`STRATEGY_agent_runtime_ce_v1_zh.md`](../../../../docs/harness/guides/STRATEGY_agent_runtime_ce_v1_zh.md) |
| **10-spec invoke** | [`ops-desk-kimi-code-spec-refine`](../../../../docs/harness/invokes/by-task/ops-desk-kimi-code-spec-refine/README.md) · [`PROMPT_START_10_spec_rethink_v1.md`](../../../../docs/harness/invokes/by-task/ops-desk-kimi-code-spec-refine/PROMPT_START_10_spec_rethink_v1.md) |

---

## §0 完成态一句话

在 **不新建前端仓** 前提下，Ink 前端新增 **`site_mode=ops`**：针对 **MoonshotAI/kimi-code** 的 **只读** Issue/PR/CI 看板 + **单仓 ChatBI**（后端 **Job 化** 深析）；数据 **日同步**（GitHub Actions）+ **维护者手动触发**；融合 **ISSUE_SCAN 策略层** 与 **meta 架构图谱（graph.json 只读）**；鉴权 **M0 邀请制秘钥**；**不**改上游代码/分支；**不**引入 Neo4j。

---

## §1 背景与竞品定位（三方深研摘要）

### 1.1 不做什么（排除误选）

| 产品 | 结论 |
| --- | --- |
| **Octoboard** | 营销分析 · **与 GitHub 工程无关** · 不参考 |
| **GitPulse** | Issue **推荐/发现** · 非团队 PR/Issue 看板 · 不照搬 |
| **Plane / ZenHub / Swarmia** | 成熟 PM/效能平台 · **过重** · 仅借鉴指标与页面结构 |
| **Metabase 自托管 BI** | MVP **不做** · 直接用 Next + 图表库 |

### 1.2 差异化（本产品）

| 维度 | 通用 GitHub Dashboard | **Ops Desk（本 SPEC）** |
| --- | --- | --- |
| 范围 | 多仓 / 通用 | **单仓 kimi-code** · 未来一仓一页 |
| 策略层 | 无 | **ISSUE_SCAN**（P0/P1/占坑/backlog） |
| 架构 | 无 | **meta `graph.json`** 模块/flow 关联 |
| 过程轨 | 无 | Harness/HGM **只读** 展示（可选 P2） |
| 对话 | 泛 NL→SQL | **Phase 1 预置模板 + Job 深析** · 引用 Issue#/PR#/节点 |
| 写操作 | 部分产品可改 | **只读** · 网页 **不 commit** |

### 1.3 可借鉴（结构 · 非照搬）

| 来源 | 借鉴 |
| --- | --- |
| **ZenHub / Swarmia** | PR Cycle Time · Review Time · Throughput 类指标 |
| **GitRevio** | PR/Issue/CI 多源面板思路 |
| **三方建议** | 定时同步为主 · NL→API 优先于 NL→SQL · MVP 严控范围 |
| **自建路径** | GitHub API → Supabase → Next 可视化（与现有栈一致） |

---

## §2 已拍板决策

| # | 决策 |
| --- | --- |
| 1 | 仅 **kimi-code**；扩展时 **一仓一页 · Chat 不跨仓** |
| 2 | 部署 **Vercel + Supabase + GitHub Actions 同步** · **不** MVP 迁国内 VPS |
| 3 | 前端 **Ink 内 ops 模块** · 博客 **deprecated 隐藏** · 内容不删 |
| 4 | 鉴权 **M0 邀请制秘钥** · 无公网注册 |
| 5 | 同步 **默认 24h** · **手动触发** 更新（GHA `workflow_dispatch`） |
| 6 | **analysis_job 全在后端 Python** · 前端轮询/展示 |
| 7 | 图谱 **graph.json → Supabase** · **不用 Neo4j**（INK-P7 deferred） |
| 8 | 国内 Demo：页面略慢可接受 · **LLM 断联**须 Job + 缓存 + 重试 |

---

## §3 非范围

- 多仓同一页对比 · 实时 Webhook 驱动看板（MVP）
- NL→SQL 自由生成（Phase 2 以后）
- 网页改 Git / 改 feature 分支 / 自动 PR
- 服务器部署完整 **kimi-code** / **kimi-code-meta** 源码
- Neo4j · Metabase · 替代 ZenHub/Linear 的全功能 PM
- Hermes **无人值守自动 merge**（仅草稿区 P2+）

---

## §4 架构

### 4.1 总览

```text
GitHub Actions (cron 24h + workflow_dispatch)
  → sync script → Supabase (issues / prs / checks / repos / graph_snapshot)

Vercel · ai-ink-brain (site_mode=ops)
  → /ops/kimi-code/*  看板 UI
  → BFF 触发/查询 job · 鉴权

ai-ink-brain-api-python
  → analysis_job 执行（ReAct / 工具 / 预置模板）
  → 只读查 Supabase · 可选 graph_query 逻辑

本地（非服务器）
  kimi-code-meta · Harness · Hermes → 过程真值 · 不暴露写接口
```

### 4.2 同步策略（相对三方「每小时」的调整）

| 项 | 本 SPEC |
| --- | --- |
| 默认定时 | **每 24h** 增量/全量（GHA cron） |
| 手动刷新 | Ops 页 **「同步数据」**（maintainer）→ `workflow_dispatch` |
| Webhook | **MVP 不做** · P2 可选「新 PR 通知」非看板主路径 |
| 兜底 | 每次 sync 记录 `sync_runs` · UI 显示 **数据截至** |
| API 限流 | 只拉 **kimi-code** 单仓 · 必要字段 · `since` 增量 |

### 4.3 对话与 LLM 断联（Job 在后端）

| 模式 | 行为 |
| --- | --- |
| **快问** | 直查 DB / 预置模板 · 无 LLM 或短 LLM |
| **深析** | `POST /api/.../analysis-jobs` → 后端跑完 → 写 `analysis_jobs` + `analysis_job_steps` |
| **前端** | 轮询 job 状态 · 展示 partial · **断线可刷新续看** |
| **重试** | 同 `job_id` 或 `retry_token` 幂等重跑 |
| **Demo 缓存** | 5–10 个高频问题预计算答案（面试保底） |
| **SSE** | 可选仅推 **进度** · **不**把唯一结论绑在一条 SSE 上 |

**Job 状态机**：`queued` → `running` → `done` | `failed` | `partial`（保留 partial_content + last_step）

### 4.4 对话 Phase 1（采纳三方建议 · 不做 NL→SQL）

| 用户意图示例 | 实现 |
| --- | --- |
| 「#437 适合我做吗」 | 模板 + Issue 行 + ISSUE_SCAN 行 |
| 「PR 周期时间趋势」 | 预置 API `/metrics/cycle-time` |
| 「Read 工具相关 open issue」 | graph 模块 → issue 标签/标题 filter |
| 开放复杂问 | **analysis_job** + 工具（只读） |

Phase 2+：受限 NL→SQL（单表/视图）· 须 SQL 审计。

### 4.5 图谱层（无 Neo4j）

```text
cyning/meta 分支 graph.json（只读 raw/sync）
  → ops_graph_nodes / ops_graph_edges（或 JSONB 快照）
  → 查询：SQL 邻接 或 复用 graph_query 语义（Python）
  → UI：模块×Issue 矩阵 · 节点详情 · **只读**
  → 网页「建议改节点」→ 导出 task 草稿 Markdown · **不** commit
```

**Neo4j 触发条件（仅记录 · 不实施）**：单仓节点 **>1000** 或 INK-P7 立项。

---

## §5 鉴权（M0）

| 角色 | 能力 |
| --- | --- |
| **viewer** | 看板 + Chat（邀请秘钥） |
| **maintainer** | + 手动触发 sync · 看 sync 日志 · 导出草稿 |

- 环境变量：`OPS_DESK_SECRET`（或复用 portfolio tier 体系扩展）
- **不做**：公网注册 · 多租户
- **P1 可选**：GitHub OAuth **只读**（绑定可见 fork/upstream）

---

## §6 前端（Ink · site_mode=ops）

### 6.1 路由（MVP）

| # | 路径 | 内容 | 优先级 |
| --- | --- | --- | --- |
| 1 | `/ops/kimi-code` | 总览：3 指标 + 30 天趋势 + scan 版本 + 数据截至 | P0 |
| 2 | `/ops/kimi-code/issues` | Issue 列表 · 筛选 · ISSUE_SCAN 标签 | P0 |
| 3 | `/ops/kimi-code/pulls` | PR 列表 · CI/review 状态 | P0 |
| 4 | `/ops/kimi-code/chat` | ChatBI · Job 列表 · 思考链路 v2（证据→推理→建议） | P0 |
| 5 | `/ops/kimi-code/graph` | 模块×Issue · graph 节点只读 | P1 |

### 6.2 核心指标（三方建议 · 单仓版）

| 指标 | 说明 |
| --- | --- |
| **PR Cycle Time** | 创建 → merge 中位数 |
| **PR Review Time** | 创建 → 首次 review 中位数 |
| **Issue Throughput** | 周/月 closed 数 |
| **可选** | Open Issue Aging（>7/14/30 天） |

### 6.3 博客 / Portfolio 处理

| 项 | 做法 |
| --- | --- |
| 默认入口 | `NEXT_PUBLIC_SITE_MODE=ops` → `/ops/kimi-code` |
| `/blog` 等 | **导航隐藏** · 路由保留或 302 · **不删** `content/` |
| unified-chat 组件 | **复用** trace/SSE 壳 · 默认上下文改为 Ops |

---

## §7 数据层（Supabase · 草案）

| 表 | 用途 |
| --- | --- |
| `ops_repos` | 固定 `MoonshotAI/kimi-code` |
| `ops_issues` · `ops_pull_requests` | GitHub 同步事实 |
| `ops_sync_runs` | 同步批次 · 时间戳 · 状态 |
| `ops_scan_snapshots` | ISSUE_SCAN 版本化摘要 |
| `ops_graph_snapshots` | graph.json 快照 |
| `ops_analysis_jobs` · `ops_analysis_job_steps` | 后端 Job |
| `ops_demo_answers` | 高频问题缓存 |
| `ops_chat_sessions` · `ops_chat_messages` | 会话（可选与 job 合并） |

索引：`repo_id` · `state` · `created_at` · `updated_at`。

---

## §8 后端 API（Python · 草案）

| 端点 | 说明 |
| --- | --- |
| `GET /ops/metrics/{cycle-time,review-time,throughput}` | 预置指标 |
| `GET /ops/issues` · `GET /ops/pulls` | 列表筛选 |
| `POST /ops/analysis-jobs` | 创建深析 Job |
| `GET /ops/analysis-jobs/{id}` | 状态 + partial + result |
| `POST /ops/analysis-jobs/{id}/retry` | 幂等重试 |
| `GET /ops/graph/module-issues` | 图谱×Issue 矩阵 |
| `POST /ops/sync/trigger` | maintainer → 触发 GHA（或内部 webhook secret） |

同步脚本：可放 **api-python** 或 **独立 GHA workflow** 调 Python 脚本（30 定稿）。

---

## §9 Harness / HGM 映射（展示 · P1/P2）

| 支柱 | Ops Desk 体现 |
| --- | --- |
| Inform | 看板事实 + graph 切片 + scan |
| Constrain | 只读 API · 鉴权 · 无写 Git |
| Verify | CI 状态 · sync 成功 · job `done` + 引用 |
| Orchestrate | analysis_job 步骤条 · 可选 HGM 事件只读时间线 |

---

## §10 MVP 分期

| Phase | 交付 | 约 |
| --- | --- | --- |
| **P0** | GHA sync + 3 表 + 总览/Issue/PR 页 + 秘钥 | 2 周 |
| **P1** | analysis_job + Chat 页 + 3 指标 API + Demo 缓存 | 2 周 |
| **P2** | graph Tab · scan  ingest · 思考链路 v2 · 手动 sync 按钮 | 1–2 周 |
| **P3** | Hermes 草稿区只读展示 · GitHub OAuth 可选 | C+E 后 |

---

## §11 风险与缓解（合并三方清单）

| 风险 | 级 | 缓解 |
| --- | --- | --- |
| GitHub API 限流 | 高 | 单仓 · 24h · 增量 · 手动补拉 |
| MVP 范围膨胀 | 高 | 本 SPEC 非范围 · 5 页封顶 |
| LLM 断联 | 高 | Job 化 + 缓存 + retry |
| 国内 Vercel 慢 | 低 | Demo 预加载 · P2 CDN |
| Supabase 性能 | 中 | 索引 · 单仓数据量可控 |
| 图谱同步 drift | 中 | 快照版本号 · 与 sync_run 关联 |

---

## §12 部署说明（回应「国内 VPS」）

| 问题 | 结论 |
| --- | --- |
| MVP 是否迁国内机 | **否** |
| 同步跑哪 | **GitHub Actions**（国内访问 GitHub API 最稳） |
| Supabase | 继续用 · 前端/后端跨境访问可接受 |
| 全迁国内工程量 | **2–4 周+** · 不纳入 MVP |

---

## §13 待拆 task（R1 细化版）

### P0 有序 task 链（2 周最小可 Demo 切片）

| 序 | slug | 仓 | 依赖 | 验收 | test_strategy | freeze_id |
| --- | --- | --- | --- | --- | --- | --- |
| P0-1 | `ops-desk-p0-supabase-schema` | `ai-ink-brain-api-python` | — | `ops_repos/issues/pull_requests/sync_runs` 四表及索引 DDL 落地；pytest 可建表/删表 | required | `OPS-DESK-KIMI-CODE-P0-SUPABASE-SCHEMA` |
| P0-2 | `ops-desk-p0-github-sync` | `ai-ink-brain-api-python` + GHA | P0-1 | GHA workflow `ops_sync_kimi_code.yml`；cron 24h + workflow_dispatch；单仓增量 Issue/PR；`sync_runs` 写入状态 | required | `OPS-DESK-KIMI-CODE-P0-GITHUB-SYNC` |
| P0-3 | `ops-desk-p0-ops-site-mode` | `ai-ink-brain` | — | `NEXT_PUBLIC_SITE_MODE=ops` 根路径 302 → `/ops/kimi-code`；导航隐藏博客；M0 秘钥中间件 | required | `OPS-DESK-KIMI-CODE-P0-OPS-SITE-MODE` |
| P0-4 | `ops-desk-p0-overview-page` | `ai-ink-brain` | P0-2, P0-3 | `/ops/kimi-code` 展示 3 指标 + 30 天趋势 + 数据截至 + sync 状态 | recommended | `OPS-DESK-KIMI-CODE-P0-OVERVIEW-PAGE` |
| P0-5 | `ops-desk-p0-issues-page` | `ai-ink-brain` | P0-2, P0-3 | `/ops/kimi-code/issues` 列表 + 筛选 + 分页；展示 ISSUE_SCAN 标签 | recommended | `OPS-DESK-KIMI-CODE-P0-ISSUES-PAGE` |
| P0-6 | `ops-desk-p0-pulls-page` | `ai-ink-brain` | P0-2, P0-3 | `/ops/kimi-code/pulls` 列表 + state/CI/review 状态 + 分页 | recommended | `OPS-DESK-KIMI-CODE-P0-PULLS-PAGE` |

### P1 / P2 task 链（概要）

| 阶段 | slug | 仓 | 说明 | 依赖 |
| --- | --- | --- | --- | --- |
| P1-1 | `ops-desk-p1-metrics-api` | `ai-ink-brain-api-python` | `GET /ops/metrics/{cycle-time,review-time,throughput}` + `/ops/issues` + `/ops/pulls` | P0-2 |
| P1-2 | `ops-desk-p1-analysis-job` | `ai-ink-brain-api-python` | `ops_analysis_jobs/steps` 表 + 状态机 + 幂等 retry | P1-1 |
| P1-3 | `ops-desk-p1-chat-ui` | `ai-ink-brain` | `/ops/kimi-code/chat` + 轮询 job + 思考链路 v1 壳 | P1-2 |
| P1-4 | `ops-desk-p1-demo-cache` | `ai-ink-brain-api-python` | `ops_demo_answers` 表 + 5–10 题预计算 | P1-2 |
| P2-1 | `ops-desk-p2-graph-tab` | 双仓 | graph.json 快照 ingest + `/ops/kimi-code/graph` 矩阵 | P1-1, Track C graph.json |
| P2-2 | `ops-desk-p2-scan-ingest` | `ai-ink-brain-api-python` | ISSUE_SCAN markdown → `ops_scan_snapshots` | P0-2 |
| P2-3 | `ops-desk-p2-manual-sync` | `ai-ink-brain` + GHA | maintainer 按钮触发 `workflow_dispatch`；UI 显示 sync 日志 | P0-2 |
| P2-4 | `ops-desk-p2-thinking-chain-v2` | `ai-ink-brain` | 证据→推理→建议字段 + UI 展示 | P1-3 |

---

## §15 思考轮（10-spec 回填 · 自主 N 轮 · 系列落盘）

> **00 只预置空槽**；**10-spec** 专责回填。每轮完整思考见 invoke [`rounds/`](../../../../docs/harness/invokes/by-task/ops-desk-kimi-code-spec-refine/rounds/)。裁量见 [`FRAGMENT_rethink_backfill_spec_v1_zh.md`](../../../../docs/harness/FRAGMENT_rethink_backfill_spec_v1_zh.md)。阻塞见 [`BLOCKERS.md`](../../../../docs/harness/invokes/by-task/ops-desk-kimi-code-spec-refine/BLOCKERS.md)。

### R0 · 读入与约束

- 复述 SPEC §0 完成态：Ink `site_mode=ops` · 单仓 MoonshotAI/kimi-code · 只读 Issue/PR/CI 看板 + ChatBI · 日同步 + 手动触发 · ISSUE_SCAN + graph.json 只读 · M0 秘钥 · 不改上游 · 无 Neo4j。
- 复述 SPEC §3 非范围：多仓对比、Webhook 实时看板、NL→SQL 自由生成、网页写 Git、完整源码部署、Neo4j/Metabase、Hermes 自动 merge。
- 并行边界：Track C（`kimi-code-meta` @2.0.1 dogfood）与 Ops Desk 10-spec **正交并行**；Ops Desk 只细化规格，不替代 C task，不等 C 完成。
- Ink Inform YAML 边界：前端 Inform 闭环已随 G1.1 完成；meta YAML 迁移非 C 轨优先项；Ops Desk P2 graph Tab 仅消费 `cyning/meta` 产出的 `graph.json`。
- 只读依赖充足：SPEC、PLAN、STRATEGY、ISSUE_SCAN v1.5.1、两份 PROJECT_CONFIG、FRAGMENT 已覆盖架构/分期/依赖/env/目录；缺口均为 R2–R4 要写入 `BLOCKERS.md` 的未决项，不属文档缺口。
- 默认 spine 采用 R0–R7，不合并、不跳过、不扩展 R8+。

### R1 · P0 task 拆分

- P0 拆为 6 个有序 task：schema → GHA sync → site_mode → overview → issues → pulls。
- P0 最小可 Demo 切片 = 上述 6 个 task；2 周内可在 `site_mode=ops` 下用 M0 秘钥登录后查看 kimi-code 近 30 天 Issue/PR 与核心指标。
- P1 拆 4 task：metrics-api → analysis-job → chat-ui → demo-cache。
- P2 拆 4 task：graph-tab → scan-ingest → manual-sync → thinking-chain-v2。
- freeze_id 统一前缀 `OPS-DESK-KIMI-CODE-{PHASE}-{SLUG}`；test_strategy sync/schema/auth 为 required，纯 UI 为 recommended，Demo 缓存为 required。
- §13 示意表已替换为完整 P0 详表 + P1/P2 概要表。

### R2 · GHA sync + Supabase schema

- Supabase 采用 `public` schema + `ops_*` 表前缀（不新建独立 schema）。
- P0 落地四表：`ops_repos`、`ops_issues`、`ops_pull_requests`、`ops_sync_runs`；其余表在 P1/P2 DDL 中声明。
- GHA workflow 默认候选 `ai-ink-brain-api-python/.github/workflows/ops_sync_kimi_code.yml`（待维护者确认，已入 BLOCKERS B1）。
- 同步脚本用 Python；首次全量，后续基于 `sync_runs.cursor` 增量拉取；认证后 5000 req/h 足够单仓 24h 同步。
- 重试策略：403/502/504 指数退避最多 5 次；401/422 立即失败写入 `sync_runs`。
- upsert 语义：`(owner, name, number)` 唯一键，`ON CONFLICT DO UPDATE`；不物理删除。
- `ops_sync_runs` 字段：`started_at/finished_at/status/cursor/records_issue/records_pr/error_message/trigger`。
- P0 四表 DDL 草案已补充进 §7。

### R3 · analysis_job 状态机 + API

- 状态机：`queued` → `running` → `done` | `failed` | `partial`；`partial` 保留 `partial_result` + `last_step`。
- 新建独立表 `ops_analysis_jobs` + `ops_analysis_job_steps`（BLOCKERS B4 默认 A，不复用 RAG 表）。
- 幂等重试：创建时返回 `retry_token`；`POST /ops/analysis-jobs/{id}/retry` 携带 token 后重置为 `queued`。
- BFF（Next）只做鉴权 + 转发；Python 负责 LLM 执行、写库、错误捕获。
- 前端轮询：0/2/4/8/16/30/30s…，上限 30s，总超时 10 分钟；`partial` 仍继续轮询。
- 步骤模型：每步含 `step_name/evidence/reasoning/output/status`，为 thinking chain v2 留字段。
- 错误码：400/401/404/409/429/500 结构化返回。
- §7 已补充 DDL；§8 已替换端点 JSON 契约。

### R4 · site_mode=ops + 鉴权 + env

- `NEXT_PUBLIC_SITE_MODE=ops` 为总开关：未设/非法回退 `development`；设为 `ops` 时 `/` 302 → `/ops/kimi-code`，主导航隐藏 blog/portfolio。
- Ops 路由统一在 `app/ops/kimi-code/`；博客路由保留但导航隐藏，不删 `content/`。
- M0 双秘钥：`OPS_DESK_SECRET`（viewer）+ 可选 `OPS_DESK_MAINTAINER_SECRET`（maintainer；未设时 viewer 也具备 maintainer 能力）。
- 鉴权：Next `middleware.ts` 校验 `/ops/*` cookie/Bearer；BFF `/api/ops/*` 二次校验；未登录 → `/ops/login`。
- 登录页 `/ops/login` 设 HttpOnly `ops_desk_token`；支持 URL `?token=xxx` 一次性格式用于 Demo。
- maintainer 额外能力：手动触发 sync、看 sync 日志、导出草稿。
- 新增 env：`OPS_DESK_SECRET`、`OPS_DESK_MAINTAINER_SECRET`、`OPS_DESK_GITHUB_TOKEN`、`OPS_DESK_SESSION_TTL_HOURS`、`OPS_DESK_DEMO_TOKEN`；命名冲突见 BLOCKERS B3。

### R5 · Track C 依赖与 graph ingest

- graph.json 来源：`kimi-code-meta` 仓库 `cyning/meta` 分支，由 `pnpm tech-graph:graph-export` 生成；Ops Desk 只读消费。
- 快照版本：`ops_graph_snapshots` 记录 `source_branch/source_commit/manifest_version/payload`。
- sync_run 关联：新增 `ops_sync_run_artifacts` 表，将每次 sync_run 与最新的 `graph_snapshot_id`、`scan_snapshot_id` 关联。
- P0/P1 不含 graph Tab；P2 若 Track C 未完成可用 fixtures/sample graph.json 降级开发。
- ISSUE_SCAN ingest 默认 A：GHA sync 同批 checkout Projects 仓，解析 `docs/harness/guides/issues/` markdown 写入 `ops_scan_snapshots`。
- scan 快照字段：`scan_version/total_open/p0_items/p1_items/p2_items/deferred_items/raw_markdown_url/parsed_summary`。 



### R6 · Demo 缓存 + Chat 模板

- Demo 问题 8 题（D1–D8），覆盖 metrics/issue/PR/graph/scan/contribution；metrics 类 sync 后预计算，单 issue/PR 深析首次后缓存 24h，列表查询不缓存。
- Phase 1 意图矩阵 7 类：`metrics_trend`、`issue_list`、`pr_list`、`issue_contribution`、`graph_module`、`scan_status`、`fallback`；对应 API/Job + 模板 ID。
- 不做 NL→SQL；fallback 走 `POST /ops/analysis-jobs`。
- `ops_demo_answers` 表含 `demo_id/query_template/params/answer_json/source_sync_run_id/expires_at`；TTL 默认 `sync_run + 25h`。
- thinking chain v2 最小字段：`evidence`、`reasoning`、`suggestion`、`confidence`、`citations`；v1 可先展示 `reasoning + suggestion` 文本。
- §4.4 / §6.1 / §7 已补充对应内容。

### R7 · 签收就绪 · 阻塞 · 下一棒

- `spec_ready: yes`（条件性）：R0–R6 已覆盖 P0–P2 task 链、DDL、API、auth、env、Track C 依赖、Demo/Chat 模板。
- 5 个 BLOCKERS 全部判定为「可延后」，均有推荐默认值，不影响 P0 开工。
- Residual risks：GitHub API 限流、MVP 范围膨胀、LLM 断联、国内 Vercel 慢、Track C graph.json 不稳定。
- 下一棒：`human-sign-spec`（HG-SPEC-SIGNOFF）→ 00 启动 `ops-desk-p0-supabase-schema`。
- R7 §3.4 已提供 00 可复制 Prompt 提纲。

### 思考轮控制

| 字段 | 值 |
| --- | --- |
| `actual_last_round` | `R7` |
| `early_stop` | `no` |
| `early_stop_reason` | — |
| `residual_risks` | GitHub API 限流；MVP 范围膨胀；LLM 断联；国内 Vercel 慢；Track C graph.json 不稳定 |
| `round_extension_note` | 默认 spine R0–R7；未扩展 R8+ |
| `series_docs_path` | `docs/harness/invokes/by-task/ops-desk-kimi-code-spec-refine/rounds/` |

---

## §14 修订记录

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| v1.1 | 2026-06-18 | §15 思考轮空槽 · 链 10-spec invoke（与 Track C 并行细化） |
| v1.0 | 2026-06-18 | 初稿 · 吸收三方深研 + 维护者拍板 · Job 全后端 · 24h sync · 无 Neo4j |
