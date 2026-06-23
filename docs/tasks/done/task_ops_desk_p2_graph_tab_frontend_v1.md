# Task · Ops Desk P2-1 · Graph Tab（前端）

> **状态**：`pending`  
> **SPEC**：§6 · §10  
> **协调**：[`task_ops_desk_p2_graph_tab_v1.md`](../../../../docs/harness/tasks/active/task_ops_desk_p2_graph_tab_v1.md)  
> **依赖**：P0-5 issues 页 ✅ · P2-2 scan UI ✅ · 后端 graph API 契约（R5 · R6）

---

## Harness 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-desk-p2-graph-tab-frontend` |
| **test_strategy** | `recommended` |
| **freeze_id** | `OPS-DESK-KIMI-CODE-P2-GRAPH-TAB-FE` |
| **git_branch** | `task/ops-desk-p2-graph-tab-frontend` |
| **worktree_root** | `ai-ink-brain/` |
| **Open Folder** | `ai-ink-brain/` |

---

## 背景与目标

新增 `/ops/kimi-code/graph` 页：展示 graph 快照版本与 **模块×Issue 矩阵**；并在 Issues 页补 **「清空所有筛选」** 按钮（P2-2 人验 follow-up）。

### 完成态

- [ ] 导航：`layout.tsx` 增加 Graph Tab 入口
- [ ] `app/ops/kimi-code/graph/page.tsx`：快照元数据 + 矩阵表
- [ ] `lib/ops/data.ts`：`getLatestGraphSnapshot()` · `getGraphModuleIssues()` · 类型
- [ ] Issues 页：「清空所有筛选」按钮 · 重置 `state` · `label` · `scan_tag` · `module` · `age` 等 query
- [ ] `tests/fixtures/graph_snapshot_sample_v1.json` · `graph_module_issues_v1.json`
- [ ] `pnpm lint` · `pnpm test` · `pnpm build` 绿

---

## 数据契约

```typescript
interface GraphSnapshotSummary {
  source_branch: string;
  source_commit: string | null;
  manifest_version: string | null;
  node_count: number;
  edge_count: number;
  created_at: string;
}

interface GraphModuleRow {
  module_id: string;
  label: string;
  graph_id: string;
  open_issue_count: number;
  sample_issues?: Array<{ number: number; title: string; html_url: string }>;
}
```

**读取策略**：与 P0/P2-2 一致 · Supabase 直读 `ops_graph_snapshots`；后端 API merge 后可选切换 BFF proxy。

---

## Graph Tab UI（MVP）

| 区块 | 内容 |
| --- | --- |
| 快照条 | `source_branch` · `manifest_version` · `created_at` · node/edge 计数 |
| 矩阵表 | 列：模块 ID · 标签 · flow · open issue 数 · 跳转 Issues（带 `?module=`） |
| 空态 | 无 snapshot →「尚未 ingest graph.json」· 不阻塞其他 Tab |

**非 MVP**：交互式拓扑图 · 边展开 · Chat 深链。

---

## Issues 清空筛选（P2-2 follow-up）

| 项 | 要求 |
| --- | --- |
| 位置 | Issues 页筛选区 · 与现有 state/label/scan_tag 并列 |
| 文案 | 「清空所有筛选」 |
| 行为 | 清除全部 filter query · 恢复全量列表 · URL 同步 |
| 可见性 | 有任一 active filter 时显示 · 无 filter 时 disabled 或隐藏 |

---

## 非范围

- Python graph ingest / GHA
- Chat `graph_module` Demo 接线
- 全量 graph 可视化引擎

---

## 并行开发

| 阶段 | 做法 |
| --- | --- |
| 后端未 merge | fixture mock · 单测覆盖 matrix 渲染 |
| 后端 merge 后 | 联调真实 `ops_graph_snapshots` + API |

**合并**：后端 PR merge 后再 merge 前端 PR（或 rebase origin/main）。

---

## 失败路径

| 场景 | UI |
| --- | --- |
| 无 graph snapshot | Graph Tab 空态 · 其他页正常 |
| Supabase 失败 | 与 P0 一致 · 结构化错误提示 |

---

## 验收标准

- [ ] 单测：matrix 渲染 · clear-filters 逻辑
- [ ] build 含 `/ops/kimi-code/graph`
- [ ] Issues 清空筛选人验可勾选（P2-1 checklist）
- [ ] 50 reinspect pass · PR merge main

---

## 给 Cursor

泳道 B · 与后端 **并行** · fixture 先行 · **后端 merge 后再最终联调**。
