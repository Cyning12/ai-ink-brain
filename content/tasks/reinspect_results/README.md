# reinspect_results / 任务复检落盘

> **用途**：存放 **独立复检帽**（工作区根 **`docs/harness/prompts/50-independent-reinspect.md`**；同上 **`Projects/`** 布局）对 **diff + 日志 + 验收表** 的逐项 **pass / fail** 结论，便于合并决策与事后审计。若复检指出文档缺口，可将 **回填清单** 交给 **需求帽** 更新 task / SPEC。  
> **注意**：本目录 **不是** 任务单；复检 Agent **默认不改代码**（除非任务明确要求复检提交 patch）。

---

## 何时写入

- PR / 分支自检后，复检帽输出 **验收项表格 + 阻塞合并项** 时，将定稿存于此。  
- **证据不足** 时：仍落盘，并列出需补充材料，避免口头结论漂移。

---

## 命名建议

- `reinspect_<主题简写>_YYYYMMDD_vN.md`  
  例：`reinspect_chatbi_v3_sql_gate_pr123_20260513_v1.md`

---

## 正文建议结构（最小）

1. **元信息**：关联 PR / 分支、commit 短哈希、关联 `task_*.md` 路径。  
2. **验收表**：`验收项 | pass/fail | 证据 | 备注`。  
3. **阻塞合并项**（若有）。  
4. **给需求帽的回填清单**（仅当 fail 根因是 SPEC/task 缺口时填写；无则写「无」）。

---

## 回填闭环

- 需求帽入口：工作区根 **`docs/harness/prompts/10-requirements.md`**  
- 文档已按清单修正后：可在本文件顶部标注 **「文档已回填 / PR」**。

---

## 与后端 `docs/tasks/reinspect_results/` 的分工

- 复检对象为 **`ai-ink-brain-api-python`** 任务 / PR 时，归档 **优先** 落在：  
  **`ai-ink-brain-api-python/docs/tasks/reinspect_results/`**。  
- 本目录主要用于 **前端** 任务复检或备忘。

---

## 给 Cursor 的稳定关键词

`Harness`、`复检帽`、`reinspect_results`、`pass/fail`、`证据`、`阻塞合并`、`回填`
