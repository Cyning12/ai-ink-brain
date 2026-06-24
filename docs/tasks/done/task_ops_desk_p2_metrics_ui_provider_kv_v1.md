# Task · Ops Desk P2-5d-fix · Metrics UI · Provider KV（前端子仓）

> **状态**：`done` · merged · 2026-06-24  
> **协调 task**：Projects [`task_ops_desk_p2_metrics_ui_provider_kv_v1.md`](../../../../docs/harness/tasks/done/task_ops_desk_p2_metrics_ui_provider_kv_v1.md)  
> **invoke**：[`PROMPT_CHAIN_30_40_50_CLOSE_v1.md`](../../../../docs/harness/invokes/by-task/ops-desk-p2-metrics-ui-provider-kv/PROMPT_CHAIN_30_40_50_CLOSE_v1.md)  
> **父 task**：[P2-5d #94](https://github.com/Cyning12/ai-ink-brain/pull/94) · `8c09fe8`

---

## 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-desk-p2-metrics-ui-provider-kv` |
| **test_strategy** | `recommended` |
| **分支** | `task/ops-desk-p2-metrics-ui-provider-kv` |

---

## 目标

在现有 `/ops/kimi-code/metrics` 页增加 **Provider KV 缓存** 展示，透传 Python summary 增量字段；**不改** Demo 缓存卡片。

---

## 交付清单

- [x] `lib/ops/metrics-summary.ts` — optional `provider_cache_*` · `formatProviderCacheHitRate`
- [x] `components/ops/ops-metrics-summary.tsx` — Provider KV MetricCard
- [x] `lib/ops/metrics-summary.test.ts` — format 单测
- [x] 页眉副标题更新

---

## 展示纪律

- Demo：`formatDemoCacheHitRate` · 副标题 **Demo 缓存** — **保持 P2-5d 行为**
- Provider KV：`formatProviderCacheHitRate` · 副标题 **Provider KV 缓存 · SiliconFlow**
- 禁止把 Provider KV 写入 Demo 命中率

---

## 自检

**结果**：2026-06-24 · lint 0 errors · test 143 passed · build OK

---

## 非范围

api-python · BFF route 逻辑变更 · by_route Provider 列 · chart 库
