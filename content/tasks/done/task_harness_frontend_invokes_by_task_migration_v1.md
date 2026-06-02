# 迁移前端 Harness invokes 至 by-task taxonomy

> **状态**：done（2026-06-02 · HG-MIGRATION-REVIEW approved · 前端签收）  
> **task_slug**：`harness-frontend-invokes-by-task-migration`  
> **git_branch**：`task/harness-frontend-invokes-by-task-migration`  
> **关联**：`[content/harness/invokes/MIGRATION_flat_invoke_index.md](../../harness/invokes/MIGRATION_flat_invoke_index.md)` · 后端 `[docs/harness/README.md](../../../../ai-ink-brain-api-python/docs/harness/README.md)` §2.1  
> **配对后端 task**：`ai-ink-brain-api-python` · `task/harness-invokes-by-task-prompts-sync`（prompts / rules 同步）

---

## Harness 元信息


| 字段                 | 值                                             |
| ------------------ | --------------------------------------------- |
| **task_slug**      | `harness-frontend-invokes-by-task-migration`  |
| **test_strategy**  | `not_applicable`（仅文档 / 路径迁移，无业务代码）            |
| **semi_auto**      | `true`                                        |
| **audit_profile**  | `light`                                       |
| **kpi_rubric**     | `KPI_RUBRIC_v1_2`                             |
| **kpi_aggregator** | `CLOSE`                                       |
| **freeze_id**      | `HARNESS-FRONTEND-INVOKES-BY-TASK@2026-06-02` |


### 人工闸


| human_gate_id       | status   | blocks_hats | 说明                |
| ------------------- | -------- | ----------- | ----------------- |
| HG-MIGRATION-REVIEW | approved | done        | 人确认迁移映射与 grep 零残留 |


---

## 背景与目标

前端 `content/harness/invokes/` 根目录遗留 **17 个** P1-4 前扁平 `invoke_*.md`，与后端已完成的 `by-task/<task_slug>/` taxonomy 不一致，导致 Agent 续跑时仍可能落盘到根目录。

**完成态**：

1. 根目录 **无** 新增/遗留 `invoke_*.md`（仅 `README.md` + `MIGRATION_flat_invoke_index.md` + `by-task/`）
2. 全部历史 invoke 按 slug 归入 `by-task/`
3. `reviews/`、`content/tasks/done/` 内链接已更新
4. 后端 prompts / `05-harness-semi-auto` 同步 by-task 路径（配对 PR）

---

## 范围

- 建立 `MIGRATION_flat_invoke_index.md`
- `git mv` 17 个扁平 invoke → 5 个 slug 子目录
- 批量更新 invoke 内 `prev_invoke` 交叉引用
- 更新 `content/harness/reviews/` 中 5 份 review 链接
- 更新 `content/tasks/done/` 相关 task 路径
- `rg` 验收：无 `content/harness/invokes/invoke`_ 残留（本索引 / task 正文除外）
- 更新 `content/harness/invokes/README.md` · `by-task/README.md`
- 更新 `content/harness/README.md` §2

## 非范围

- 不迁移 `content/harness/reviews/` 至 `reviews/by-task/`（可选 P2）
- 不补建未入库的 10/22 vercel invoke 全文
- 不改 `app/` / `components/` 业务代码

---

## 执行步骤（前端 Agent · 可复制）

### Phase 0 · 开分支

```bash
cd ai-ink-brain
git fetch origin
git checkout main && git pull --ff-only   # 或从当前 task 分支 rebase
git checkout -b task/harness-frontend-invokes-by-task-migration
```

### Phase 1 · 物理迁移（已完成 2026-06-02）

映射见 `[MIGRATION_flat_invoke_index.md](../../harness/invokes/MIGRATION_flat_invoke_index.md)`。示例：

```bash
mkdir -p content/harness/invokes/by-task/frontend-vercel-ai-sdk-main-stream
git mv content/harness/invokes/invoke_20260520_30_frontend-vercel-ai-sdk-main-stream-execute.md \
       content/harness/invokes/by-task/frontend-vercel-ai-sdk-main-stream/
# … 对其余 16 个文件重复（见索引表）
```

### Phase 2 · 引用更新

```bash
# 应返回 0（除 MIGRATION 索引「原路径」列）
rg 'content/harness/invokes/invoke_' content/ --glob '*.md'
rg '\.\./invokes/invoke_' content/harness/reviews/
```

已用脚本更新 17 个 md；若仍有残留，按索引表手动替换为 `by-task/<slug>/` 前缀。

### Phase 3 · README 同步

- `content/harness/invokes/README.md`：删除「历史根目录只读」表述，改为「根目录禁止新增 invoke」
- `content/harness/invokes/by-task/README.md`：补全 5 个迁移 slug 表
- `content/harness/README.md` §2：注明迁移完成日期

### Phase 4 · 验收

```bash
ls content/harness/invokes/invoke_*.md 2>/dev/null | wc -l   # 期望 0
find content/harness/invokes/by-task -name 'invoke_*.md' | wc -l  # 期望 ≥31（14 原有 + 17 迁移）
pnpm lint && pnpm test && pnpm build   # 文档 task 仍建议绿（无代码变更也应过）
```

### Phase 5 · 与并行 task 合并

若同时在 `task/portfolio-content-pages-v1` 等分支开发：

```bash
git rebase task/portfolio-content-pages-v1   # 或 merge，择一
# 冲突优先保留 by-task 路径
```

---

## 与当前 active task 协同


| 并行 task                      | 建议                                                                 |
| ---------------------------- | ------------------------------------------------------------------ |
| `portfolio-content-pages-v1` | invoke **已**在 `by-task/portfolio-content-pages-v1/`，与本迁移 **无路径冲突** |
| 其他 active task               | 新 invoke **必须**落 `by-task/<task_slug>/`；勿再写根目录                     |


本迁移 PR 可与 portfolio PR **独立合并**；合并顺序建议：**先本迁移 PR**（清掉 Agent 歧义），再 feature PR。

---

## 失败路径


| #   | 触发                       | 行为                      |
| --- | ------------------------ | ----------------------- |
| F1  | `git mv` 后 review 链接 404 | 按 MIGRATION 索引修相对路径     |
| F2  | 与 portfolio 分支冲突         | 保留 by-task 侧，人工 resolve |
| F3  | grep 仍有 flat 引用          | 禁止关账，补 commit           |


---

## 自检结论（执行者）

- **迁移执行**：2026-06-02 · 17 文件 `git mv` · 17+ md 引用更新
- **grep 残留**：2026-06-02 终验通过（仅 MIGRATION / task 文档含示例命令）
- **VERIFY**：文档 task · 无 app 变更
- **签收**：2026-06-02 · `HG-MIGRATION-REVIEW` approved · Projects prompts rsync 已执行

---

## 给 Cursor

`invoke`、`by-task`、`MIGRATION_flat_invoke_index`、`task_slug`、`git mv`