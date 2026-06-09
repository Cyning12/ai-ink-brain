# Task：技术图谱 v2 — CI 等价门禁（T2）

> **状态**：`done（2026-05-20 · parity PR #35 → main）`  
> **关联 SPEC**：`docs/tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md` §11 顺序 3  
> **test_strategy**：`required`  
> **freeze_id**：`TECH_GRAPH_S2_FREEZE_20260519_V2_3`

## 范围

- [x] `.github/workflows/quality.yml`：`tech_graph_graph_equivalence_check.py` 步（在 `--check` 之后、`lint` 之前）

## 验收

- [x] PR 上 **quality** 全绿（含 equivalence 步）
