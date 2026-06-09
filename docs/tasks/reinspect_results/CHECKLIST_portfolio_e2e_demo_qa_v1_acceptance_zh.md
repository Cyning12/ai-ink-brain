# Portfolio W6 · 五问 E2E · 验收清单（关账前 · 维护者用）

| 项 | 内容 |
|----|------|
| **task** | `docs/tasks/done/task_portfolio_e2e_demo_qa_v1.md` |
| **task_slug** | `portfolio-e2e-demo-qa-v1` |
| **freeze_id** | `PORTFOLIO-RAG-DEMO@2026-06-01` |
| **分支** | `task/portfolio-e2e-demo-qa-v1` |
| **deadline** | 2026-06-09 上午 |
| **Agent 批次** | 2026-06-03（30–50 · 关账前） |
| **50 复检** | `task_portfolio_e2e_demo_qa_v1_reinspect_20260603.md` |
| **维护者签收批次** | 2026-06-03（A/B/D/E · sync/五问/录屏留证） |

> 在 **Preview 或生产** URL 上逐项勾选。关账须：五问全绿 + 录屏 + **HG-REINSPECT** approved + CLOSE。

---

## A. 环境与同源（§6.7）

| # | 检查项 | 通过标准 | Agent 2026-06-03 | 维护者 |
|---|--------|----------|------------------|--------|
| A1 | 同一 Vercel 项目 | 不另起第二套前后端 | — | ☑ 2026-06-03 |
| A2 | `NEXT_PUBLIC_SITE_MODE=portfolio` | Preview+build | portfolio build ✅ | ☑ |
| A3 | Supabase / `EMBEDDING_DIM` | 与生产同项目 | 未验 | ☑ 维护者确认同项目 |
| A4 | `PY_API_URL` | 指向 api-python | 8000 down | ☑ W6 联调通过 |
| A5 | `CONTENT_ROOT` | 本仓 content/ | 文档对齐 | ☑ |
| A6 | ChatBI token 解锁 | verify 200 · 可发消息 | 历史日志有 200 | ☑ |
| A7 | access_level 档位 | 2→visitor · 0/1→admin UI | 代码已冻结 | ☑ |

---

## B. sync（F1）

| # | 检查项 | 通过标准 | Agent | 维护者 |
|---|--------|----------|-------|--------|
| B1 | 三目录 md | 各 ≥1 | ✅ | ☑ |
| B2 | sync 脚本 | 新卷后执行 | 未 force | ☑ W6 清语料后执行 |
| B3 | POST admin/sync | 成功 | 未执行 | ☑ |
| B4 | filesScanned | >0 | 未测 | ☑ **3** |
| B5 | chunksUpserted | >0 | 未测 | ☑ **72** |
| B6 | jobId 留证 | reinspect/task | 空 | ☑ **`c44158a5-6e28-4583-ab6b-f5db9ca1866d`** |

**说明（W6 · 维护者）**：W5 语料过多导致五问噪音；W6 将 `content/` 精简为 Portfolio 终版后 **重新验收并重跑 sync**。同一 jobId 为 W6 测试留证（非 W5 旧语料批次语义）。JSON 见配对后端 `ai-ink-brain-api-python/docs/diary/samples/portfolio-rag-demo/sync-job-final.json` · 摘要 `sync-job-summary.md` §W6。

---

## C. 四屏（200）

| 路由 | build 路由 | 维护者实测 |
|------|------------|------------|
| `/` | ✅ | ☑ |
| `/resume` | ✅ | ☑ |
| `/methodology` | ✅ | ☑ |
| `/evidence` | ✅ | ☑ |
| `/unified-chat` | ✅ | ☑ |

---

## D. 五问（chip 逐字见 task 表 · `portfolio-demo-chips.ts`）

**全绿**：5/5 能答 · sources ≥4/5 · 重试 ≤3/问。

| ID | 能答 | sources OK | 重试≤3 | 维护者 |
|----|------|------------|--------|--------|
| Q1 | ☑ | ☑ methodology | ☑ 0 | ☑ |
| Q2 | ☑ | ☑ resume·非降级 | ☑ 0 | ☑ |
| Q3 | ☑ | ☑ evidence only | ☑ 0 | ☑ |
| Q4 | ☑ | ☑ resume | ☑ 0 | ☑ |
| Q5 | ☑ | ☑ evidence-card | ☑ 0 | ☑ |

**详细 JSON + Execution Trace 截图（冻结 · 配对后端仓）**：

```text
ai-ink-brain-api-python/docs/diary/samples/portfolio-rag-demo/
├── five-questions-results.md
├── q1-sources-run1.json · q1-sources-run2.json
├── q2-sources-run1.json · q3-sources-run1.json · q4-sources-run1.json
├── q5-sources-run1.json · q5-sources-run2.json
└── screenshots/q*-execution-trace-20260603.png
```

W6 交叉引用：`task_portfolio_e2e_demo_qa_v1_reinspect_20260603.md` §W6 维护者留证。

---

## E. 录屏（3–5 min）

| 镜头 | 维护者 |
|------|--------|
| methodology 卷三 | ☑ |
| unlock 说明 | ☑ |
| Q1 + sources | ☑ |
| Q5 + sources | ☑ |
| sources 特写 | ☑ |

**路径（本地 · 不进 Git）**：`~/Desktop/录屏2026-06-03 18.15.00.mov`

> 投递 P0-D 口径为 **屏幕录制**；五问 JSON/截图见 §D 后端目录。

---

## F. CI

| 命令 | Agent |
|------|-------|
| pnpm lint | ✅ |
| pnpm test | ✅ 45 |
| pnpm build | ✅ |
| NEXT_PUBLIC_SITE_MODE=portfolio pnpm build | ✅ |

---

## G. Harness（CLOSE 前）

| 工件 | 状态 |
|------|------|
| 22 R1/R2 reviews | ✅ |
| 50 reinspect | ✅ |
| HG-REINSPECT | ✅ **approved** · 2026-06-03 |
| KPI + git mv done | ✅ |

---

## H. 维护者签收

| ☑ 演示层 A–F 全绿（2026-06-03） |
| ☑ 可关账（HG-REINSPECT approved · CLOSE 2026-06-03） |
| ☐ 豁免（注明：________） |
| ☐ 仍阻塞（________） |

签字/日期：维护者 · 2026-06-03
