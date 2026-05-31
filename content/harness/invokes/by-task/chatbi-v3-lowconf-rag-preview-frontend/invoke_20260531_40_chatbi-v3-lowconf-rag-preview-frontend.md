# Invoke · 40 自检（执行者）· chatbi-v3-lowconf-rag-preview-frontend

| 字段 | 值 |
|------|-----|
| **hat** | 40-self-check |
| **task_slug** | `chatbi-v3-lowconf-rag-preview-frontend` |
| **task_path** | `ai-ink-brain/content/tasks/active/task_chatbi_v3_lowconf_rag_preview_frontend_v1.md` |
| **git_branch** | `task/chatbi-v3-lowconf-rag-preview`（建议） |
| **worktree_root** | `ai-ink-brain` |
| **impl_commit** | `72f8f0c` |
| **audit_review** | `ai-ink-brain/content/harness/reviews/task_chatbi_v3_lowconf_rag_preview_frontend_v1_audit_R1_20260531.md` |
| **human_gate** | HG-REINSPECT pending（不阻塞 40；阻塞 done/merge） |

---

## §3 可复制 Prompt 正文（快照）

```text
你正在扮演工作区 Harness「自检帽（执行者）」，严格遵循：
- Projects/docs/harness/prompts/40-self-check.md
- Projects/docs/harness/HARNESS_V2_PLAN.md §5
- ai-ink-brain/AGENTS.md §8（合并前必绿）
- ai-ink-brain/.cursor/rules/05-harness-semi-auto.mdc、06-harness-content.mdc

输入：
- 主 task：ai-ink-brain/content/tasks/active/task_chatbi_v3_lowconf_rag_preview_frontend_v1.md
- Worktree cwd：ai-ink-brain
- 验证命令：pnpm lint && pnpm test && pnpm build
- 30 实现 commit：72f8f0c
- 变更范围：git show 72f8f0c --stat

你必须完成：
0. Invoke 落盘：content/harness/invokes/by-task/chatbi-v3-lowconf-rag-preview-frontend/invoke_20260531_40_*.md
1. 通读 task 验收标准；逐条复跑 D5 命令并记录退出码与关键输出。
2. 对照 FE-1～FE-5：30 已标 FE-5 未测 — 确认或补充阻塞说明（后端 staging）。
3. 复核 task「### 自检结论（执行者）」是否与命令证据一致；必要时增量修正。
4. 输出验收表 pass/fail；fail 项写明是否可重试。
5. 对话末尾 Judgment + 下一棒 Prompt（50 独立复检或打回 30）。
6. 按 HANDOFF_AUTO_COMMIT commit 本轮 invoke + task 回填。

Judgment（本帽 · 对话末尾必填）：
- experience_capture: 维持 | 建议升级 required | 维持 n/a
- gate/risk: 无 | 须人审:<HG-id> | 证据不足
- hat_self: pass | pass-with-notes | blocked
```

---

## 40 帽执行摘要

| 命令 | exit | 要点 |
|------|------|------|
| `pnpm lint` | 0 | eslint 无报错 |
| `pnpm test` | 0 | 10 files · 41 tests passed |
| `pnpm build` | 0 | Next.js 16.2.3 编译 + TS OK |

**验收**：FE-1～FE-4 pass · FE-5 fail（后端 G1–G2 staging 阻塞）· D5 pass · F2 pass · C1 pass-with-notes。

**下一棒**：50 独立复检（`HG-REINSPECT` 仍 pending）。
