# Prompt 00 · SPEC 细化（阅读 → 提问 → 解决 · ≤5 轮）

> **用途**：在 **冻结 `freeze_id` / 创建 `content/tasks/active/task_*.md` 之前**，对 [`SPEC-portfolio_demo_site_v1_zh.md`](./SPEC-portfolio_demo_site_v1_zh.md) 做多轮 **人-Agent 对齐**；每轮固定三步：**读 → 问 → 改 SPEC**。  
> **不是** Harness 链内 **00 总调度帽**（见工作区 [`docs/harness/prompts/00-orchestrator.md`](../../../../docs/harness/prompts/00-orchestrator.md)）；**不**替代 **10 需求帽** 或 **20 规格短评**。  
> **SDD 映射**：消化 SPEC 文末 **「SPEC 待确认清单」** + §8 风险项；精神见配对后端 [`SPEC-SDD-Drafting-Intent-Rounds-v1_zh.md`](../../../../ai-ink-brain-api-python/docs/spec/SPEC-SDD-Drafting-Intent-Rounds-v1_zh.md) §4；轮次上限 **5**（含首轮阅读）。

---

## 1. 占位符

| 占位符 | 含义 | 本 Epic 默认值 |
| --- | --- | --- |
| `{{SPEC_PATH}}` | 目标 SPEC | `content/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md` |
| `{{BACKEND_SPEC}}` | 配对后端 SPEC | `ai-ink-brain-api-python/docs/spec/governance/SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md` |
| `{{BACKEND_PROMPT_00}}` | 配对后端细化 Prompt | `ai-ink-brain-api-python/docs/spec/governance/PROMPT_00_SPEC-refine_Portfolio-RAG-Demo-v1_zh.md` |
| `{{PLANNING_DOC}}` | 五问真值（若可读） | `Projects/docs/planning/投递冲刺_20260609_v1_zh.md` §2 |
| `{{GIT_BRANCH}}` | 工作分支（建议） | `task/portfolio-demo-site-spec-v1` |
| `{{ROUND_N}}` | 当前轮次 | `1`～`5` |

---

## 2. 角色与边界

### 2.1 你是谁

你是 **SPEC 细化 Agent（Prompt 00）**：把 `draft` SPEC 中的 **「待确认」**、**歧义**、**不可测验收** 收敛为 **可冻结** 条文；**只改** `{{SPEC_PATH}}`（及本 Prompt 可选 `NOTES_*`）；**不写** `app/`、`components/`、`lib/` 实现。

### 2.2 允许

| 动作 | 说明 |
| --- | --- |
| 只读 | `{{SPEC_PATH}}`、`docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`、`AGENTS.md` |
| 只读 | `app/_components/site-nav.tsx`、`home-modules.tsx`、`lib/hooks/useAdminSession.ts` |
| 只读 | `app/api/auth/unlock/`、`app/api/auth/session/`、`components/unified-chat/`、`lib/content/mdx-posts.ts` |
| 只读 | `{{BACKEND_SPEC}}`、`api/ingest_pipeline.py`（`CONTENT_ROOT` / category 语义） |
| 只读 | `{{PLANNING_DOC}}` §2（存在则对齐 Q1～Q5 chip 逐字文案） |
| 修改 | `{{SPEC_PATH}}` 正文、**「SPEC 待确认清单」**、**修订记录**、§6.4 五问表 |

### 2.3 禁止

- 创建 / 修改 `content/tasks/active/task_*.md`
- 修改 `app/`、`components/`、`lib/`、`content/harness/invokes/`
- 写 22/30/40/50 帽 Prompt 或声称「已实现」
- 执行生产 deploy、写入真实访客秘钥、调用 `POST /api/py/admin/sync`
- **自问自答** 拍板：凡需业务裁决的项 **必须** 等人回复后再写入 SPEC「已拍板」
- 超过 **5 轮** 仍有大块 `pending` → **停工**，输出 **阻塞清单** + 建议人会议

---

## 3. 五轮协议（阅读 → 提问 → 解决）

```text
轮 1：通读 SPEC + 必读依赖 → 输出「缺口表」+ 提问（≤5 条，含 SPEC 文末待确认清单）
轮 2～5：人逐条答复 → Agent 改 SPEC → 若仍有 pending，再提问（每轮 ≤5 条）
终轮：待确认清单为空或全部标 deferred → 提议 freeze_id + 状态 draft→active
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
| 1 | `{{SPEC_PATH}}` 全文 | 主真值 + 文末待确认清单 |
| 2 | `docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` §C env、§E 目录 | 核对 §2 差距与 §4.3 配置面 |
| 3 | `app/_components/site-nav.tsx`、`home-modules.tsx` | 核对 §2.2 现状 |
| 4 | `lib/hooks/useAdminSession.ts`、`app/api/auth/unlock/route.ts`、`session/route.ts` | 核对 §2.3 / §4.3 |
| 5 | `components/unified-chat/UnifiedChatPageClient.tsx`（解锁区、chip、debug） | 核对 §2.5 / §4.4 |
| 6 | `lib/content/mdx-posts.ts`、`content/` 顶层目录 | 核对 §2.4 / §5 |
| 7 | `{{BACKEND_SPEC}}`（**若存在**） | visitor 角色、ingest category、五问与前端对齐 |
| 8 | `{{PLANNING_DOC}}` §2（**若可读**） | Q1～Q5 逐字 chip |

### 3.3 首轮种子提问（须与 SPEC 文末清单合并去重）

> 首轮提问 **总数仍 ≤5**：从下列 **按阻塞优先级** 选取；其余记入「次轮候选」。

| # | 种子问题 | 建议选项 | 关联 SPEC |
| --- | --- | --- | --- |
| S1 | **五问 chip 逐字文案** | 粘贴 `{{PLANNING_DOC}}` §2 全文入 §6.4 / 延期至联调 task | 待确认 #1 |
| S2 | **简历路由** | 新建 `/resume` / 改造 `/about` 并 308 | 待确认 #2 · §4.2 |
| S3 | **证据页形态** | 独立 `/evidence` / 仅 Unified chip + 方法论内锚点 | 待确认 #3 |
| S4 | **演示鉴权 UI** | 移除 ChatBI DB 明文解锁，仅 portfolio 秘钥 + 内部 admin / 保留 ChatBI 作维护后门 | 待确认 #4 · §4.3 |
| S5 | **`visitor-admin` debug** | 对照表：Timeline+ExecutionTrace / 再加 `?debug=1` 全量 / 与 visitor 相同 | 待确认 #5 · §4.4 |
| S6 | **`freeze_id` 日期** | `PORTFOLIO-DEMO-SITE@2026-06-09` / 冻结当日 | 元信息表 |
| S7 | **portfolio 下 `/unified-chat` 导航** | 常显（无 session 仅页内锁）/ 仍须 session 才显示 nav 项 | §4.1 |
| S8 | **秘钥 env 命名** | 双变量 `PORTFOLIO_VISITOR_*` / JSON 映射表 | §4.3 |
| S9 | **与后端对齐** | 本轮读 `{{BACKEND_SPEC}}` 冻结 visitor TTL、category 过滤 / 先前端单边冻结 | §9 |

### 3.4 「解决」写入 SPEC 的规则

| 人答复类型 | Agent 动作 |
| --- | --- |
| 明确二选一 | 改对应 § 为 **已拍板**；待确认清单标 `resolved` |
| 「待确认 / 稍后」 | 保留 `pending`；**不得** 伪造已拍板 |
| 「延期到 task」 | 标 `deferred` + §7 对应 Wn 注明字段 |
| 与 SPEC §1 已拍板表冲突 | **停工** 列矛盾，等人裁决 |
| 与 `{{BACKEND_SPEC}}` 冲突 | 记入 §8 + 提问后端维护者；**不** 单方改后端 SPEC |

### 3.5 冻结条件（建议终轮输出）

- [ ] 「SPEC 待确认清单」**无** `pending`（允许 `deferred` 且 §7 已指向）
- [ ] §6.4 五问表为 **可粘贴问句**（非 `[待确认：…]` 占位）
- [ ] §4.3 / §4.4 无未决「待确认」占位（或已 `deferred`）
- [ ] §4.2 路由路径已定（resume / evidence）
- [ ] `freeze_id` 已定（建议 `PORTFOLIO-DEMO-SITE@2026-06-09`）
- [ ] 元信息 **状态** → `active`（人明示「仍 draft」则保持）
- [ ] 与 `{{BACKEND_SPEC}}` **无未决** 交叉矛盾（或 §8 已记录 accepted 差异）

**冻结后下一棒（不在本 Prompt 内）**：人确认 → **20 短评**（可选）→ **10 帽** 出 task 草案（W1～W6）→ **22** 或 **30**。  
**本 Epic 已拍板**：跳过 **20**，由 **§4.1 移交 Prompt** 直接进入 **10 帽**（路径 B · 人承担 20 闸）。

---

## 4. 可复制 Prompt 正文（§3 · SPEC 细化 · draft 阶段）

> SPEC 已 **`active`** 时 **勿** 再贴本节；改用 **§4.1**。

```text
## 角色

你是 **SPEC 细化 Agent（Prompt 00）**，严格遵循：
- content/tasks/specs/PROMPT_00_SPEC-refine_portfolio_demo_site_v1_zh.md
- ai-ink-brain-api-python/docs/spec/SPEC-SDD-Drafting-Intent-Rounds-v1_zh.md §4（待确认清单）

Open Folder = ai-ink-brain
git_branch = task/portfolio-demo-site-spec-v1

## 目标 SPEC

content/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md

## 当前轮次

第 {{ROUND_N}} / 5 轮

## 上轮人答复（轮 1 留空）

（粘贴人对上一轮「本轮提问」的逐条答复；无则写「首轮启动」）

## 你必须完成

1. 按 PROMPT §3.2 顺序 **阅读**（轮 1 全读；轮 2+ 仅读变更相关节 + 人答复涉及路径）。
2. 输出 **§3.1 固定形状**（提问 ≤5 条；若人已答复上一轮，**先改 SPEC** 再提新问）。
3. 禁止：改 app/components/lib、创建 task、写 invoke、执行 admin/sync、代人人拍板。
4. 若待确认清单已全部 resolved/deferred 且 §6.4 问句齐全 → 提议 **freeze_id** 与状态 **active**。
5. 若已达第 5 轮仍有 pending → **停工** + 阻塞清单。

## 配对只读

- ai-ink-brain-api-python/docs/spec/governance/SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md（若存在）
- ai-ink-brain-api-python/docs/spec/governance/PROMPT_00_SPEC-refine_Portfolio-RAG-Demo-v1_zh.md（后端同步细化时）
- Projects/docs/planning/投递冲刺_20260609_v1_zh.md §2（若可读）

## 本回合交付

- 更新后的 SPEC 路径 + diff 摘要（按节）
- §3.1 形状全文（含提问表）
- 若冻结：建议 freeze_id 一行 + 「建议下一棒：10 帽 → task_portfolio_site_mode_nav_v1 等 §7 工作包」
```

---

## 4.1 可复制 Prompt 正文（§3 · SPEC 已冻结 · 00 移交 10 帽 · 跳过 20）

```text
## 角色

你是 **Harness 总调度 / SPEC 收口 Agent（00 移交棒）**，严格遵循：
- content/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md（**active** · 只读真值）
- content/tasks/specs/投递冲刺_20260609_v1_zh.md §2（五问 chip 真值）
- ai-ink-brain-api-python/docs/spec/governance/SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md（**active** · 交叉只读）
- 工作区 docs/harness/prompts/10-requirements.md
- 工作区 docs/harness/prompts/00-orchestrator.md（Handoff 形状）
- ai-ink-brain/content/tasks/templates/TASK_TEMPLATE.md

Open Folder = ai-ink-brain
git_branch = task/portfolio-demo-site-v1（建议；实施 task 可再分子分支）

## 前置状态（已拍板 · 勿重开 SPEC 细化轮）

- **freeze_id**：`PORTFOLIO-RAG-DEMO@2026-06-01`（与后端同日）
- **Prompt 00 SPEC 细化**：已收口（含 R4-4=A · `tools/gen-portfolio-secrets.sh` 为 W3 必交付）
- **本回合跳过**：**20 规格短评**（人择路径 B · 承担 20 闸）
- **本回合执行**：**10 需求帽** → 产出 **task 草案**（**不** 默认 30 实现）

## 你必须完成

1. **只读** 上述 SPEC §0～§9、§7 工作包 W1～W6；核对与后端 active SPEC 无矛盾（有则列阻塞，不改后端 SPEC）。
2. 按 **10 需求帽** 在 `content/tasks/active/` 创建 **首个** task（建议从 **W1** `task_portfolio_site_mode_nav_v1` 起，或人指定的 Wn）。
3. task 必填：`freeze_id: PORTFOLIO-RAG-DEMO@2026-06-01`、`test_strategy: recommended`、`failure_paths`、引用 SPEC 章节锚点。
4. 文首 Harness 元信息：`semi_auto` / `human_gate` / `audit_profile` 按 TASK_TEMPLATE；**下一棒推荐 A（22）或 B（30）** 两路径全文须出现，默认 **推荐 A**（与 SPEC test_strategy 一致）。
5. **禁止**：改 `app/` `components/` `lib/`；写 invoke（除非 semi_auto 链要求你落盘下一棒 §3）；执行 `POST /api/py/admin/sync`；代填 `human_gate: approved`。
6. 输出 **00 对人类形状**（见 `00-orchestrator.md`）：阶段结论、交付路径、下一棒（10 完成 → 建议 **22** 或人择 **30**）。

## 工作包顺序（SPEC §7 · 供 10 帽拆分 task）

W1 模式导航 → W5 内容同步脚本 → W2 内容页 → W3 访客鉴权（含 **gen-portfolio-secrets.sh**）→ W4 Unified UI → W6 五问联调。

## 本回合交付

- `content/tasks/active/task_*.md` 路径（1 个或多个草案，至少 W1）
- task 与 SPEC §6 验收项的可追溯映射表（≤15 行）
- 若发现 SPEC 缺口：**停工清单**（不回写 SPEC，除非人明示）

## 给 Cursor

`10`、`freeze_id`、`PORTFOLIO-RAG-DEMO@2026-06-01`、`跳过20`、`task_portfolio_site_mode_nav_v1`
```

---

## 5. 会话留盘（可选）

多轮跨会话时，可在本目录追加 **`NOTES_00_SPEC-refine_portfolio_demo_site_round{N}.md`**（**非 Git 必交**）。  
**禁止**把长对话全文写入 SPEC 正文。

---

## 6. 关联引用

| 用途 | 路径 |
| --- | --- |
| 目标 SPEC | [`SPEC-portfolio_demo_site_v1_zh.md`](./SPEC-portfolio_demo_site_v1_zh.md) |
| 后端配对 SPEC | [`SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md`](../../../../ai-ink-brain-api-python/docs/spec/governance/SPEC-Governance-Portfolio-RAG-Demo-v1_zh.md) |
| 后端 Prompt 00 | [`PROMPT_00_SPEC-refine_Portfolio-RAG-Demo-v1_zh.md`](../../../../ai-ink-brain-api-python/docs/spec/governance/PROMPT_00_SPEC-refine_Portfolio-RAG-Demo-v1_zh.md) |
| SDD 三轮 | [`SPEC-SDD-Drafting-Intent-Rounds-v1_zh.md`](../../../../ai-ink-brain-api-python/docs/spec/SPEC-SDD-Drafting-Intent-Rounds-v1_zh.md) |
| 10 需求帽 | 工作区 [`docs/harness/prompts/10-requirements.md`](../../../../docs/harness/prompts/10-requirements.md) |
| 20 规格短评 | 工作区 [`docs/harness/prompts/20-review-spec-task.md`](../../../../docs/harness/prompts/20-review-spec-task.md) |
| specs 索引 | [`README.md`](./README.md) |

---

## 修订记录

| 日期 | 摘要 |
| --- | --- |
| 2026-06-01 | v1：Portfolio Demo Site 前端 SPEC · ≤5 轮读问解 + §4 可复制 Prompt |
| 2026-06-01 | v1.1：§4.1 冻结后移交 10 帽 Prompt（跳过 20） |

---

## 给 Cursor

`Prompt 00`、`SPEC 细化`、`阅读提问解决`、`PORTFOLIO-DEMO-SITE`、`待确认清单`、`freeze_id`、`SPEC-portfolio_demo_site_v1_zh`
