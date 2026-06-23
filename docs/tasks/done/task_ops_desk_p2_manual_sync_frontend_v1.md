# Task · Ops Desk P2-3 · Manual Sync（前端）

> **状态**：done（2026-06-23 · #89 merged）  
> **SCOPE**：[`SCOPE_NOTE_manual_sync_v1_zh.md`](../../../../docs/harness/invokes/by-task/ops-desk-p2-manual-sync/SCOPE_NOTE_manual_sync_v1_zh.md)  
> **协调**：[`task_ops_desk_p2_manual_sync_v1.md`](../../../../docs/harness/tasks/active/task_ops_desk_p2_manual_sync_v1.md)  
> **依赖**：P0 总览 `SyncStatus` ✅ · 后端 trigger API（泳道 A）

---

## Harness 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-desk-p2-manual-sync-frontend` |
| **test_strategy** | `recommended` |
| **freeze_id** | `OPS-DESK-KIMI-CODE-P2-MANUAL-SYNC-FE` |
| **git_branch** | `task/ops-desk-p2-manual-sync-frontend` |
| **worktree_root** | `ai-ink-brain/` |
| **Open Folder** | `ai-ink-brain/` |

---

## 背景与目标

在 Ops Desk 总览为 **maintainer** 提供「立即同步」与 **最近 sync 运行记录**；访客仅保留现有 `SyncStatus` 只读条。

### 完成态

- [ ] `components/ops/manual-sync-button.tsx`（client · maintainer only）
- [ ] `components/ops/sync-run-history.tsx`（最近 N 条 · status/trigger/计数/错误）
- [ ] `app/api/ops/sync/trigger/route.ts` · 可选 `.../runs/route.ts` BFF → `PY_API_URL` + `x-ops-secret`
- [ ] 总览页集成：按钮 + 历史表（`app/ops/kimi-code/page.tsx`）
- [ ] `lib/ops/data.ts`：`getRecentSyncRuns()` 或 client fetch via BFF
- [ ] 触发后：toast + 短轮询刷新列表 / `router.refresh()`
- [ ] 单测：maintainer 门禁 · 409 文案 · 空列表
- [ ] `pnpm lint` · `pnpm test` · `pnpm build` 绿

---

## UI 口径

| 区块 | 规则 |
| --- | --- |
| 立即同步 | 仅 `session.role === "maintainer"` 可见 · running 时 disabled |
| Sync 历史 | 默认 10–20 条 · 列：时间 · trigger · status · Issue/PR 计数 · graph/scan 图标 |
| 错误 | 展示 `error_message` 截断 · 可展开 |
| 访客 | 不显示按钮 · 可选折叠「同步历史（只读）」或隐藏 |

---

## 数据契约

```typescript
interface SyncRunListItem {
  id: string;
  started_at: string;
  finished_at: string | null;
  status: "pending" | "running" | "success" | "failed" | "partial";
  trigger: "cron" | "manual" | "initial";
  records_issue: number;
  records_pr: number;
  error_message: string | null;
  has_graph_snapshot: boolean;
  has_scan_snapshot: boolean;
}
```

后端未 merge 前：fixture `tests/fixtures/sync_runs_v1.json` mock。

---

## 非范围

- Python dispatch 实现 · GHA YAML
- 全页 `/ops/kimi-code/sync`（MVP 放总览即可）
- Chat sync 意图

---

## 失败路径

| 场景 | UI |
| --- | --- |
| 409 已在跑 | 「同步进行中，请稍后再试」 |
| 503 token 未配 | 「服务端未配置 dispatch，请联系维护者」 |
| 列表空 | 「尚无同步记录」 |

---

## 并行开发

| 阶段 | 做法 |
| --- | --- |
| A 未 merge | fixture + mock fetch |
| A merge 后 | 联调真实 trigger + runs API · rebase origin/main |

---

## 验收标准

- [ ] maintainer 可触发 · 访客无按钮
- [ ] 历史表与 `SyncStatus` 数据一致
- [ ] 50 reinspect pass · PR merge main

---

## 给 Cursor

泳道 B · **A merge 后再最终联调** · 参照 P2-1 graph-tab 前端纪律。
