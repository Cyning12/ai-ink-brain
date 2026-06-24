# Task · Ops Desk P2-5d · Metrics 摘要 UI（前端子仓）

> **状态**：`done` · script CLOSE · 人验 pending · 2026-06-24  
> **协调 task**：Projects [`task_ops_desk_p2_metrics_ui_v1.md`](../../../../docs/harness/tasks/done/task_ops_desk_p2_metrics_ui_v1.md)  
> **invoke**：[`PROMPT_CHAIN_30_40_50_CLOSE_v1.md`](../../../../docs/harness/invokes/by-task/ops-desk-p2-metrics-ui/PROMPT_CHAIN_30_40_50_CLOSE_v1.md)  
> **分支**：`task/ops-desk-p2-metrics-ui-frontend`

---

## 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-desk-p2-metrics-ui` |
| **test_strategy** | `recommended` |
| **分支** | `task/ops-desk-p2-metrics-ui-frontend` |

---

## 目标

在 Ops Desk（`/ops/kimi-code`）增加 **Metrics** 只读页，展示 Python 已有 `GET /ops/metrics/summary`。

---

## 交付清单

- [x] `app/api/ops/metrics/summary/route.ts` — GET · `requireOpsDeskAccess` · `forwardOpsRequest('/api/py/ops/metrics/summary?…')`
- [x] `app/ops/kimi-code/metrics/page.tsx` — Client 拉 BFF · 展示摘要卡片 + by_route 表
- [x] `components/ops/ops-metrics-summary.tsx`
- [x] `layout.tsx` 导航增加 Metrics 链接
- [x] 单测：BFF route mock · format 函数单测
- [x] `docs/_tech_graph/_manifest.json` 增 `GET /api/ops/metrics/summary`

---

## 展示要求

- `cache_hit_rate` → `(rate * 100).toFixed(2) + '%'`，副标题 **Demo 缓存**（`ops_demo_answers`）
- 字段：`total_runs` · `total_tokens` · `total_llm_calls` · `cache_hits` / `cache_misses`
- `by_route`：route · runs · tokens · llm_calls · cache_hits
- `days` 选择：7 默认 · 可 1/7/30

---

## 自检

```bash
pnpm lint && pnpm test && pnpm build
python3 ../ai-ink-brain-api-python/tools/tech_graph_manifest_check.py --repo frontend --repo-root .
```

**结果**：2026-06-24 · lint 0 errors · test 140 passed · build OK · manifest OK

---

## 非范围

- 不改 api-python
- 不做 Provider 切换 UI · 不做 Langfuse 嵌入
