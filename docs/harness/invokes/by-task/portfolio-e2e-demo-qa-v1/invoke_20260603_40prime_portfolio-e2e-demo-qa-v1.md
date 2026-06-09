# Invoke · 40′ · 关账复核 · portfolio-e2e-demo-qa-v1

| 字段 | 值 |
|------|-----|
| **hat_code** | `40′`（CLOSE 前验收复核 · prime） |
| **task_slug** | `portfolio-e2e-demo-qa-v1` |
| **task_path** | `docs/tasks/active/task_portfolio_e2e_demo_qa_v1.md` |
| **git_branch** | `task/portfolio-e2e-demo-qa-v1` |
| **predecessor** | `invoke_20260603_50_portfolio-e2e-demo-qa-v1.md`（历史 50 · 本复核不推翻） |
| **date** | 2026-06-03 |
| **judgment** | **blocked** → **STOP**（不得 50′ 续跑 · 不得 CLOSE） |

---

## Step 0 · 已读

| 路径 | 用途 |
|------|------|
| `docs/tasks/active/task_portfolio_e2e_demo_qa_v1.md` | W6 task · HG-REINSPECT **pending** |
| `docs/tasks/reinspect_results/CHECKLIST_portfolio_e2e_demo_qa_v1_acceptance_zh.md` | §A–H · 维护者列 **未勾** |
| `docs/tasks/reinspect_results/task_portfolio_e2e_demo_qa_v1_reinspect_20260603.md` | 50 pass-with-notes |
| `lib/unified-chat/portfolio-demo-chips.ts` | chip **唯一真值** |
| 配对后端只读 `docs/diary/samples/portfolio-rag-demo/` | W5 sync/五问 Tranche 1（**非** W6 checklist 签收） |

---

## Step 1 · 静态复核

| 项 | 结果 | 证据 |
|----|------|------|
| 分支 | ✅ | `task/portfolio-e2e-demo-qa-v1` |
| content 三目录 | ✅ | `methodology/` 1 md · `resume/cv-online.md` · `evidence/evidence-card.md`（+ `methodology-card.md` 冗余） |
| Q5 语料 | ✅ | `content/evidence/evidence-card.md` 存在 |
| Q1 语料 | ⚠️ | 卷三文件已重命名（无 `vol3_*` 前缀）；sync 后须复验 sources |
| `pnpm lint` | ✅ | exit 0 · 2026-06-03 18:01 |
| `pnpm test` | ✅ | 12 files · 45 passed |
| `pnpm build` | ✅ | exit 0 · 五路由含 `/unified-chat` |
| `NEXT_PUBLIC_SITE_MODE=portfolio pnpm build` | ✅ | exit 0 |

---

## Step 2 · 演示层 · checklist §A–G 复核表

| 段 | 判定 | 说明 |
|----|------|------|
| **§A 环境** | ☐ 未关 | A2 portfolio build ✅；A3–A7 · Preview URL · token **维护者未签** |
| **§B sync（F1）** | ❌ **FAIL** | W6 checklist B3–B6 空；语料已变（`83f9c12` 精简 + `evidence-card`）→ **须重跑 sync**；W5 样本 job `c44158a5-…`（3 files / 72 chunks）**不能**代 W6 关账 |
| **§C 四屏** | ☐ 未关 | build 路由 ✅ · URL 200 **待维护者** |
| **§D 五问** | ❌ **FAIL** | checklist 全 ☐；后端 Tranche 1 **非** W6 §D 签收 · Q5 仍 partial（答缺 1/9）· 语料变更后须 Preview **重跑** |
| **§E 录屏（F5）** | ❌ **FAIL** | 路径空白 → **阻塞 CLOSE** |
| **§F CI** | ✅ | 本复核复跑全绿 |
| **§G Harness** | ❌ **blocked** | HG-REINSPECT **pending**（仅人可 approved） |

### chip 逐字对照（`portfolio-demo-chips.ts` · 唯一真值）

| ID | `label`（UI 发送文案） |
|----|------------------------|
| Q1 | 《AI 编程可闭环协作》卷三讲什么？Harness 和签收是什么？ |
| Q2 | RAG 混合检索怎么做的？ |
| Q3 | 冷/温/热 和 架构三层 区别？ |
| Q4 | 11 年经历里 AI Coding 相关成果？ |
| Q5 | 按需读图相对整图灌入 token/效果？边界？ |

与 task 表「UI 逐字」列 **一致**（无 `**` Markdown 差异）。

### 五问判定（W6 口径 · 本复核 **不得** 宣称全绿）

| ID | 能答 | sources（W6 列） | 重试 | 本复核 |
|----|------|------------------|------|--------|
| Q1 | 待 Preview | vol3 / methodology | — | ☐ 待复验 |
| Q2 | 待 Preview | resume · **非** 仅 direct_answer（F3） | — | ☐ 待复验 |
| Q3 | 待 Preview | **evidence only**（vol3 不计） | — | ☐ 待复验 |
| Q4 | 待 Preview | resume | — | ☐ 待复验 |
| Q5 | 待 Preview | evidence（`evidence-card.md`） | — | ☐ 待复验 |

**sources ≥4/5**：未达成 W6 checklist 签收。

---

## Step 3 · 《复核报告》· 硬规则命中

| 规则 | 命中 | 动作 |
|------|------|------|
| **F1** sync / filesScanned | ✅ 命中 | **STOP** · 重跑 sync → jobId 写入 checklist §B + reinspect |
| **F3** Q2 仅 direct_answer | 待 Preview | 五问重跑时强制 RAG 成功 |
| **F5** 录屏缺失 | ✅ 命中 | **STOP CLOSE** |
| **F7** Q3 非 evidence-only | 待 Preview | 重跑时查 sources |
| **HG-REINSPECT** | pending | **禁止** Agent 代填 approved（本对话 **无** 预批授权） |

**总判**：**blocked** — **不进入 50′ 续跑 · 不进入 CLOSE**。

---

## 维护者关账前 COPY 清单

1. Preview URL + ChatBI token → checklist §A 勾选  
2. `./tools/sync-portfolio-content.sh`（必要时 `--force`）→ `POST admin/sync` → **jobId** · `filesScanned>0` · `chunksUpserted>0` → §B  
3. `/unified-chat` 逐字 chip 五问 · Timeline/sources JSON → §D（Q3 **evidence only** · Q2 禁 F3）  
4. 录屏 3–5 min 路径 → §E  
5. §H 签收 · task `HG-REINSPECT` → **approved**（仅人）  
6. 新会话：CLOSE 帽 · `invoke_*_CLOSE_*.md` · KPI 重算 · `git mv` done  

---

## Judgment（40′）

- **experience_capture**: recommended — 演示层缺口已结构化  
- **gate/risk**: HG-REINSPECT pending · F1 · F5 · 五问未 W6 签收  
- **hat_self**: **blocked**
