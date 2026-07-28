# Task：技术图谱 v2 — 文档、pnpm 脚本与 Agent 查询约定（T1）

> **状态**：`done（2026-05-20 · parity PR #35 → main）`  
> **关联 SPEC**：`docs/tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md`  
> **Playbook**：`docs/diary/tech_graph_v2_frontend_migration_playbook_v1_zh.md`  
> **test_strategy**：`required`（本地 `pnpm tech-graph:*` 可失败）  
> **wiki_delta**：`n/a`  
> **wiki_delta_note**：harness-only · 无 WikiTrack（未启用 docs/coding_wiki）；本 task 未改 wiki  
> **freeze_id**：`TECH_GRAPH_S2_FREEZE_20260519_V2_3`

## 范围

- [x] `graph_v2_schema.md`、`99_mermaid_protocol.md`
- [x] `99_spec.md` 机器轨 / 契约 §
- [x] `AGENTS.md`、`PROJECT_CONFIG` §D
- [x] `package.json`：`tech-graph:graph-export|graph-check|equivalence-check|schema-check|query`

## 验收

- [ ] 维护者本地：`pnpm tech-graph:graph-check` 与 `equivalence-check` exit 0
