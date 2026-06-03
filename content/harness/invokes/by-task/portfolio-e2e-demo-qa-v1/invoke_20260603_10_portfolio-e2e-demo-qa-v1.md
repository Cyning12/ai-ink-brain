# Invoke · 10 需求帽 · portfolio-e2e-demo-qa-v1

| 字段 | 值 |
|------|-----|
| **hat_code** | `10` |
| **task_slug** | `portfolio-e2e-demo-qa-v1` |
| **task_path** | `ai-ink-brain/content/tasks/active/task_portfolio_e2e_demo_qa_v1.md` |
| **git_branch** | `task/portfolio-e2e-demo-qa-v1` |
| **predecessor** | `invoke_20260603_00_portfolio-e2e-demo-qa-v1.md` |
| **date** | 2026-06-03 |

---

## 可复制 Prompt 正文（§3 · 从下一行起）

```text
你正在扮演工作区 Harness「需求与任务分析帽」，严格遵循：
- docs/harness/prompts/10-requirements.md
- docs/harness/HARNESS_V2_PLAN.md §5
- docs/harness/prompts/HANDOFF_SEMI_AUTO.md（semi_auto 链式：落盘 → 建议 commit → 派 22-R1）

Open Folder = ai-ink-brain
git_branch = task/portfolio-e2e-demo-qa-v1
task_slug = portfolio-e2e-demo-qa-v1
freeze_id = PORTFOLIO-RAG-DEMO@2026-06-01

【目标与上下文】
Portfolio W6：在 W1–W5 已合并 main（@ ea8ac48）前提下，将 active task 定稿为可执行联调单——冻结五问验收表、Preview/生产执行环境、content→sync→ingest 计划、录屏 checklist、failure_paths 可操作化；为 22-R1（跨仓 ingest/RAG 风险）与 30–40（联调留证）提供必读 Handoff。不得推翻 W3/W4（ChatBI token + GET /api/py/chatbi/access/verify + access_level 裁剪 + 五问 chip）。

【已有材料路径】
ai-ink-brain/content/tasks/active/task_portfolio_e2e_demo_qa_v1.md
ai-ink-brain/content/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md（§6.4 · §6.5 · §6.7 · §7 W6）
ai-ink-brain/content/tasks/specs/投递冲刺_20260609_v1_zh.md（§2 五问 · §3.3 sync）
ai-ink-brain/content/tasks/done/task_portfolio_unified_chat_ui_v1.md（W4 · 勿推翻）
ai-ink-brain/tools/README-portfolio-content-sync.md
ai-ink-brain/lib/unified-chat/portfolio-demo-chips.ts
ai-ink-brain/docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md
ai-ink-brain/content/harness/invokes/by-task/portfolio-e2e-demo-qa-v1/invoke_20260603_00_portfolio-e2e-demo-qa-v1.md

【是否按任务审核文档回填】
无

你必须完成：
0. 开帽前：将本消息全文确认已落盘（本文件）；同会话追问不重复落盘。
1. **更新 task 正文**（`task_portfolio_e2e_demo_qa_v1.md`）：
   - 状态 → `ready_for_execute`（或等价「10 定稿」表述）
   - 新增或充实 **「联调环境（Preview · 同一 Vercel 项目）」** 表：须含 `NEXT_PUBLIC_SITE_MODE=portfolio`、`PY_API_URL`、`SYNC_ADMIN_SECRET`（仅字段名，无密钥值）、Supabase/`EMBEDDING_DIM` 与生产同项目、**解锁主路径 ChatBI token**（非 `PORTFOLIO_VISITOR_*` 主路径）、`visitor` / `visitor-admin` 档位与 §4.4 裁剪对照
   - 新增 **「sync 执行计划（W6）」** 有序步骤：① `tools/sync-portfolio-content.sh` ② 后端 `CONTENT_ROOT=<本仓>/content` ③ `POST` admin/sync（路径 A/B 二选一写清）④ 轮询 jobId ⑤ `filesScanned>0` 硬门槛 ⑥ 五问预跑入口 URL
   - 充实 **录屏 checklist**（3–5 min 分镜，对齐 SPEC §6.7 / 投递 P0-D）
   - 核对 **五问表** 与 `portfolio-demo-chips.ts` 展示文案一致（逐字）；若有差异列 **矛盾** 小节
   - **failure_paths** 与验收项一一可操作化；补 **给 22-R1 / 30 / 40 必读列表**
2. 更新 `content/tasks/specs/PROMPT_looptask_startup_portfolio_w6_v1_zh.md` §2 前置表（若与 00 扫描不一致则修正）
3. 输出 **下一棒 22-R1** 可复制 Prompt 路径提示（`TEMPLATE-task-audit-invoke.md` §3），不要求本回合执行 22
4. 禁止：写业务实现代码；改 CI；代填 `HG-REINSPECT` approved
5. 建议 commit：本 task + invoke + PROMPT（仅本轮路径）；用户写明「不要 commit」则跳过

Judgment（10 · 对话末尾必填）：
- experience_capture: 建议档位 + 理由
- gate/risk: 是否建议 22-R1 前补 HG 或 SPEC 人审
- hat_self: pass | pass-with-notes | blocked
```

---

## 00 → 10 Handoff（路径 · 验收 · 禁止）

| read_paths | 用途 |
|------------|------|
| `content/tasks/active/task_portfolio_e2e_demo_qa_v1.md` | 主 task（须回写定稿） |
| `content/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md` | §6.4–6.7 · §7 W6 |
| `content/tasks/specs/投递冲刺_20260609_v1_zh.md` | §2 · §3.3 |
| `tools/README-portfolio-content-sync.md` | sync + ingest |
| `lib/unified-chat/portfolio-demo-chips.ts` | chip 逐字对照 |

| forbidden | |
|-----------|--|
| 推翻 W4 ChatBI unlock 主路径 | |
| 粘贴 30/40 长联调日志 | |
| 绝对本机 home 路径写入 task | |

| 10 交付物 | |
|-----------|--|
| 定稿 task + 更新 PROMPT §2 | ✅ 2026-06-03 |
| 下一棒：`22-R1` | → `invoke_20260603_22_r1_*` · review R1 已落盘 |

---

## Judgment（10 · 2026-06-03）

- **experience_capture**: 维持 `recommended`（五问联调 + 录屏属高价值过程素材）
- **gate/risk**: 无新增闸；SPEC 草稿与 W4 分叉已在 task §文档矛盾 冻结
- **hat_self**: `pass`
