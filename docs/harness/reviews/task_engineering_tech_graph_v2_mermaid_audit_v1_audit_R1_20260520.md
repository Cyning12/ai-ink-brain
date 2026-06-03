# 任务审核：技术图谱 v2 — Mermaid 双轨拓扑审计（T3 · W2 · R1）

## 元信息

| 项 | 内容 |
|----|------|
| **关联 task** | [`../../tasks/active/task_engineering_tech_graph_v2_mermaid_audit_v1.md`](../../tasks/active/task_engineering_tech_graph_v2_mermaid_audit_v1.md) |
| **关联 SPEC** | [`../../tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md`](../../tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md) §4 W2、§8 T3、§11 顺序 5 |
| **轮次** | R1 |
| **审查日期** | 2026-05-20 |
| **slug** | `engineering_tech_graph_v2_mermaid_audit_v1` |
| **invoke_snapshot（10 帽）** | [`../invokes/by-task/engineering-tech-graph-v2-mermaid-audit/invoke_20260520_10_tech-graph-v2-mermaid-audit-requirements.md`](../invokes/by-task/engineering-tech-graph-v2-mermaid-audit/invoke_20260520_10_tech-graph-v2-mermaid-audit-requirements.md) |
| **上一轮审查** | 无 |
| **对照规约** | `docs/harness/prompts/22-task-audit.md`、`docs/harness/HARNESS_V2_PLAN.md` §5（工作区根） |
| **建议分支** | `task/tech-graph-v2-mermaid-audit-v1`（**禁止** 与 T5 共用 `task/tech-graph-v2-frontend-manifest-v1`） |

---

## 审查结论摘要

待审 task v1（2026-05-20）与 10 帽 invoke、SPEC §4 W2 / §8 T3、PRIORITY_ROADMAP **T3** 一致：范围锁定 **5 对 flowchart** + `02_version.md` + 导出产物 `graph.json`；**非范围** 明确禁止 `package.json`、`.github/workflows/quality.yml`、`_manifest.json` 与 `app/**`；`test_strategy: required` 以 **`pnpm tech-graph:*`** 可失败门禁背书（非 vitest，与图谱域匹配）；`freeze_id` 固定且禁止本 task bump。

对照现网（文档层抽样）：`package.json` 已含 `tech-graph:graph-export` / `graph-check` / `equivalence-check` / `schema-check`；`graph_v2_schema.md` §6 阈值（锚点 ≥95%、label ≥90%）与 task §5、FP-V2-3 一致；§8 **C-1～C-3** 已裁定「以 equivalence 脚本为准 / 人读轨允许裸边 / T1/T2 归档非阻塞」。

**结论**：**零阻塞**；**建议 30 执行帽开工**。本轮 R1 **准许进入执行**；task 头部仍为 `draft`，开 PR 时可改为 `active`（纪律项，非阻塞）。**task 正式 `done`** 须待 §5 验收全勾、实现备忘与（建议）`### 自检结论（执行者）` 回填、关账路线图 T3 后，由 **40 自检** + 维护者 PR 合并确认。

---

## 重点核对（Harness §5 + 用户指定）

### 验收标准可执行性

| 验收条 | 可执行性 | 核对依据 |
|--------|----------|----------|
| 5 对 flowchart + §2 检查表 | **可执行** | 路径枚举完整（`00_main`、`10_flow_route`、`11_flow_api`、`12_flow_auth`、`13_flow_components`）；实现备忘要求每图修复摘要。 |
| `pnpm tech-graph:graph-check` → exit 0 | **可执行** | `package.json` 已定义，调用后端 `tech_graph_graph_export.py --check`。 |
| `pnpm tech-graph:equivalence-check` → exit 0 | **可执行** | 脚本存在；阈值见 `graph_v2_schema.md` §6；与 FP-V2-3 对齐。 |
| `pnpm tech-graph:schema-check` → exit 0 | **可执行** | 脚本已接入（T1）；验收写「若 T1 已接入」— 背景已声明 T1 落地，**非歧义阻塞**。 |
| `freeze_id` 未擅自 bump | **可执行** | 元信息与 §5 可 grep / diff `graph.json`。 |
| `02_version.md` 里程碑 | **可执行** | 明确禁止绝对本机路径。 |
| PR 仅含 `docs/_tech_graph/**` + task/invoke | **可执行** | 与 §3、FP-T3-1/2 交叉校验。 |
| 关账 `PRIORITY_ROADMAP` §2.2 T3 | **可执行** | §0 回填纪律已在 task §7-6 写明。 |

### `failure_paths` 完整性（HARNESS_V2_PLAN §5.3）

| ID | 触发 | 系统行为 | 可重试 | 可见性 | 结论 |
|----|------|----------|--------|--------|------|
| FP-V2-1 | 裸边 / 语法 | export 非 0 | 修图后 | stderr | **完整** |
| FP-V2-2 | 未重导出 | graph-check 非 0 | 重导出+提交 | diff 摘要 | **完整** |
| FP-V2-3 | 锚点/label 阈值 | equivalence 非 0 | 补锚点/label | 阈值报告 | **完整** |
| FP-T3-1 | 误改 package/quality | **拒验收** | — | PR review | **完整**；与 §3 **禁止改 package.json / quality.yml** 一致 |
| FP-T3-2 | 与 T5 混分支/manifest | 拆分 PR | cherry-pick | 流程阻塞 | **完整** |
| FP-T3-3 | `.md` vs `.ai.md` 矛盾 | 人工/复检 fail | 同步语义 | review 备注 | **完整** |

### 非范围：`package.json` / `quality.yml` 禁令

| 位置 | 内容 | 结论 |
|------|------|------|
| §3 表「CI / 脚本矩阵」 | **禁止** 改 `package.json`、`pnpm tech-graph:*` 定义、`.github/workflows/quality.yml` | **已写明** |
| §7-5「禁止文件」 | 同上 + `_manifest.json`、`app/**` | **可执行** |
| §5 PR 验收 | **无** `package.json`、`quality.yml`、`_manifest.json` | **可执行** |
| FP-T3-1 | 误改 → 拒验收 | **与禁令闭环** |

### `test_strategy: required`

| 项 | 结论 |
|----|------|
| 取值 + `test_strategy_note` | **满足** §5.1：以 `pnpm tech-graph:*` 红绿背书；§7-4 要求 equivalence 缺口时先可复现失败再修图。 |
| 与「合并前必绿」关系 | 本 task **不改** 业务代码；`quality` 仍跑 lint/test/build，但 **不在 scope** 内改脚本矩阵—执行帽勿借机改 CI。 |

### SPEC §4 W2 / invoke 对齐

| 维度 | 结论 |
|------|------|
| W2-1～W2-4 | task §2 表与 SPEC 行项 **一一对应** |
| 不重跑闸口 A/B/C、Playbook §8 | §3、invoke **一致** |
| T5 并行 | 分支名隔离；无 manifest 范围渗入 |

---

## 阻塞 / 非阻塞

| 类型 | 说明 |
|------|------|
| **阻塞** | **无** |
| **非阻塞（已核对）** | （1）**Harness 字段**：`test_strategy`/`freeze_id`/`failure_paths` 齐全。（2）**依赖表** §4 链 SPEC、协议、`graph_v2_schema`、T1/T2 task、路线图、invoke。（3）**编辑顺序** §7：先 `.ai.md` → export → `graph.json` → 再 `.md`。（4）**矛盾节** C-1 边占比 vs 门禁阈值已裁定。（5）invoke `task_delivered` 与 task 路径一致。 |
| **非阻塞（执行帽注意）** | （1）task 尚无 **`### 自检结论（执行者）`** 占位—40 帽执行后回填即可。（2）头部 `draft` → 开工可标 `active`。（3）equivalence 若已绿，须在实现备忘记 **基线锚点%/label%**（§7-4）。（4）可选同 PR 归档 T1/T2（§7-7、C-3）非本 task 阻塞。（5）关账须 `git mv` + `_views` + 路线图 §2.2 T3（§7-6）。 |

---

## 需任务帽回填清单（若有）

本轮 **无必须回填项**。

可选（**不阻塞 30**）：在 task §9 预置空表 **`### 自检结论（执行者）`** 小节标题，便于 40 帽粘贴；非 R1 硬性要求。

---

## 是否建议执行帽开工

**建议开工**。

1. **分支**：`task/tech-graph-v2-mermaid-audit-v1`（从含 `36acb5e` / parity 的 `main` 建线）。  
2. **顺序**：5× `*.ai.md` 审计修复 → `pnpm tech-graph:graph-export` → 提交 `graph.json` → 同步 5× `*.md` → `02_version.md`。  
3. **自检最低集**：`graph-export` → `graph-check` → `equivalence-check`（建议 `schema-check`）。  
4. **禁止**：`package.json`、`quality.yml`、`_manifest.json`、`app/**`、闸口实验、`freeze_id` bump。  
5. 依赖本审查：`ai-ink-brain/docs/harness/reviews/task_engineering_tech_graph_v2_mermaid_audit_v1_audit_R1_20260520.md`。

---

## 签收 / 关闭

| 项 | 结论 |
|----|------|
| **本轮 R1** | **零阻塞记录**；**通过审查**；**准许进入 30 执行帽**。 |
| **task 正式关闭** | **未满足**。须 §5 全勾、实现备忘、PR 仅图谱路径、路线图 T3 `done（日期）`；建议 **40 自检** 后维护者合并关账。 |

---

## 下一棒可复制 Prompt

以下与 **对话回复** 中「下一棒」块 **逐字一致**。

```text
你正在扮演工作区 Harness「执行编码帽」，严格遵循：
- docs/harness/prompts/30-execute-code.md（身份、只做什么、禁止什么、拒开工、输出形状、交接物）
- docs/harness/prompts/40-self-check.md（验证命令、回填 task「### 自检结论（执行者）」）
- docs/harness/HARNESS_V2_PLAN.md §5（test_strategy、failure_paths、gates_before_code）
- 子仓 AGENTS.md、task 内「给执行帽必读」、根 AGENTS.md §8（合并前必绿；本 task 不改 quality 矩阵，但 PR 仍须不破坏现有 CI）

输入（占位符已替换；若仍见 {{…}} 或「待填」须追问，不得写业务代码）：
- 主 task 路径（相对工作区根 Projects/）：
ai-ink-brain/docs/tasks/active/task_engineering_tech_graph_v2_mermaid_audit_v1.md
- 子仓根（cwd）：
ai-ink-brain
- 分支：
task/tech-graph-v2-mermaid-audit-v1
- 合并前验证（与 task §7 一致）：
pnpm tech-graph:graph-export && pnpm tech-graph:graph-check && pnpm tech-graph:equivalence-check
（建议 pnpm tech-graph:schema-check）
- 关联任务审核：
ai-ink-brain/docs/harness/reviews/task_engineering_tech_graph_v2_mermaid_audit_v1_audit_R1_20260520.md
- 关联 SPEC：
ai-ink-brain/docs/tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md §4 W2

你必须完成：
0. **Invoke 快照**：将本 user 消息全文按 docs/harness/invokes/README.md 落盘至 ai-ink-brain/docs/harness/invokes/（开帽一次即可）。
0b. **human_gate**：若 task/reviews 对 30 帽为 pending → 仅输出 gate_id，拒开工。
1. 通读 task §2–§7、failure_paths FP-V2-* / FP-T3-*；freeze_id TECH_GRAPH_S2_FREEZE_20260519_V2_3 禁止 bump。
2. 仅改 docs/_tech_graph/ 下 5 对 flowchart、02_version.md、graph.json（导出产物）；按 §2 检查表审计 .ai.md 并同步 .md。
3. test_strategy required：equivalence 已绿则实现备忘记录基线%；有缺口则先可复现红再修至绿。
4. 禁止 package.json、.github/workflows/quality.yml、_manifest.json、app/**、闸口实验。
5. 回填 task §9 实现备忘；执行后增「### 自检结论（执行者）」并贴命令要点与 exit code。
6. 关账：验收勾选 → git mv 至 docs/tasks/done/ → 更新 PRIORITY_ROADMAP §2.2 T3 为 done（日期）。
7. 输出下一棒 40 自检 Prompt 或阻塞说明。
8. 按 docs/harness/prompts/HANDOFF_AUTO_COMMIT.md 分仓 commit；用户说不要 commit 则跳过。
```
