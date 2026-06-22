# 50 · 独立复检 · Ops Desk P0-5 · Issues 列表页

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-desk-p0-issues-page` |
| **freeze_id** | `OPS-DESK-KIMI-CODE-P0-ISSUES-PAGE` |
| **reviewer** | 协调 Agent（P0-5 子 Agent 失败后接棒完成） |
| **日期** | 2026-06-22 |
| **基线** | sync success · initial · issues≈310 · prs≈642 · run 27925440705 |

---

## 30 实现抽查

| 项 | 判定 | 说明 |
| --- | --- | --- |
| `app/ops/kimi-code/issues/page.tsx` 存在 | 通过 | Server Component，force-dynamic |
| 列表字段 | 通过 | number · title · state · labels · updated_at · html_url |
| 筛选 | 通过 | state（全部/Open/Closed）· label 多选 |
| 分页 | 通过 | 上一页/下一页 · 共 N 条 · 第 x/y 页 |
| scan_tags badge | 通过 | C2/C3/OBSERVE/P0/P1/P2 硬编码配色 |
| 外链 GitHub | 通过 | #/title 链接 target="_blank" rel="noopener noreferrer" |
| 复用共享层 | 通过 | `lib/ops/data.ts` 的 `getIssues` / `IssueFilter` |
| 未重写总览 | 通过 | 仅改 issues 页 + layout 高亮 |
| 加载/空态/失败态 | 通过 | 无 repo / 无数据 / 查询异常均兜底 |

---

## 40 验证结果

| 命令 | 结果 |
| --- | --- |
| `pnpm lint` | ✅ 0 errors（2 个 pre-existing warnings） |
| `pnpm test` | ✅ 81 passed |
| `pnpm build` | ✅ passed |
| 浏览器 Issues 页 | ✅ 200，列表与 Supabase 一致，筛选/分页/外链可用 |

---

## 阻塞与风险

| 风险 | 级别 | 说明 |
| --- | --- | --- |
| layout active 高亮依赖 `x-nextjs-pathname` | Low | 本地观察高亮正常；若生产 header 缺失仅影响样式，不阻塞功能 |
| label 筛选仅展示当前页标签 | Low | P0 可接受；P1 可扩展为全表 distinct labels |

---

## 结论

**conditional_pass** —— 实现与 SPEC P0-5 一致，40 验证全绿，浏览器数据与 Supabase 同步结果一致。建议创建 PR 并 merge。
