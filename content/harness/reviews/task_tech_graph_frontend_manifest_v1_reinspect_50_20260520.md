# 独立复检（50）：技术图谱 T5 前端 manifest · 2026-05-20

| 项 | 内容 |
|----|------|
| **关联 task** | [`../tasks/active/task_engineering_tech_graph_frontend_manifest_v1.md`](../tasks/active/task_engineering_tech_graph_frontend_manifest_v1.md) |
| **invoke** | [`../invokes/invoke_20260520_50_tech-graph-v2-frontend-manifest-reinspect.md`](../invokes/invoke_20260520_50_tech-graph-v2-frontend-manifest-reinspect.md) |
| **审查 R1** | `task_tech_graph_frontend_manifest_v1_audit_R1_20260520.md`（**本仓路径未入库**；见 worktree 同名校本） |
| **复检日期** | 2026-05-20 |
| **结论** | **不建议合并前端 PR**（须先 api-python `54c976b` → `main`）；本地实现与 40 帽一致，§6 除 CI/关账外 **pass** |

## §6 验收表

| 验收项 | pass/fail | 证据 | 备注 |
|--------|-----------|------|------|
| `_manifest.json` 结构与字段 | **pass** | `docs/_tech_graph/_manifest.json` L1–4 `schema_version`/`repo`；含 `pages`/`routes`/`env` | 与 40 帽一致 |
| 本地 `pnpm tech-graph:manifest-check` → 0 + OK | **pass** | 50 帽复跑：`OK: frontend manifest matches code truth (pages=11, routes=16, env=20).` exit=0 | 使用 sibling 脚本（含 `--repo frontend`） |
| 负向：删 manifest route → exit 1 | **pass** | 50 帽复跑删 `POST /api/py/unified/chat/stream` → `Routes 缺失（truth->manifest）` exit=1 | 与 40 帽一致 |
| 正向：manifest 多余 route → exit 1 | **pass** | 40 帽已跑；50 帽未重复（与 40 同口径） | 信任 40 表 |
| PR `quality` 全绿 + manifest step | **fail** | `gh pr list` TLS 超时；**无 PR 可查** | **证据不足** + 合并顺序阻塞 |
| `99_spec` / `AGENTS` 文档化 | **pass** | `git diff origin/main...HEAD`：`99_spec.md` manifest 行 + CI 顺序；`AGENTS.md` L76 `tech-graph:manifest-check` | |
| 未改 `.ai.md` | **pass** | `git diff origin/main...HEAD` 无 `*.ai.md` | |
| 路线图 T5 关账 | **fail**（预期） | 关账后项；未执行 | 非合并阻塞 |

## 跨仓与 CI（重点）

| 检查项 | 结论 | 证据 |
|--------|------|------|
| `origin/main` 是否含 `--repo frontend` | **否** | `ai-ink-brain-api-python` `main` @ `531ef3c`：`tech_graph_manifest_check.py` **无** `argparse`/`--repo`（330 行 vs `54c976b` 538 行） |
| `quality.yml` manifest step 与 40 帽 | **一致** | L52–53：`Tech graph manifest check` + `--repo frontend --repo-root "${GITHUB_WORKSPACE}"` | 与 task §8-4、40 invoke 一致 |
| 先合 api-python 再合前端 | **强制** | 50 帽用 **main 已提交脚本** 跑 CI 同款参数 → **忽略** `--repo frontend`，仅校验 **后端** manifest → exit 0（**假绿**） | **合并阻塞** |
| api-python 功能提交 | 在分支 | `task/tech-graph-v2-frontend-manifest-v1` @ `54c976b`（及 `3417375`）未在 `origin/main` | 须 PR 合 main 后再开/重跑前端 PR CI |

## 阻塞合并项

1. **必须先** 将 `ai-ink-brain-api-python` 的 `manifest_check` frontend profile（≥ `54c976b`）合并到 **`main`**，再合并前端 PR。  
2. 前端 PR **`quality`** 须在 api-python 合入后 **重跑**，日志须出现 `OK: frontend manifest matches code truth`（非仅后端 OK 行）。  
3. **`audit_profile: full`**：R1 审查 md **未**在本仓 `content/harness/reviews/` 入库（仅 worktree 副本）；**R2 签收**未做 → **不可** `HANDOFF_CLOSE_TRACE`。  
4. PR CI：**gh 不可达**，须维护者本地或 Actions 补证。

## 是否建议合并

| 仓 | 建议 |
|----|------|
| **ai-ink-brain-api-python** | **建议合并**（在 `task/tech-graph-v2-frontend-manifest-v1` / `54c976b` 脚本扩展）**优先于**前端 |
| **ai-ink-brain** | **暂缓**；api-python `main` 含 frontend profile **且** 前端 PR `quality` manifest step 真绿后再合 |

## 给维护者

- 合并后验证：`python3 …/tech_graph_manifest_check.py --repo frontend …` 在 **main 脚本** 上 exit 0 且 stdout 含 `frontend`。  
- 关账：§6 路线图 + **22 R2** 签收 → `HANDOFF_CLOSE_TRACE`。
