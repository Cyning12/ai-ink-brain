# Task · Ops Desk P2-2 · Scan Ingest（前端）

> **状态**：`done（2026-06-22 验收通过）`  
> **SPEC**：§6 · §10  
> **协调**：[`task_ops_desk_p2_scan_ingest_v1.md`](../../../../docs/harness/tasks/active/task_ops_desk_p2_scan_ingest_v1.md)  
> **依赖**：P0-5 issues 页 ✅ · P0-4 总览 ✅ · 后端 DDL 契约（R5 §3.3）

---

## Harness 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-desk-p2-scan-ingest-frontend` |
| **test_strategy** | `recommended` |
| **freeze_id** | `OPS-DESK-KIMI-CODE-P2-SCAN-INGEST-FE` |
| **git_branch** | `task/ops-desk-p2-scan-ingest-frontend` |
| **worktree_root** | `ai-ink-brain/` |
| **Open Folder** | `ai-ink-brain/` |

---

## 背景与目标

消费 `ops_scan_snapshots` 与 `ops_issues.scan_tags`（Supabase 直读 · 与 P0 看板一致），在总览/Issues 展示 ISSUE_SCAN 版本与 tier 标签；支持按 scan tag 筛选。

### 完成态

- [x] `lib/ops/data.ts`：`getLatestScanSnapshot()` · 类型定义
- [x] 总览页：Scan 摘要卡片（版本 · open 数 · P0/P1/P2 计数 · 链接主索引 GitHub/raw）
- [x] Issues 页：`scan_tags` 列已有 · 增加 **scan tag 筛选** query param
- [x] `tests/fixtures/ops_scan_snapshot_v1.json` · 单测/mock 联调（后端未 merge 前）
- [x] `pnpm lint` · `pnpm test` · `pnpm build` 绿

---

## 数据契约（与后端对齐）

```typescript
// ops_scan_snapshots 最新一行（按 created_at desc）
interface ScanSnapshotSummary {
  scan_version: string;
  total_open: number | null;
  p0_items: unknown[];
  p1_items: unknown[];
  p2_items: unknown[];
  deferred_items: unknown[];
  parsed_summary: Record<string, unknown> | null;
  created_at: string;
}
```

`ops_issues.scan_tags`：`text[]` · 已有列 · Issues 表已渲染。

---

## 非范围

- Python parser / GHA
- BFF 代理 `/api/py/ops/scan/summary`（可选 bonus · 非阻塞）
- Chat scan_status（P2 收口）

---

## 并行开发

| 阶段 | 做法 |
| --- | --- |
| 后端未 merge | 用 `tests/fixtures/ops_scan_snapshot_v1.json` + 单测 mock Supabase |
| 后端 merge 后 | 联调真实 `ops_scan_snapshots` · 去掉 mock 默认 |

**合并**：后端 PR merge 后再 merge 前端 PR（或 rebase origin/main）。

---

## 失败路径

| 场景 | UI |
| --- | --- |
| 无 snapshot 行 | 总览 Scan 卡片显示「尚未 ingest」· 不阻塞看板 |
| Supabase 失败 | 与 P0 一致 · `OpsDataError` 结构化提示 |

---

## 验收标准

- [x] 单测覆盖 scan summary 渲染 / filter 逻辑
- [x] build 含 `/ops/kimi-code` · `/ops/kimi-code/issues`
- [x] 50 reinspect pass · PR #86 merge main

---

## 给 Cursor

泳道 B · 与后端 **并行** · fixture 先行 · **后端 merge 后再最终联调**。
