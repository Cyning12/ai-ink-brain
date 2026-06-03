# 独立复检（50）· task_portfolio_content_pages_v1

| 字段 | 值 |
|------|-----|
| **task_slug** | portfolio-content-pages-v1 |
| **git_branch** | task/portfolio-content-pages-v1 |
| **日期** | 2026-06-02 |
| **帽** | 50 Fresh Context（Task 子代理） |
| **总判定** | **warn** |

## task 验收对照

| ID | 项 | 判定 | 证据 |
|----|-----|------|------|
| T1 | `/resume` `/methodology` `/evidence` portfolio 可读 | pass | `app/*/page.tsx` · `content/{resume,methodology,evidence}/*.md` |
| T2 | NAV `<Link>` `_rsc` 非 404 | warn | 三 `page.tsx` 已补；merge 前 DevTools 目视（40 注） |
| T3 | development 回归 | pass | `app/page.tsx` 非 portfolio 仍 Cyning；路由无 mode 门控 |
| T4 | `/about` 308→`/resume` | pass | `app/about/page.tsx` `permanentRedirect` |
| T5 | `/evidence` 不进 NAV | pass | `site-nav.tsx` `PORTFOLIO_NAV` 四链无 evidence |
| T6 | lint/test/build 双 build | pass | task ### 自检结论 · 30 已跑绿 |
| T7 | 22 R1/R2 + 50 落盘 | pass | reviews R1/R2 + 本文件 |

## SPEC §6.2 / §6.2.1（W2 子集）

| ID | 项 | 判定 | 证据 |
|----|-----|------|------|
| S1 | `/` §4.6.1 四卡+作者文案 | pass | `portfolio-home.tsx` · `home-modules.tsx` |
| S2 | §4.6.0 去 Ink | pass | `site-nav.tsx` · `layout.tsx` · footer |
| S3 | 三内容页无秘钥 md | pass | 三 page + `get-portfolio-doc.ts` |
| S4 | F1 语料缺失降级 | pass | `portfolio-content-empty.tsx` |
| S5 | F3 不扫 tasks/harness | pass | allowlist · 仅 category 子目录 |
| S6 | §4.6.4 证据页五问列表 | warn | chip 逐字归 W4；本页占位说明 |

## get-portfolio-doc 隔离

- **pass**：仅 `methodology|resume|evidence`；无 `docs/tasks`/`docs/harness` URL；slug 穿越 `startsWith(dir+sep)` 拦截。

## 合并建议

- **warn 合入 `main`**：无 P0 fail；merge 前 **HG-REINSPECT** + 可选 Preview 上 `_rsc` 目视 + CLOSE/KPI。
- **下一 Epic**：W3 visitor-auth（另开 LoopTask）。

## 禁止项确认

- Agent **未**代填 HG-REINSPECT / CLOSE / ### KPI（00）。
