# Invoke · 50 独立复检 · chatbi-v3-lowconf-rag-preview-frontend

| 字段 | 值 |
|------|-----|
| **hat** | 50-independent-reinspect |
| **task_slug** | `chatbi-v3-lowconf-rag-preview-frontend` |
| **task_path** | `ai-ink-brain/content/tasks/active/task_chatbi_v3_lowconf_rag_preview_frontend_v1.md` |
| **reinspect_mode** | 独立复检 |
| **git_branch** | `main`（实现于 `task/chatbi-v3-lowconf-rag-preview` 建议分支） |
| **worktree_root** | `ai-ink-brain` |
| **diff_range** | `72f8f0c^..72f8f0c` |
| **impl_commit** | `72f8f0c` |
| **self_check_commit** | `6e71a14` |
| **audit_review** | `ai-ink-brain/content/harness/reviews/task_chatbi_v3_lowconf_rag_preview_frontend_v1_audit_R1_20260531.md` |
| **human_gate** | HG-REINSPECT **pending**（50 完成后须人签 approved 再 merge） |

---

## §3 可复制 Prompt 正文（快照）

```text
你正在扮演工作区 Harness「独立复检帽（50）」，严格遵循：
- Projects/docs/harness/prompts/50-independent-reinspect.md
- Projects/docs/harness/prompts/TEMPLATE-independent-reinspect-invoke.md §3
- ai-ink-brain/AGENTS.md §8
- ai-ink-brain/.cursor/rules/05-harness-semi-auto.mdc、06-harness-content.mdc

输入：
- 主 task：ai-ink-brain/content/tasks/active/task_chatbi_v3_lowconf_rag_preview_frontend_v1.md
- 子仓 cwd：ai-ink-brain
- 模式：独立复检
- diff：git diff 72f8f0c^..72f8f0c（或 origin/main...HEAD 若已 rebase）
- 审查 R1：ai-ink-brain/content/harness/reviews/task_chatbi_v3_lowconf_rag_preview_frontend_v1_audit_R1_20260531.md
- 40 自检 commit：6e71a14
- 实现 commit：72f8f0c

你必须完成：
0. Invoke 落盘：content/harness/invokes/by-task/chatbi-v3-lowconf-rag-preview-frontend/invoke_20260531_50_*.md
1. 读 task「### 自检结论（执行者）」+ diff 72f8f0c；对照 R1 与 FE-1～FE-5。
2. 重点复检：chainPayloadValidators 按 tool 分支、manifest C1 键、UI 分支是否越界读取未承诺键。
3. FE-5 fail 须写入复检报告（阻塞关账，非打回 30 除非发现代码缺陷）。
4. 输出：验收表 · 合并建议 · 是否建议 defer FE-5（须人签）· Judgment。
5. 落盘：content/tasks/reinspect_results/reinspect_chatbi-v3-lowconf-rag-preview-frontend_*.md
6. HANDOFF_AUTO_COMMIT（invoke + reinspect + task 若改）。

注意：HG-REINSPECT 仍 pending — 50 完成后须人置 approved 再 merge。

Judgment（本帽 · 对话末尾必填）：
- experience_capture: 维持 | 建议升级 required | 维持 n/a
- gate/risk: 无 | 须人审:<HG-id> | 证据不足
- hat_self: pass | pass-with-notes | blocked | warn
```
