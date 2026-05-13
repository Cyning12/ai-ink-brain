# 前端 Task：Harness V2 P1 — 最小单测（Vitest）与合并前必绿清单（v1）

> **状态**：`done`（2026-05-13）  
> **前置**：P0 已验收并完成 **commit + push**（见工作区 `docs/harness/HARNESS_V2_P0_ACCEPTANCE.md` §4 勾选）；本任务 **不阻塞** P0 收尾，但执行前须确认默认分支上 **`quality`** workflow 已绿。  
> **关联 Harness**：`Projects/docs/harness/HARNESS_V2_PLAN.md` **§4 P1**（项 3、4）  
> **关联 Issue/PR**：无  

---

## Harness 元信息（与 `HARNESS_V2_PLAN.md` §5 对齐）

| 字段 | 取值 |
|------|------|
| **test_strategy** | `required` |
| **test_strategy_note** | —（不适用 `not_applicable`） |
| **freeze_id** | （可选）以 P0 合并后主分支 + `HARNESS_V2_PLAN.md` §10 最新修订行为准 |

### failure_paths（失败语义）

| 触发条件 | 系统行为 | 可重试 | 用户/维护者可见 |
|----------|----------|--------|------------------|
| `pnpm test` 本地或 CI 失败 | CI job `quality` 或新增 test job 失败；**禁止**在已知红线下合并 | 修复代码或测试后期重跑 | PR Checks 失败 + 日志 |
| Vitest 与 Next/ESLint 版本冲突 | 构建或 lint 退化 | 锁定依赖版本后重试 | lockfile + CI 日志 |
| 仅改工作区根 `AGENTS.md` / `docs/harness/*` 未进前端仓 PR | 真源分裂 | 按仓库分别提交 | Code Review 指出 |

---

## 背景与目标

P0 已为前端提供 **`quality.yml`**（`lint` + `build`），Verify 仍缺 **可回归的自动化单测**（见 `Projects/docs/harness/Harness工程测评-Desktop-Projects-ai-ink.md` 基线 + §8）。  
本任务目标：

1. **引入 Vitest**（与 Next 16 / TS strict 兼容），在 `ai-ink-brain` 增加 **最小可维护** 的单测集（优先 **纯函数 / BFF 工具层**，避免一上来全页 E2E）。
2. **`package.json`** 增加 **`test`**（及可选 **`test:ci`**）脚本；CI 在现有 **`quality`** workflow 中 **增加 `pnpm test` 步骤**（或独立 job，须与 `HARNESS_V2_P0_ACCEPTANCE.md` 同步更新验收描述）。
3. **工作区根**（`Projects/`）：在 `AGENTS.md` §8 或 `docs/harness/HARNESS_V2_PLAN.md` §4 增补 **「合并前必绿」** 清单条目，**显式链接** workflow 名（`quality`）与命令（`pnpm test`），避免与 P0 文档漂移。

---

## 范围

- [x] 添加 Vitest 及相关配置（`vitest.config.*`、`@vitejs/plugin-react` 等按官方/社区 Next 推荐选型，以 **少依赖、可维护** 为准）。
- [x] 至少 **1～3 个** 有断言的单测文件（路径由执行 Agent 按代码结构选定，建议从 **无浏览器强依赖** 的模块开始，例如 `lib/` 下工具函数或 BFF 路由内的纯逻辑抽取测）。
- [x] `package.json`：`scripts.test`（及 CI 所需脚本）；`pnpm-lock.yaml` 更新完整。
- [x] `.github/workflows/quality.yml`：在 `lint` 与 `build` 之间或之后增加 **`pnpm test`**（失败即 job 失败）；必要时拆分 job（例如 `test` 与 `build` 并行）并 **在验收单中说明**。
- [x] 更新 **`Projects/AGENTS.md` §8** 和/或 **`Projects/docs/harness/HARNESS_V2_P0_ACCEPTANCE.md`** / **`HARNESS_V2_PLAN.md` §4 P1**：写入「合并前必绿」含 **`pnpm test`** 与 workflow 名称（**禁止**只改前端仓而根文档不链）。
- [x] （可选）更新前端 `docs/_tech_graph/` 中与测试/质量门相关的 **一句** 引用（若图谱已有 CI 节点则增量一句即可，避免大改）。

## 非范围

- 不引入 Playwright / Cypress **全站 E2E**（可作为后续独立 task）。
- 不修改后端 `pytest.yml` 与 Python 单测范围（另有需求再开 task）。
- 不实现 Harness「帽子」Prompt 文件（`docs/harness/prompts/`，属 P2）。

---

## 依赖与引用

| 依赖项 | 路径/说明 |
|--------|-----------|
| Harness P0 验收 | `Projects/docs/harness/HARNESS_V2_P0_ACCEPTANCE.md` |
| Harness V2 规划 P1 | `Projects/docs/harness/HARNESS_V2_PLAN.md` §4 |
| 前端 CI 现状 | `ai-ink-brain/.github/workflows/quality.yml` |
| PROJECT_CONFIG | `ai-ink-brain/docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md` |
| 任务规范 | `ai-ink-brain/content/tasks/README.md`（Harness §5 字段） |

---

## 验收标准

- [x] 本地：`pnpm install --frozen-lockfile && pnpm lint && pnpm test && pnpm build` 全部通过。
- [ ] CI：`quality`（或约定的新 job 名）在 **PR + push** 至 `main`/`production` 上 **绿灯**，且日志中可见 **`pnpm test`** 执行记录。
- [x] 工作区根文档已更新：**合并前必绿** 清单含 **`pnpm test`** 与对应 workflow / job 名称（路径：`Projects/AGENTS.md` 与/或 `docs/harness/*.md`，以实际修改为准在「实现备忘」回填）。
- [x] 无 `any` 滥用、无未解释禁用的 eslint-disable；新增测试目录被 **`.gitignore` / eslint 忽略** 规则合理（若有 `coverage/` 等）。

---

## 手动测试用例（必须执行）

1. **冷装**：删除 `node_modules` 后仅 `pnpm install --frozen-lockfile && pnpm test`，期望全绿。  
2. **CI 对齐**：推送 PR 后，GitHub Actions 中与前端相关的 workflow **全部成功**。  
3. **文档**：打开根 `AGENTS.md` §8，确认新人可按文档在 **前端仓根目录** 复现与 CI 一致的命令。

---

## 实现备忘（由执行 Agent 回填）

| 项 | 内容 |
|----|------|
| 涉及文件 | `vitest.config.ts`、`lib/utils.test.ts`、`lib/text/chunk.test.ts`、`lib/ai/embeddings/dimension.test.ts`、`package.json`、`pnpm-lock.yaml`、`.github/workflows/quality.yml`、`docs/_tech_graph/02_version.md` |
| Vitest 版本与关键 devDependencies | **vitest** `^4.0.16`（lock 解析 **4.1.6**）；未引入 `@vitejs/plugin-react`（当前单测均为 **node** 环境纯 TS，保持少依赖） |
| 单测文件列表 | `lib/utils.test.ts`、`lib/text/chunk.test.ts`、`lib/ai/embeddings/dimension.test.ts` |
| workflow 变更摘要 | **`quality`** / job **`lint-and-build`**：在 **Lint** 与 **Build** 之间新增 step **`Test`** → **`pnpm test`** |
| 根文档变更文件 | `Projects/AGENTS.md` §8；`Projects/docs/harness/HARNESS_V2_PLAN.md`（§0、§2、§4、§10）；`Projects/docs/harness/HARNESS_V2_P0_ACCEPTANCE.md`（§1、§3、§6、§7） |

---

## 给 Cursor

验收、非范围、`test_strategy: required`、`pnpm test`、`quality.yml`、`HARNESS_V2_PLAN` §4 P1、`AGENTS.md` §8
