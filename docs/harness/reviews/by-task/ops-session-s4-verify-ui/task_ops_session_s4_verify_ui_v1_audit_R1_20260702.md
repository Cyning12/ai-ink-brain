# 书面审查 · Ops Session S4 Verify UI · 20-task-audit R1

## 元信息

| 字段 | 值 |
| --- | --- |
| **帽** | `20-task-audit` |
| **task_slug** | `ops-session-s4-verify-ui` |
| **task_path** | [`content/tasks/active/task_ops_session_s4_verify_ui_v1.md`](../../../../content/tasks/active/task_ops_session_s4_verify_ui_v1.md) |
| **freeze_id** | `OPS-SESSION-ORCH-SPEC-V1` |
| **审查轮** | `R1` |
| **日期** | `2026-07-02` |
| **acceptance_verdict** | **conditional_pass** |
| **HG-AUDIT-R1 建议** | **recommend approved** |

---

## 对照 SPEC · BLOCKERS

| 检查项 | 来源 | 判定 |
| --- | --- | --- |
| promote 向导 · maintainer 显式确认 | B4 · §5.3 · §9.3 | **pass**（D2 二次确认） |
| 不 auto-commit / 不 auto-PR | B4 | **pass**（非范围明确） |
| verify 报告可见 | §10.5 · 配对 api | **pass**（D3） |
| Vercel 提示本地/GHA verify | §10.4.4 · D4 | **pass** |
| S2/S3 不退化 | Epic §12.3 | **pass**（验收标准已列） |
| test_strategy `recommended` | §12.4 | **pass** |
| blocked_by api | task 元信息 | **pass**（预览契约依赖 api 30 首期） |

---

## 契约与配对（api task）

| UI 范围 | 后端对应 | 判定 |
| --- | --- | --- |
| `OpsSessionPromotePanel` 预览 | `GET .../promote/preview` | **pass** |
| 确认 promote | `POST .../promote` + `confirm: true` | **pass** |
| `target_repo` / `target_branch` | api D3 枚举 | **pass**（UI 文案与 api 枚举一致即可） |
| `HG-PROMOTE` 展示 | gate_sync + session detail | **pass** |
| BFF forward | 同 S1–S3 sessions 模式 | **pass** |

---

## 阻塞项

**无。**

---

## 非阻塞（30 消化）

| # | 建议 |
| --- | --- |
| N1 | **blocked_by api**：可先 BFF + Panel 骨架 + Vitest mock · 联调等 api preview JSON 冻结（建议 api 先发 preview 再 ui 接真字段） |
| N2 | 补充 **failure_paths** 一行表（`VERIFY_FAILED` / `PROMOTE_CONFLICT` / 503）· 与 api 对齐 · 非阻塞 |
| N3 | promote 入口显示条件：`dispatched` + 有 session task 草稿 · 不必等深析 `result.json` |
| N4 | manifest 登记 `GET/POST .../promote` · 与 deliverables 路由同级 |

---

## 30 开工

**conditional_pass · 零 fail · recommend HG-AUDIT-R1 approved**

**Open Folder**：`ai-ink-brain/` · 分支 `task/ops-session-s4-verify-ui`

**建议顺序**：api 30 交付 preview 响应样例 → ui 30 对接（或 ui 并行 mock 后联调）
