# Task · Ops Session S4 Verify UI（promote 向导 · verify 报告 · HG-PROMOTE）

> **状态**：`done（2026-07-02 · HG-S4-LOCAL-ACCEPTANCE）`  
> **epic**：Session Orchestrator · S4 `ops-session-s4-verify`  
> **schedule_ref**：SPEC §5.3 · §9.3 · §12.1 S4 · BLOCKERS B4  
> **关联 SPEC**：`[SPEC_ops_session_orchestrator_v1_zh.md](../../docs/tasks/specs/SPEC_ops_session_orchestrator_v1_zh.md)` §5.3 · §9.3 · §10.5  
> **配对后端**：[`task_ops_session_s4_verify_api_v1.md`](../../../ai-ink-brain-api-python/docs/tasks/done/task_ops_session_s4_verify_api_v1.md)  
> **前置**：`[task_ops_session_s3_subagent_ui_v1.md](../done/task_ops_session_s3_subagent_ui_v1.md)` · HG-S3-LOCAL-ACCEPTANCE

---



## Harness 元信息


| 字段                | 值                               |
| ----------------- | ------------------------------- |
| **task_slug**     | `ops-session-s4-verify-ui`      |
| **module_id**     | `OPS-SESSION-ORCH`              |
| **freeze_id**     | `OPS-SESSION-ORCH-SPEC-V1`      |
| **test_strategy** | `recommended`                   |
| **worktree_root** | `ai-ink-brain/`                 |
| **git_branch**    | `task/ops-session-s4-verify-ui` |
| **blocked_by**    | 后端 `ops-session-s4-verify-api`  |
| **blocks**        | S5 extract UI（若有）· **合并批次 PR**  |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 无 WikiTrack（未启用 docs/coding_wiki）；本 task 未改 wiki |




### 人工闸 `human_gate`


| human_gate_id | status     | blocks_hats       | 说明                 |
| ------------- | ---------- | ----------------- | ------------------ |
| HG-TASK-DRAFT | `approved` | 20-task-audit, 30 | 00 起草 · 2026-07-02 |
| HG-AUDIT-R1   | `approved` | 30                | 20 R1 后人签          |


---



## 背景与目标

S3 已交付 dispatched 深析与 deliverables 只读区。本 task 在 Session 详情页增加 **promote 向导**（B4）：展示 00 生成的 promote 清单 · 选择目标子仓与分支 · maintainer 点击「确认 promote」后调用 API · 展示 verify 报告（通过/失败）。

**完成态一句话**：`dispatched` 且交付物就绪后 · maintainer 可走 promote 预览 → 确认 → 查看 verify 结果 · **不**在浏览器内 auto-commit。

### 拍板（与后端 S4 对齐）


| #   | 决策                                                      |
| --- | ------------------------------------------------------- |
| D1  | 目标仓下拉：`api-python` / `Ink` · 分支默认 `main` · 可编辑          |
| D2  | 确认 promote **二次确认**（对话框 · 非误触）                          |
| D3  | verify 失败：inline 错误 + report 摘要 · 不隐藏后端 `VERIFY_FAILED` |
| D4  | Vercel 部署提示：全量 verify 建议本地/GHA（与 SPEC §10.4.4 一致）       |


---



## 范围

- [x] `OpsSessionPromotePanel`（或向导步骤）：预览清单 · target_repo · target_branch · 确认按钮
- [x] **BFF**：`GET/POST /api/ops/sessions/[id]/promote`（及 preview 若拆分）· `forwardOpsRequest`
- [x] **verify 报告展示**：只读 JSON 摘要 / 失败项列表
- [x] **gate 展示**：`HG-PROMOTE` pending/approved 与 session 详情同步（预览 gate_summary）
- [x] **manifest / tech-graph**：新 BFF 路由登记
- [x] **Vitest**：promote BFF smoke（mock forward）
- [x] **Session 详情**：`dispatched` 且无阻塞时展示 promote 入口

---



## 非范围

- gh PR 自动创建（maintainer 手动）
- graph_delta 编辑 UI（S5/B6）
- probe CLI 安装引导（文档链至 harness-probe README 即可）

---



## 验收标准

- [x] promote 预览与确认流与 API 契约一致
- [x] verify 失败/成功态 UI 可辨
- [x] S2/S3 路径不退化（组件增量）
- [x] `pnpm lint` / `test` / `build` 绿

---

### 自检结论（执行者）

| 项 | 结果 |
| --- | --- |
| **日期** | 2026-07-02 |
| **分支** | `task/ops-session-s4-verify-ui` |

```text
pnpm lint 0 error · test 155 passed · build 绿
```

---

## 给 Cursor

`ops-session-s4-verify-ui` · **HG-AUDIT-R1 approved** · 30 done · 待人签 checklist §3