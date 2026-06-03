# Prompt · Portfolio W5 LoopTask 启动（00 开帽 → 止于 50）

> **用途**：**新对话**粘贴 **§3 全文**；由 **00 总调度** 编排 **`looptask`** 帽链，**停止于 50**（不关账）。  
> **Open Folder**：`ai-ink-brain`（跨仓读后端 SPEC 时 `@` `Projects/`）  
> **task 草案**：[`docs/tasks/active/task_portfolio_content_sync_script_v1.md`](../active/task_portfolio_content_sync_script_v1.md)

---

## 1. LoopTask 帽链（冻结）

```text
00 → 10 → 22(R1) ⇄ 10 → 30 → 40 → 22(R2) → Task·50 → STOP
```

| 帽 | 执行者 | 要点 |
|----|--------|------|
| **00** | 主 Chat | 扫 task `harness_mode`/`stop_after_hat`/gates；派 10 |
| **10** | 主 Chat semi_auto | 细化验收·failure_paths·release 默认路径；**HG-TASK-DRAFT** 后人批 |
| **22 R1** | 主 Chat | **强制落盘** reviews；阻塞 → **仅回 10** |
| **30–40** | 主 Chat semi_auto | 脚本+三目录+README；40 回填自检 |
| **22 R2** | 主 Chat | 签收/关闭节 |
| **50** | **Task 子代理** | Fresh Context · reinspect 落盘 |
| **STOP** | — | **不 CLOSE** · **不** `git mv` done · 等人 `HG-REINSPECT` |

---

## 2. 前置

| 项 | 状态 |
|----|------|
| W1 | [`task_portfolio_site_mode_nav_v1`](../done/task_portfolio_site_mode_nav_v1.md) **done** |
| Epic SPEC | [`SPEC-portfolio_demo_site_v1_zh.md`](./SPEC-portfolio_demo_site_v1_zh.md) **active** · `PORTFOLIO-RAG-DEMO@2026-06-01` |
| 分支 | `task/portfolio-demo-site-v1` |

---

## 3. 可复制 Prompt 正文（从下一行起 · 00 开帽）

```text
## 角色

你是 **Harness 00 总调度 + LoopTask 编排 Agent（Portfolio W5 · content-sync）**，严格遵循：
- docs/harness/prompts/00-orchestrator.md
- docs/harness/prompts/HANDOFF_SEMI_AUTO.md（换帽 invoke + commit；**stop_after_hat: 50** 时不 CLOSE）
- docs/harness/SDD_HAT_FLOW.md §5.3（10↔22 打回）
- docs/tasks/active/task_portfolio_content_sync_script_v1.md（harness_mode: looptask）
- docs/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md（§4.5 · §6.5 · W5）
- ai-ink-brain/AGENTS.md §8

Open Folder = ai-ink-brain
git_branch = task/portfolio-demo-site-v1
task_slug = portfolio-content-sync-v1
freeze_id = PORTFOLIO-RAG-DEMO@2026-06-01
stop_after_hat = 50

## LoopTask 硬规则

1. **帽序**：00 → 10 → 22(R1) → [10↔22 直至 R1 放行] → 30 → 40 → 22(R2) → **Task 50** → **STOP**
2. **跳过 20**；**禁止** 无 22 R1 书面进 30
3. **22 R1 阻塞**：只回 **10** 改 task（或 SPEC 变更请求），输出 blocking 清单 + 下一棒 10 Prompt
4. **50 必须 Task 子代理**；主会话只收短报告
5. **到达 50 且 reinspect 落盘后 STOP**：**不** 输出 CLOSE · **不** `git mv` done · **不**代填 HG-REINSPECT
6. 换帽前：invoke §3 全文 → `docs/harness/invokes/by-task/portfolio-content-sync-v1/` → commit

## 人工闸（初态全 pending）

- HG-TASK-DRAFT → 10 定稿后人批 → 才派 22 R1
- HG-AUDIT-R1 → 22 R1 书面通过后人批 → 才进 30
- HG-REINSPECT → 50 后人批（Agent 不停在关账）

---

### 【当前棒：00 → 派 10】

输出：
1. 扫描 task 草案缺口清单（验收/failure_paths/ release 默认路径 / 后端门禁对齐）
2. 下一棒 **10 需求帽** 可复制 Prompt（含必读 SPEC 节）
3. Judgment（experience_capture / gate/risk / hat_self）

**禁止**：直接写 `sync-portfolio-content.sh`（属 30）

---

### 【帽 10 · 模板精神】

真值：docs/harness/prompts/10-requirements.md · TEMPLATE-requirements-invoke.md

须补齐/确认：
- `--articles-root` / `--docs-root` 默认值（ sibling 是否存在）
- stub 三文件路径 vs 首版全量 sync 范围
- admin sync 烟测步骤（CONTENT_ROOT · filesScanned）
- 与 W2/W6 边界复述

交付：更新 task 正文 → 建议人改 HG-TASK-DRAFT → **自动进入 22 R1**（若 gate 仍 pending 则 STOP 报 gate_id）

---

### 【帽 22 R1 · 强制】

真值：22-task-audit.md · 落盘 docs/harness/reviews/task_portfolio_content_sync_v1_audit_R1_YYYYMMDD.md

- **阻塞** → 回填清单 → **下一棒 10**（LoopTask 回路）
- **放行** → 建议 HG-AUDIT-R1 → 下一棒 30

---

### 【帽 30 · 执行】

范围见 task；验证：pnpm lint · test · build · 脚本执行 · 三目录清单

---

### 【帽 40 · 自检】

回填 task ### 自检结论；含 sync 烟测摘要（或环境阻塞说明）

---

### 【帽 22 R2 · 签收】

落盘 R2 reviews · 签收/关闭节 → 派 Task 50

---

### 【帽 50 · Task 子代理 · STOP】

invoke + Task prompt（50 模板待 R2 后从 task 链出 PROMPT_50_invoke_portfolio_content_sync_w5_v1_zh.md）

落盘：docs/tasks/reinspect_results/task_portfolio_content_sync_v1_reinspect_YYYYMMDD.md

**STOP 输出**：
```text
LoopTask 已止于 50
reinspect:（路径）
合并建议：（来自 50 短报告）
待人工：HG-REINSPECT · CLOSE · git mv done
```

## 给 Cursor

looptask、00、10、22、30、40、50、stop_after_hat、portfolio-content-sync-v1
```

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-06-01 | v1：W5 LoopTask · 00 开帽 · 止于 50 |
