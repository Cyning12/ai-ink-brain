# Portfolio W6 · 五问 E2E · 验收清单（关账前 · 维护者用）

| 项 | 内容 |
|----|------|
| **task** | `docs/tasks/active/task_portfolio_e2e_demo_qa_v1.md` |
| **task_slug** | `portfolio-e2e-demo-qa-v1` |
| **freeze_id** | `PORTFOLIO-RAG-DEMO@2026-06-01` |
| **分支** | `task/portfolio-e2e-demo-qa-v1` |
| **deadline** | 2026-06-09 上午 |
| **Agent 批次** | 2026-06-03（30–50 · 关账前） |
| **50 复检** | `task_portfolio_e2e_demo_qa_v1_reinspect_20260603.md` |

> 在 **Preview 或生产** URL 上逐项勾选。关账须：五问全绿 + 录屏 + **HG-REINSPECT** approved + CLOSE。

---

## A. 环境与同源（§6.7）

| # | 检查项 | 通过标准 | Agent 2026-06-03 | 维护者 |
|---|--------|----------|------------------|--------|
| A1 | 同一 Vercel 项目 | 不另起第二套前后端 | — | ☐ |
| A2 | `NEXT_PUBLIC_SITE_MODE=portfolio` | Preview+build | portfolio build ✅ | ☐ URL |
| A3 | Supabase / `EMBEDDING_DIM` | 与生产同项目 | 未验 | ☐ |
| A4 | `PY_API_URL` | 指向 api-python | 8000 down | ☐ |
| A5 | `CONTENT_ROOT` | 本仓 content/ | 文档对齐 | ☐ |
| A6 | ChatBI token 解锁 | verify 200 · 可发消息 | 历史日志有 200 | ☐ |
| A7 | access_level 档位 | 2→visitor · 0/1→admin UI | 代码已冻结 | ☐ |

---

## B. sync（F1）

| # | 检查项 | 通过标准 | Agent | 维护者 |
|---|--------|----------|-------|--------|
| B1 | 三目录 md | 各 ≥1 | ✅ | ☐ |
| B2 | sync 脚本 | 新卷后执行 | 未 force | ☐ |
| B3 | POST admin/sync | 成功 | 未执行 | ☐ |
| B4 | filesScanned | >0 | 未测 | ☐ |
| B5 | chunksUpserted | >0 | 未测 | ☐ |
| B6 | jobId 留证 | reinspect/task | 空 | ☐ |

---

## C. 四屏（200）

| 路由 | build 路由 | 维护者实测 |
|------|------------|------------|
| `/` | ✅ | ☐ |
| `/resume` | ✅ | ☐ |
| `/methodology` | ✅ | ☐ |
| `/evidence` | ✅ | ☐ |
| `/unified-chat` | ✅ | ☐ |

---

## D. 五问（chip 逐字见 task 表）

**全绿**：5/5 能答 · sources ≥4/5 · 重试 ≤3/问。

| ID | 能答 | sources OK | 重试≤3 | 维护者 |
|----|------|------------|--------|--------|
| Q1 | ☐ | ☐ vol3 | ☐ | ☐ |
| Q2 | ☐ | ☐ resume·非降级 | ☐ | ☐ |
| Q3 | ☐ | ☐ evidence only | ☐ | ☐ |
| Q4 | ☐ | ☐ resume | ☐ | ☐ |
| Q5 | ☐ | ☐ evidence | ☐ | ☐ |

预跑基线：Q1/Q4 OK · Q2 降级 · Q3/Q5 sources 松 — **关账前须复验**。

---

## E. 录屏（3–5 min）

| 镜头 | 维护者 |
|------|--------|
| methodology 卷三 | ☐ |
| unlock 说明 | ☐ |
| Q1 + sources | ☐ |
| Q5 + sources | ☐ |
| sources 特写 | ☐ |

路径：_________________

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
| HG-REINSPECT | **pending** |
| KPI + git mv done | **未** |

---

## H. 维护者签收

| ☐ 可关账（A–G 全绿 + HG-REINSPECT approved） |
| ☐ 豁免（注明：________） |
| ☐ 仍阻塞（________） |

签字/日期：________
