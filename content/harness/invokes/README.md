# content/harness/invokes（前端仓 · 帽子快照）

> **用途**：每顶帽子 **新开局** 时，将工作区 `TEMPLATE-*-invoke.md` **§3 全文**（已替换占位符）存一份于此。  
> **模板来源**：工作区 `Projects/docs/harness/prompts/templates/`（本仓无副本）。

---

## 命名

`invoke_YYYYMMDD_<帽号>_<slug>.md`

例：`invoke_20260531_30_chatbi-v3-lowconf-rag-preview-frontend.md`

---

## 目录 taxonomy

| 阶段 | 路径 |
|------|------|
| **历史（≤2026-05-20）** | 本目录根下 `invoke_*.md`（**只读** · 勿再新增） |
| **新文件（2026-05-31 起）** | **`by-task/<task_slug>/invoke_*.md`** |

**规则**：

1. **`task_slug`** 与 task 文首 Harness 元信息一致（kebab-case）。  
2. 同一帽多轮追问 **不** 重复落盘；换帽才新建文件。  
3. 与 task 同 **`git_branch`** 提交；并行任务用独立 worktree（见工作区 `docs/harness/README.md` · 根 `AGENTS.md` §8）。  
4. **22 审查** 结论 → `content/harness/reviews/`，**不** 写入 invoke。  
5. **50 复检** → `content/tasks/reinspect_results/`。

---

## 给 Cursor

`invoke`、`by-task`、`task_slug`、`TEMPLATE`、`semi_auto`
