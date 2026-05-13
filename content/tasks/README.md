# content/tasks/ 使用规则（v1）

> 目标：与后端 `ai-ink-brain-api-python/docs/tasks/` **同一分类**：`active/`（进行中）、`done/`（归档）、索引视图 `_views/`，避免根目录长期堆积与状态误判。

---

## 工作区 Harness 任务（不在本目录）

与 **跨子仓流程 / CI 门禁对齐 / 帽子 prompts / 根级验收** 相关的任务单已统一放在工作区：

- **`docs/harness/tasks/active/`**、**`docs/harness/tasks/done/`**  
- 规则与索引：**[`../../../docs/harness/tasks/README.md`](../../../docs/harness/tasks/README.md)**（相对本文件：`Projects/docs/harness/tasks/README.md`）

本目录 **`content/tasks/`** 仅承载 **前端业务** 任务；勿再将 Harness 类任务长期放在此处，以免与 `AGENTS.md` §2.2 漂移。

---

## 目录结构

```
content/tasks/
  README.md                # 本文件：落盘与归档规则
  _views/                  # 状态视图索引（聚合链接）
  active/                  # 设计中 / 待开始 / 进行中（task_*.md）
  done/                    # 已完成（归档目录）
  templates/               # 任务模板（TASK_TEMPLATE.md）
```

---

## 新增任务如何落盘（必须遵守）

- **新建位置**：一律放在 `content/tasks/active/`
- **命名规则**：`task_<domain>_<topic>_vN.md`（与历史任务风格一致）
- **必须字段**：任务头部必须包含 `> **状态**：...`（或等价一行状态说明）

允许状态集合：

- `draft` / `design`
- `pending`
- `in_progress`
- `implemented`（代码已合并，**验收勾选**仍可能未完成）
- `done` 或 `done（YYYY-MM-DD 验收通过）`

---

## 任务归档流程（验收后必做）

当任务验收通过（正文「验收标准」已勾选完成或已书面签核）：

1. 将头部 `状态` 改为 `done（YYYY-MM-DD 验收通过）`。
2. 在仓库根执行：  
   `git mv content/tasks/active/<文件名>.md content/tasks/done/`
3. 在 `content/tasks/_views/done.md` 追加指向 `../done/<文件名>.md` 的条目。
4. 若该任务出现在 `content/tasks/_views/in_progress.md`，同步移除或更新。
5. **配对后端任务**（若正文引用 `ai-ink-brain-api-python/docs/tasks/...`）：在后端仓按该仓 `docs/tasks/README.md` 将对应任务归档至 `docs/tasks/done/` 并更新其 `_views/done.md`。

> **`docs/spec/`、`docs/_tech_graph/`** 等规格与图谱**不因任务归档而搬迁**，持续在各自目录维护。

---

## 视图索引维护规则（最小集）

- `content/tasks/_views/design.md`：`draft` / 缺状态字段清单
- `content/tasks/_views/in_progress.md`：`in_progress` / 关键 `implemented` 待验收项（按需）
- `content/tasks/_views/done.md`：已完成任务链接

---

## 常见坑（避免）

- 不要把已完成任务留在 `active/`（会误导 Agent 判断「仍在进行」）
- 不要把 `README.md`、`_views/`、`templates/` 下的说明当作可发布博客正文（站点扫描已排除这些路径/文件名，见 `lib/content/mdx-posts.ts`）
