# SPEC — Ink 前端 Harness semi_auto 与后端 parity（v1）

| 项 | 内容 |
| --- | --- |
| **状态** | `draft` |
| **类型** | Harness 规约（`docs/tasks/specs/`） |
| **层级** | L1 · 工程化 / Agent 行为对齐 |
| **freeze_id（建议）** | `HARNESS-FE-PARITY@2026-06-04` |
| **阻塞于** | [`task_frontend_intent_hints_step2_observability_v1.md`](../active/task_frontend_intent_hints_step2_observability_v1.md) **关账后** 再拆 active task |
| **对照真值** | `ai-ink-brain-api-python/docs/harness/README.md` · `.cursor/rules/05-harness-semi-auto.mdc` · `.cursor/rules/06-harness-in-repo.mdc` |
| **前端现状** | `docs/harness/README.md` · `.cursor/rules/05-harness-semi-auto.mdc` · `.cursor/rules/06-harness-content.mdc` |

---

## 0. 结论（是否现在开工）

| 维度 | 判定 |
| --- | --- |
| **是否阻塞当前 Step2 可观测 task** | **否** — 对齐为 **独立后续 task** |
| **是否现在实施** | **否** — 须当前 task **50 + CHECKLIST + HG-REINSPECT 关账** 后再开 |
| **问题性质** | Agent **执行纪律** + 前端 **配置 enforcement 密度** 低于后端，非共享 TEMPLATE 文本不一致 |

**触发证据**：`frontend-intent-hints-step2-observability-v1` 帽 30/40 已实现代码，但 **40 invoke 事后短快照**、**22/50 invoke 缺失**、**对话未贴下一棒 Prompt**（与后端同题 `chatbi_intent_hints_step2_v1` 五帽 invoke 链对比）。

---

## 1. 背景

工作区 `Projects/docs/harness/prompts/` 对前后端 **同一份** `TEMPLATE-*-invoke.md` / `HANDOFF_SEMI_AUTO.md`。后端 Agent 较少遗漏 invoke，因本仓 **多层重复约束 + 机器门禁 + review 接力 Prompt**；前端 prompts **禁止复制进仓**，仅靠较弱的 `.mdc` 与 task Prompt，Agent 易 **优先交付代码而跳过 Harness 仪式**。

---

## 2. 范围（parity 交付）

### 2.1 P0 — 规则与必读（不改 prompts 物理位置）

| # | 交付 | 锚点 |
| --- | --- | --- |
| P0-1 | `05-harness-semi-auto.mdc` **补齐第 7 条**（每帽结束 `📋 Harness 状态栏（版本 B）`） | 对齐后端同文件 |
| P0-2 | `06-harness-content.mdc` 增 **硬规则引用**：TEMPLATE §0 开帽 invoke · §7 对话下一棒 Prompt · §9 semi_auto 换帽前先落盘 invoke+commit | 不复制 prompts 正文 |
| P0-3 | `AGENTS.md` 必读链加入 `docs/harness/README.md`（与后端 AGENTS 第 5 项同级） | §Harness 升格 |
| P0-4 | `docs/tasks/templates/TASK_TEMPLATE.md` 增 **`gates_before_code`** 字段说明（见 §3） | 对齐后端 task 头 |

### 2.2 P1 — 机器门禁（轻量）

| # | 交付 | 说明 |
| --- | --- | --- |
| P1-1 | `tools/harness_task_validate.py`（可复用后端脚本 `--repo frontend`）或 `pnpm harness:task-check` 包装 | 开 30 前：semi_auto task 须有 human_gate 表 · test_strategy · 自检小节占位 |
| P1-2 | CI / pre-commit **可选**：`harness_human_gate_check.py` 对 `docs/harness/invokes/` + reviews 产物扫描 | 与后端 PR 闸对称 |
| P1-3 | semi_auto task 的 `PROMPT_semi_auto_startup_*.md` **每帽小节**显式三行：§0 / §7 / §9 | 减少只读实现清单 |

### 2.3 P2 — 落盘 taxonomy 收紧

| # | 交付 |
| --- | --- |
| P2-1 | `reviews/` **统一**为 `reviews/by-task/<task_slug>/`（README 取消 flat 歧义） |
| P2-2 | invoke 质量：**30/40/50 换帽前 invoke §3 ≥15 行**（写入 `docs/harness/invokes/README.md`） |
| P2-3 | 22 review 模板强制 **「下一棒可复制 Prompt」** 节 + `invoke_snapshot` 元信息（对齐后端 review） |
| P2-4 | （可选）`docs/showcase/` 或 `docs/harness/guides/GUIDE_agent_playbook_frontend_v1_zh.md` — Agent 反面清单 |

### 2.2 非范围

- **不**将 `Projects/docs/harness/prompts/` 整包复制进 `ai-ink-brain/`（维持 `06-harness-content` 单源）
- **不**改变工作区 Harness task 的 Open Folder 约定
- **不**在本 SPEC 内修复 Step2 可观测 **业务 UI**（属当前 task）

---

## 3. `gates_before_code`（建议字段 · 开 30 前）

```markdown
| **gates_before_code** | `pnpm harness:task-check` OK · 必读 SPEC/task 已读 · `HG-TASK-DRAFT` = approved · `HG-AUDIT-R1` = approved（或 light + 人 pre-approve 记入 review） · semi_auto 开跑 invoke 已落盘 |
```

---

## 4. 验收标准（对齐 task 用 · 本 SPEC 自身）

- [ ] 前端 `05-harness-semi-auto.mdc` 与后端 **条数/语义** diff 仅保留「prompts 路径」合理差异
- [ ] 新建 pilot semi_auto task 跑 **30→40** 时：**换帽前** invoke 已 commit；对话含 **下一棒 Prompt** + **状态栏 B**
- [ ] `harness:task-check`（或等价）对缺 `human_gate` / 缺自检小节的 task **非零 exit**
- [ ] `docs/tasks/specs/README.md` 索引本 SPEC；active task 链至本 SPEC

---

## 5. 与当前 Step2 可观测 task 关系

| 当前 task | 本 SPEC |
| --- | --- |
| `task_frontend_intent_hints_step2_observability_v1` | **不修改**其业务 scope |
| 帽链缺口（22 R2 · 50 · CHECKLIST） | **在当前 task 内补完**，不等待本 SPEC |
| 本 SPEC 实施 | **关账后** 新建 `task_harness_semi_auto_frontend_parity_v1.md` |

---

## 6. 建议后续 task（占位 · 未创建）

| 字段 | 建议值 |
| --- | --- |
| **task_slug** | `harness-semi-auto-frontend-parity-v1` |
| **test_strategy** | `required`（task-check 脚本 + 文档 diff 测试） |
| **semi_auto** | `false`（规约/工具链；用 pilot task 验证） |
| **依赖** | 本 SPEC approved + Step2 可观测 task **done** |

---

## 7. 修订记录

| 日期 | 摘要 |
| --- | --- |
| 2026-06-04 | v1 初稿：Step2 可观测 Harness 漏步骤复盘 · 前后端 parity 范围 |
