# Task · Ops Desk P0-3 · site_mode=ops + M0 鉴权

> **状态**：`done（2026-06-21 验收通过）`  
> **SPEC**：[`SPEC_ops_desk_kimi_code_mvp_v1_zh.md`](../specs/SPEC_ops_desk_kimi_code_mvp_v1_zh.md) · §5 · §6.3 · §13 P0-3  
> **invoke 真值**：[`ROUND_05_R4_ops_site_auth.md`](../../../docs/harness/invokes/by-task/ops-desk-kimi-code-spec-refine/rounds/ROUND_05_R4_ops_site_auth.md)  
> **依赖**：无（可与 P0-1 并行）  
> **后继**：P0-4～P0-6 看板页

---

## Harness 元信息

| 字段 | 值 |
| --- | --- |
| **task_slug** | `ops-desk-p0-ops-site-mode` |
| **test_strategy** | `required` |
| **freeze_id** | `OPS-DESK-KIMI-CODE-P0-OPS-SITE-MODE` |
| **git_branch** | `task/ops-desk-p0-ops-site-mode` |
| **worktree_root** | `ai-ink-brain/` |
| **Open Folder** | `ai-ink-brain/` |
| **audit_profile** | `full` |
| **acceptance_interaction** | `required` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
| --- | --- | --- | --- |
| **HG-TASK-DRAFT** | approved | 30 | HG-SPEC-SIGNOFF 已签 |
| **HG-AUDIT-R1** | approved | 30 | 链审 R1 · [`task_ops_desk_p0_chain_audit_R1_20260621.md`](../../../docs/harness/reviews/task_ops_desk_p0_chain_audit_R1_20260621.md) · 2026-06-21 |

---

## 背景与目标

Ink 前端启用 **`site_mode=ops`**：默认入口 `/ops/kimi-code` · 隐藏博客导航 · M0 邀请制秘钥守卫。

### 完成态

- [x] `NEXT_PUBLIC_SITE_MODE=ops` 时 `/` → 302 `/ops/kimi-code`
- [x] `app/ops/kimi-code/layout.tsx` · Ops 导航壳
- [x] `/ops/login` · `OPS_DESK_SECRET` cookie 鉴权
- [x] `middleware.ts` 扩展 `/ops/*` 守卫
- [x] BFF `/api/ops/*` 二次校验（骨架即可）

---

## 范围

- [x] env：`OPS_DESK_SECRET` · 可选 `OPS_DESK_MAINTAINER_SECRET`
- [x] 导航隐藏 blog/portfolio · 路由保留
- [x] HttpOnly cookie `ops_desk_token` · 可选 `?token=` Demo 入口

## 非范围

- 看板数据页（P0-4～6）
- Chat 页（P1）
- GitHub OAuth（P3）

---

## 验收标准

- [x] 无秘钥访问 `/ops/kimi-code` → 重定向 login
- [x] 正确秘钥后可进入 Ops layout
- [x] `site_mode≠ops` 时行为不变
- [x] `pnpm lint` · `pnpm test` · `pnpm build` 绿

---

## 失败路径

| # | 触发 | 行为 |
| --- | --- | --- |
| F1 | 未设 `OPS_DESK_SECRET` | 构建/运行明确错误 · 不 silent 开放 |
| F2 | middleware 误伤 `/blog` 直连 | blog 仍可达 · 仅导航隐藏 |

---

## 给 Cursor

`ops-desk-p0-ops-site-mode` · Open **`ai-ink-brain/`** · 复用 `lib/site-mode.ts` 模式。

---

### 自检结论（执行者 · 40 R1）

- **自检时间**：2026-06-21
- **自检方式**：对照 `SPEC_ops_desk_kimi_code_mvp_v1_zh.md` §5/§6.3、`ROUND_05_R4_ops_site_auth.md`、`KPI_RUBRIC_v1_2` 逐条复核
- **复核范围**：30 实现提交 `2657511` 的全部 30 个文件、本地 CI、浏览器交互验收
- **发现项**：无阻塞；仅 2 项既有代码 lint warning（`UnifiedChatPageClient.tsx`），与本 task 无关
- **结论**：30 实现满足 task 验收标准；建议进入 CLOSE / 等待维护者最终签收

---

### KPI（00）

**rubric**: KPI_RUBRIC_v1_2 · **汇总**: 100% · **状态**: pass · **帽**: 30 R1 + 40 R1

| hat_code | round | agent_mode | D1 | D2 | D3 | D4 | D5 | judgment_notes |
|----------|-------|------------|----|----|----|----|----|----------------|
| 30 | R1 | task_subagent | 100 | 100 | 100 | 100 | 100 | — |
| 40 | R1 | task_subagent | 100 | 100 | 100 | 100 | — | — |

**大维聚合**：D1=100 · D2=min(100,100)=100 · D3=100 · D4=min(100,100)=100 · D5=min(100)=100  
**Task_KPI%** = 100×20% + 100×30% + 100×15% + 100×15% + 100×20% = **100%**

**J 子项判定（30/40 共用）**：
- J-exp：task 为 `required`，已执行 `pnpm test` + build + 交互验收 → pass
- J-gate：`HG-TASK-DRAFT`、`HG-AUDIT-R1` 均为 approved，未代签、未闯 pending 闸 → pass
- J-scope：严格限定 P0-3，未实现 P0-4~6 / Chat / OAuth → pass
- J-evidence：浏览器交互验收留 curl 日志与本地 `pnpm start` 结果 → pass
- J-refuse：无不必要拒停 → pass

**验收结果**：
- `pnpm lint`：通过（2 warnings，既有代码 `UnifiedChatPageClient.tsx`）
- `pnpm test`：81 passed / 19 files
- `pnpm build`：绿（默认 development 模式与 ops 模式均验证）
- 图谱门禁：`tech-graph:yaml-compile` / `graph-export` / `graph-check` / `equivalence-check` / `manifest-check` / `schema-check` 全绿

**浏览器交互验收**（`NEXT_PUBLIC_SITE_MODE=ops` + `OPS_DESK_SECRET=testsecret` 本地 `pnpm start`）：
1. `/` 302 → `/ops/kimi-code`
2. 无 cookie 访问 `/ops/kimi-code` 302 → `/ops/login`
3. `/blog` 路由仍可达（仅导航隐藏）
4. `/ops/login` 输入正确秘钥后设置 `ops_desk_token` HttpOnly cookie 并进入 Ops layout
5. `/api/ops/health` 支持 cookie/Bearer 双轨鉴权，未认证返回 401

**风险等级**：Low；回滚：删除 `app/ops/*`、`app/api/ops/*`、`lib/auth/ops-*`、还原 `middleware.ts` / `lib/site-mode.ts` / `app/layout.tsx` / `app/_components/site-nav.tsx`

**遗留/下一棒**：P0-4~6 看板数据页待 P0-2 完成后由 00 派工

