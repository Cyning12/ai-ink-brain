# Prompt 22 · Portfolio admin/sync 鉴权 · 实现复查（Fresh Context）

> **用途**：在 **`PORTFOLIO-ADMIN-SYNC-AUTH@2026-06-01`** 实现落盘后，由 **前端 Agent** 对照冻结 SPEC 做 **代码 + 文档 + 命令** 复查；**不是** Prompt 00 SPEC 细化，**不是** 50 全 task 关账复检。  
> **前置**：[`SPEC-portfolio_admin_sync_auth_v1_zh.md`](./SPEC-portfolio_admin_sync_auth_v1_zh.md) 状态 `active`；实现分支含 `lib/auth/sync-admin-env.ts` 等变更。  
> **落盘**：`docs/harness/reviews/by-task/portfolio-admin-sync-auth/task_portfolio_admin_sync_auth_v1_audit_R1_YYYYMMDD.md`  
> **invoke 快照（可选）**：`docs/harness/invokes/by-task/portfolio-admin-sync-auth/invoke_YYYYMMDD_22_portfolio-admin-sync-auth.md`

---

## 1. 占位符

| 占位符 | 含义 | 默认值 |
| --- | --- | --- |
| `{{SPEC_PATH}}` | 冻结 SPEC | `docs/tasks/specs/SPEC-portfolio_admin_sync_auth_v1_zh.md` |
| `{{FREEZE_ID}}` | | `PORTFOLIO-ADMIN-SYNC-AUTH@2026-06-01` |
| `{{GIT_BRANCH}}` | 实现分支 | `task/portfolio-admin-sync-auth-v1`（或含本 diff 的当前分支） |
| `{{IMPL_COMMIT}}` | 实现 tip | `git rev-parse --short HEAD` |
| `{{DIFF_BASE}}` | diff 基线 | `origin/main...HEAD` |
| `{{DATE}}` | 审查日期 | `YYYYMMDD` |

---

## 2. 角色与边界

### 2.1 你是谁

**Harness 22 复查 Agent（只读为主）**：验证 admin/sync 链 **已废弃** `NEXT_PUBLIC_ADMIN_SECRET` 文档示例，且 BFF 实现与 SPEC §2 **一致**；输出 **阻塞 / 非阻塞** 表与 **是否建议合并**。

### 2.2 允许

| 动作 | 说明 |
| --- | --- |
| 只读 | `{{SPEC_PATH}}`、`docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md`、`.env.example` |
| 只读 | `lib/auth/sync-admin-env.ts`、`require-sync-admin-access.ts`、`py-service-proxy.ts` |
| 只读 | `app/api/admin/sync/route.ts`、`app/api/admin/ingest/route.ts` |
| 只读 | `tools/README-portfolio-content-sync.md`、`docs/tasks/active/task_portfolio_content_sync_script_v1.md`（烟测段） |
| 只读 | `docs/_tech_graph/11_flow_api.md`（admin/sync 节） |
| 只读 | 配对仓 `ai-ink-brain-api-python/docs/harness/guides/RUNBOOK_portfolio_rag_five_questions_v1_zh.md` §1.3 · §8（**只读** · 跨仓路径对照） |
| 命令 | `pnpm lint` · `pnpm test` · `pnpm build`；`NEXT_PUBLIC_SITE_MODE=portfolio pnpm build` |
| 命令 | `rg 'NEXT_PUBLIC_ADMIN_SECRET|x-admin-token' tools/ docs/tasks/active/task_portfolio_content_sync_script_v1.md docs/tasks/specs/SPEC-portfolio_admin_sync_auth_v1_zh.md`（漂移 grep） |
| 修改 | **仅** 审查 md 落盘；**仅** 当 fail 为 **文档笔误**（非逻辑）且 ≤3 处时允许 **最小 patch** 并在审查 md 列出 diff |

### 2.3 禁止

- 改 `human_gate` · 代填 `approved`
- 写真实密钥进仓库 / 对话 / 审查 md
- 执行生产 deploy；**无本地 secret 时** admin sync curl 标 **环境阻塞**，**不得** fail 整个审查
- 扩大范围改 Legacy `ChatPanel` / `/api/chat` middleware / Python `api/`
- 声称「W6 五问全绿」或替 W5 content-sync task 关账

---

## 3. 复查清单（须逐项填表）

### 3.1 代码对照 SPEC §2

| ID | 检查项 | pass 证据 |
| --- | --- | --- |
| C1 | `getSyncAdminSecret()` 优先级：`SYNC_ADMIN_SECRET` → `CHAT_API_SECRET` → 废弃 `NEXT_PUBLIC` + dev warn | 文件:行 |
| C2 | `requireSyncAdminAccess`：Ink Cookie · Bearer · 兼容 `x-admin-token` | 文件:行 |
| C3 | `forwardToPyAdmin` **不**直接读 `NEXT_PUBLIC_ADMIN_SECRET`（经 sync-admin-env） | 文件:行 |
| C4 | `admin/sync` + `admin/ingest` 均用 `requireSyncAdminAccess` | 文件:行 |
| C5 | `require-next-public-admin-secret.ts` 标 `@deprecated` 且无 **新** 引用（`rg requireNextPublicAdminSecret app/` 为空） | 命令输出 |
| C6 | 未配置 secret 时错误文案提及 **`SYNC_ADMIN_SECRET`**，**不**误导为仅 NEXT_PUBLIC | 文件:行 |

### 3.2 文档漂移（Portfolio / W5 链）

| ID | 检查项 | pass 条件 |
| --- | --- | --- |
| D1 | `tools/README-portfolio-content-sync.md` **无** sync curl 示例 `NEXT_PUBLIC_ADMIN_SECRET` / `x-admin-token` | grep 无命中（废弃说明段除外） |
| D2 | 含 **路径 A**（`$ADMIN_TOKEN` 直连 Python）与 **路径 B**（`$SYNC_ADMIN_SECRET` BFF） | 目视 |
| D3 | `task_portfolio_content_sync_script_v1.md`「本地 admin sync 烟测」与 README **一致** | 对照 |
| D4 | `.env.example` 含 `SYNC_ADMIN_SECRET` 注释 | 目视 |
| D5 | `PROJECT_CONFIG` §C 分表 Ink vs Sync；`11_flow_api.md` admin/sync 节存在 | 路径 |
| D6 | `.cursor/skills/harness-looptask-handoff/SKILL.md` 无 `x-admin-token: $NEXT_PUBLIC` | grep |

### 3.3 命令（必跑）

| ID | 命令 | pass |
| --- | --- | --- |
| T1 | `pnpm lint` | exit 0 |
| T2 | `pnpm test` | exit 0 |
| T3 | `pnpm build` | exit 0 |
| T4 | `NEXT_PUBLIC_SITE_MODE=portfolio pnpm build` | exit 0 |

### 3.4 烟测（可选 · 环境阻塞合法）

| ID | 步骤 | 说明 |
| --- | --- | --- |
| S1 | 设 `SYNC_ADMIN_SECRET` + 后端 `CONTENT_ROOT` + `pnpm dev` | 无则标 **defer · 环境阻塞** |
| S2 | `curl -X POST localhost:3000/api/admin/sync -H "Authorization: Bearer $SYNC_ADMIN_SECRET"` | 期望非 403；202 或 503（Python 未起）可接受并注明 |

### 3.5 跨仓只读对照

| ID | 检查项 |
| --- | --- |
| X1 | 后端 RUNBOOK §1.3 写 Bearer + `SYNC_ADMIN_SECRET` / `ADMIN_TOKEN`，**禁止** Portfolio 文档写 NEXT_PUBLIC |
| X2 | 后端 governance SPEC §4.4 提及前端 `SYNC_ADMIN_SECRET` 与 Python 同值 |

---

## 4. §4 Handoff（复制到新对话 · Task 或主 Agent）

```text
【Harness 22 · 复查 · Portfolio admin/sync 鉴权】

- hat_code: 22（实现复查 · 非全 task 22-R1 规划审）
- task_slug: portfolio-admin-sync-auth
- Open Folder: ai-ink-brain
- git_branch: {{GIT_BRANCH}}
- freeze_id: {{FREEZE_ID}}
- impl_commit: {{IMPL_COMMIT}}
- prompt_spec: docs/tasks/specs/PROMPT_22_review_portfolio_admin_sync_auth_v1_zh.md

- 禁止带入：主 Chat 实现过程全文
- 必读：
  - docs/tasks/specs/SPEC-portfolio_admin_sync_auth_v1_zh.md（§2 实现真值 · §5 验收）
  - lib/auth/sync-admin-env.ts · require-sync-admin-access.ts · lib/py-service-proxy.ts
  - app/api/admin/sync/route.ts · app/api/admin/ingest/route.ts
  - tools/README-portfolio-content-sync.md
  - docs/tasks/active/task_portfolio_content_sync_script_v1.md（烟测段）
  - docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md · .env.example · docs/_tech_graph/11_flow_api.md
- diff：git diff {{DIFF_BASE}} -- lib/auth/ app/api/admin/ lib/py-service-proxy.ts tools/README-portfolio-content-sync.md docs/tasks/active/task_portfolio_content_sync_script_v1.md docs/tasks/specs/SPEC-portfolio_admin_sync_auth_v1_zh.md docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md .env.example docs/_tech_graph/11_flow_api.md .cursor/skills/harness-looptask-handoff/

- 落盘：docs/harness/reviews/by-task/portfolio-admin-sync-auth/task_portfolio_admin_sync_auth_v1_audit_R1_{{DATE}}.md

（以下为 §5 子 Agent 正文）
```

---

## 5. §5 子 Agent 正文

```text
你正在扮演前端 Harness「22 实现复查」Agent，严格遵循：
- docs/tasks/specs/PROMPT_22_review_portfolio_admin_sync_auth_v1_zh.md §2–§3
- docs/tasks/specs/SPEC-portfolio_admin_sync_auth_v1_zh.md（freeze_id PORTFOLIO-ADMIN-SYNC-AUTH@2026-06-01）

Open Folder = ai-ink-brain
git_branch = {{GIT_BRANCH}}

你必须完成：

0. **Invoke 快照（可选）**：将本消息 §4+§5 全文落盘到 docs/harness/invokes/by-task/portfolio-admin-sync-auth/invoke_{{DATE}}_22_portfolio-admin-sync-auth.md

1. **Fresh Context**：禁止依赖主 Chat 实现叙述；以 diff + 文件内容 + 命令输出为准。

2. **逐项填表**（§3.1 C1–C6 · §3.2 D1–D6 · §3.3 T1–T4 · §3.4 S1–S2 · §3.5 X1–X2）：
   列：ID | pass/fail/defer | 证据（文件:行 / 命令 / grep）| 备注

3. **汇总**：
   - 阻塞项（fail 且不可 defer）清单
   - 建议：merge-ready | 须返工 | 仅文档 patch
   - Legacy 范围确认：ChatPanel/middleware 仍用 NEXT_PUBLIC **不** 计 fail（SPEC §6）

4. **落盘审查 md**（结构）：
   - 元信息表（freeze_id · impl_commit · diff 范围）
   - §3 全表复制
   - 阻塞 / defer 说明
   - 跨仓 X1–X2 结论（只读后端路径）
   - Judgment

5. **禁止**：改 human_gate；无授权不扩大改 Legacy /chat 路由。

Judgment（对话末尾必填）：
- scope_drift: 无 | 有:<说明>
- merge_recommendation: yes | no | yes-with-doc-patch
- hat_self: pass | pass-with-notes | blocked

若 merge_recommendation=no：输出返工清单（文件 | 改什么），**禁止**笼统「再检查一下」。
```

---

## 6. 审查 md 模板（落盘时可复制骨架）

```markdown
# 22 复查 · Portfolio admin/sync 鉴权 · R1

| 字段 | 值 |
| --- | --- |
| freeze_id | PORTFOLIO-ADMIN-SYNC-AUTH@2026-06-01 |
| task_slug | portfolio-admin-sync-auth |
| impl_commit | {{IMPL_COMMIT}} |
| git_branch | {{GIT_BRANCH}} |
| date | {{DATE}} |

## 代码（C1–C6）
| ID | 结果 | 证据 | 备注 |

## 文档（D1–D6）
| ID | 结果 | 证据 | 备注 |

## 命令（T1–T4）
| ID | 结果 | 证据 | 备注 |

## 烟测（S1–S2）
| ID | 结果 | 证据 | 备注 |

## 跨仓（X1–X2）
| ID | 结果 | 证据 | 备注 |

## 结论
- 阻塞：
- defer：
- merge_recommendation:

## Judgment
- scope_drift:
- hat_self:
```

---

## 7. 与 Prompt 00 / W5 task 关系

| Prompt | 关系 |
| --- | --- |
| [`PROMPT_00_SPEC-refine_portfolio_admin_sync_auth_v1_zh.md`](./PROMPT_00_SPEC-refine_portfolio_admin_sync_auth_v1_zh.md) | **上游** · SPEC 已 frozen → 本 Prompt **不复议** Q1–Q5 |
| W5 `task_portfolio_content_sync_script_v1.md` | **并行** · 本复查 **不替代** W5 50；通过后 W5 烟测仍用 README 路径 A/B |
| 建议后续 | 零阻塞 → 人开 `task_portfolio_admin_sync_auth_v1.md`（10 帽）或并入 portfolio 演示 PR |

---

## 修订记录

| 日期 | 摘要 |
| --- | --- |
| 2026-06-01 | v1：实现落盘后 22 复查 Prompt + 落盘路径 + C/D/T/S/X 清单 |
