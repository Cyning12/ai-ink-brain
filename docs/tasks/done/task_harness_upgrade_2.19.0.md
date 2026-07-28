# Task：Harness 升级至 2.19.0（Ink 前端）· lint-wiki-delta

> **状态**：`completed`  
> **类型**：基础设施（过程轨 upgrade + 文档对齐）  
> **关联**：npm `@cyning/harness@2.19.0` · 前序 PR [#114](https://github.com/Cyning12/ai-ink-brain/pull/114)（2.18.0 接入）  
> **Open Folder**：`ai-ink-brain/`  
> **非范围**：业务页面 / BFF；WikiTrack 强制启用（棒 B）；无关 active 业务 task 关账

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `harness-upgrade-2.19.0` |
| **git_branch** | `task/harness-upgrade-2-19-0` |
| **worktree_root** | `ai-ink-brain/` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | `upgrade --yes`；`check`；`lint-wiki-delta --scope all`；`pnpm lint/test/build`；`verify --task` |
| **code_quality_bar** | `not_applicable` |
| **freeze_id** | `HARNESS-UPGRADE-2.19.0@2026-07-28` |
| **orchestration** | `MANIFEST 仅` |
| **semi_auto** | `false` |
| **audit_profile** | `light` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30` |
| **graph_delta** | `none` |
| **graph_delta_note** | 仅过程轨 / 钉版本 / 文档；不改业务图谱 |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · profile.wiki=false · 本波暂不启用 WikiTrack；维护者明示后再棒 B |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |
| **acceptance_interaction** | `not_applicable` |
| **acceptance_interaction_note** | 无浏览器交互验收 |

### 人工闸 `human_gate`

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | approved | 22-R1,30 | 维护者授权：升 2.19.0 + 文档对齐 |
| HG-AUDIT-R1 | approved | 30 | 00 代签：无业务页面/BFF 改动 |
| HG-GRAPH-MODULES | approved | 30 | 00 代签：graph_delta=none |

---

## 背景与目标

仓内已钉 `@cyning/harness@2.18.0`（PR #114）。2.19.0 交付 **`task lint-wiki-delta`**；本 task 一把升到 2.19.0、恢复 overlay、扫缺字段、质量门绿。

**完成态一句话**：manifest=2.19.0 · lint-wiki-delta missing=0 · Ink overlay 已恢复 · pnpm 三绿 · 本 upgrade task 可 close。

---

## 范围

- [x] `npx @cyning/harness@2.19.0 upgrade --yes --target .`（不带 `--ide`）
- [x] 恢复 overlay：`06-harness-pointer.mdc`（Ink 定制）；FRAGMENT/AGENTS 无冲丢
- [x] `harness.pin.json` → 2.19.0；README / quality 注释对齐
- [x] `task lint-wiki-delta --scope all` → PASS（补 11 份可解析 `## Harness 元信息` 表）
- [x] POINTER RUNBOOK（对照 ops-desk-api · 本波不启 WikiTrack）
- [x] `pnpm lint` / `test` / `build`
- [x] 本 task invoke + R1 + verify + close

## 非范围

- 启用 `docs/coding_wiki` / Obsidian vault（棒 B · 须维护者明示）
- 业务页面、BFF、Python API
- 关闭其它 active 业务 task
- 默认 `--allow-*-gap`

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| lint-wiki-delta missing>0 | 补 `## Harness 元信息` 表字段后再关 | 是 | CLI missing 清单 |
| upgrade 冲掉 overlay | diff 后恢复 pointer/FRAGMENT | 是 | git diff |
| `task close --target .` | 误用归档目标 | 是 | 改用 `--file` |

---

## 验收标准

- [x] manifest.version=`2.19.0` · `check` 已是最新 · exit 0
- [x] `lint-wiki-delta --scope all` · missing=0 · exit 0
- [x] overlay（Ink pointer）已恢复；`ide=["cursor"]` 记录
- [x] `pnpm lint` / `test` / `build` 通过
- [x] 未启用 WikiTrack；未关无关业务 task

---

## 给执行帽的必读列表

1. `AGENTS.md` · `docs/harness/README.md`
2. `docs/harness/POINTER_RUNBOOK_wikitrack_enable_obsidian_v1_zh.md` §0.5
3. 仓根 `harness.pin.json`

---

### 自检结论（执行者）

| 项 | 内容 |
|----|------|
| **日期** | 2026-07-28 |
| **manifest** | `2.19.0`（from `2.18.0`）· preset `harness-only` · ide `["cursor"]` |
| **lint-wiki-delta** | scanned=58 · missing=0 · PASS |
| **overlay** | 恢复 `.cursor/rules/06-harness-pointer.mdc`（产品包默认冲掉 Ink 定制） |
| **摩擦** | `parseHarnessMeta` 只认 `## Harness 元信息` 表；顶栏裸表/blockquote/`## 元信息` 内的 wiki_delta 对 lint 仍算 missing |

### 经验（执行者）

- upgrade **不带** `--ide` 时本仓保持 `ide=["cursor"]`，未静默裁剪。
- 2.18 手补的 wiki 字段若未落在 `## Harness 元信息` + 反引号单元格，2.19 `lint-wiki-delta` 仍 FAIL——须按 `parseHarnessMeta` 格式重写。
- `task close` 的 `--target` 是归档目标路径，**禁止** `--target .`。
- 本波 WikiTrack 不启用：保持 `wiki_delta=n/a` + note。

### KPI（00）

| 项 | 分 |
|----|-----|
| Task_KPI% | 100 |

---

## CLOSE

| 项 | 内容 |
|----|------|
| **日期** | 2026-07-28 |
| **manifest** | `2.19.0` |
| **PR** | （开 PR 后回填） |
