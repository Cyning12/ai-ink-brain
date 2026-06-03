# review_results / 审查结果落盘

> **用途**：存放 **规格 / 任务审查帽**（工作区根 **`docs/harness/prompts/20-review-spec-task.md`**；与 `ai-ink-brain/` 同级的 **`Projects/`** 聚合布局下存在）对 task / SPEC 的 **缺口与可测性** 审查结论，便于追溯与交给 **需求帽** 回填 task / SPEC。  
> **注意**：本目录 **不是** `task_*.md` 任务单本体；不替代 `active/`、`done/` 状态流。

---

## 何时写入

- 审查帽输出 **阻塞项 / 非阻塞建议 / 给需求帽的回填清单** 后，将 **可归档版本** 存一份于此（可选：同线程粘贴链接 PR / 关联 task 路径）。

---

## 命名建议

- `review_<主题简写>_YYYYMMDD_vN.md`  
  例：`review_chatbi_v3_sql_gate_security_20260513_v1.md`

---

## 正文建议结构（最小）

1. **元信息**：关联 task / SPEC 路径（相对 `Projects/` 或本仓根）、审查日期、`freeze_id` 若适用。  
2. **阻塞项** / **非阻塞建议**（与帽子输出形状一致即可）。  
3. **给需求帽的回填清单**（可逐条勾选后由需求帽改文档）。

---

## 回填闭环

- 需求帽入口：工作区根 **`docs/harness/prompts/10-requirements.md`**  
- 回填完成后：可在本文件顶部加一行 **「已回填 / 日期 / PR」**，不必强制移动文件。

---

## 与后端 `docs/tasks/review_results/` 的分工

- 审查对象为 **`ai-ink-brain-api-python`** 内 task / SPEC 时，归档 **优先** 落在：  
  **`ai-ink-brain-api-python/docs/tasks/review_results/`**（见该目录 `README.md`），避免与前端目录双份漂移。  
- **`ai-ink-brain/docs/tasks/review_results/`**（本目录）主要用于 **前端** `docs/tasks` 相关任务或跨仓备忘。

---

## 给 Cursor 的稳定关键词

`Harness`、`审查帽`、`review_results`、`回填`、`failure_paths`、`test_strategy`、`freeze_id`
