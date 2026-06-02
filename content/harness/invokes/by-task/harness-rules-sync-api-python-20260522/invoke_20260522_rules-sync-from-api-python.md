# Harness invoke — 前端 Rules 与 AGENTS 同步（对齐后端 2026-05-22）

| 字段 | 值 |
| --- | --- |
| hat_id | 30（执行） |
| template | 跨仓 rules 同步 Prompt（非标准 TEMPLATE-execute；见下文 §可复制 Prompt） |
| task_paths | 无独立 task 单；来源配对仓 `ai-ink-brain-api-python` commits `b8508b2`、`decad0f` |
| related_review_or_none | 无 |
| source_repo | `ai-ink-brain-api-python` |
| source_commits | `b8508b2`（gen_agents_md）、`decad0f`（08-docs-diary + 10-tech-graph 收紧） |
| git_branch | 当前前端研发分支（建议 `main` 或独立 `task/rules-sync-api-python-20260522`） |
| worktree_root | `ai-ink-brain`（主 checkout 即可） |
| created | 2026-05-22 |
| revised | 2026-05-22 |

## 说明

- **目标**：将后端今日 **rules 通用化**（diary 非必读、graph_query 生产轨、AGENTS 自动段）同步到本仓，路径按前端约定适配。
- **非范围**：不改 `app/`/`components/` 业务逻辑；不迁移 `content/diary/`；不复制 `jsonPKmermaid/` 到本仓；**无用户明确要求不要 commit**。
- **参考只读**：`ai-ink-brain-api-python/.cursor/rules/{08-docs-diary,10-tech-graph}.mdc`、`tools/gen_agents_md.py`、`AGENTS.md`。

---

## 可复制 Prompt 正文（整段粘贴到新对话 user）

```text
你正在 ai-ink-brain（Next.js 前端）仓执行 **Rules 与 AGENTS 同步升级**，对齐配对后端 ai-ink-brain-api-python 今日提交 b8508b2、decad0f。只改规则与文档，不改业务代码。

## 背景

| 提交 | 内容 |
|------|------|
| b8508b2 | tools/gen_agents_md.py：从 .cursor/rules/*.mdc 生成 AGENTS.md（<!-- RULES_AUTO_GENERATED -->）；--check |
| decad0f | 08-docs-diary.mdc；收紧 10-tech-graph.mdc；AGENTS 非必读表；docs/diary/DIARY_GUIDE 文首约定 |

## 验收

- [ ] .cursor/rules/08-docs-diary.mdc（alwaysApply: true）
- [ ] 10-tech-graph.mdc 与后端生产轨/实验轨语义对齐（graph_query 优先、jsonPKmermaid 非必读）
- [ ] tools/gen_agents_md.py + AGENTS.md marker；python3 tools/gen_agents_md.py 可再生
- [ ] AGENTS.md：diary 移出必读，新增「非必读（按需）」表
- [ ] .cursor/rules/README.md 更新分工
- [ ] （推荐）05-harness-semi-auto.mdc、00-core.mdc
- [ ] docs/diary/DIARY_GUIDE.md 文首 §0（不存在则创建）
- [ ] python3 tools/gen_agents_md.py --check 通过

## 路径映射（强制）

| 概念 | 后端 | 本仓 |
|------|------|------|
| 任务单 | docs/tasks/active/ | content/tasks/active/ |
| invoke | docs/harness/invokes/ | content/harness/invokes/ + 工作区 Projects/docs/harness/ |
| Agent 总结 diary | docs/diary/ | docs/diary/（无则创建） |
| 博客日记正文 | — | content/diary/（同样非必读） |
| jsonPKmermaid | 本仓 docs/diary/jsonPKmermaid/ | 只读 ../ai-ink-brain-api-python/docs/diary/jsonPKmermaid/ |
| graph_query | python tools/tech_graph_graph_query.py | pnpm tech-graph:query |
| 图谱 globs | api/** | app/**、components/**、lib/**、docs/_tech_graph/** |

## 任务 1：新增 .cursor/rules/08-docs-diary.mdc

frontmatter：
---
description: diary — 非必读、易过时产物；实验轨 jsonPKmermaid 按需读（跨仓引用后端）
alwaysApply: true
---

正文要点：
1. 非必读：docs/diary/、content/diary/ 全树；禁止无关 glob/预加载。
2. 何时可读：用户 @；content/tasks/* 或 content/harness/invokes/* 显式路径；排障锁定具体文件。
3. 真值：docs/_tech_graph/、docs/meta/、content/tasks/、content/tasks/specs/ > diary。
4. 落盘：易过时 → docs/diary/；长期结论 → _tech_graph / content/tasks/done/ / 99_spec.md。
5. 实验轨：jsonPKmermaid 在配对后端仓；仅 task 指向 fixtures/reports 时读最小集；禁止日常遍历。
6. 日期总结：docs/diary/YYYY-MM-DD.md 按需；格式遵工作区 DIARY_GUIDE.md。

## 任务 2：升格 .cursor/rules/10-tech-graph.mdc

在现有前端 flow 列表上合并后端 decad0f 语义。frontmatter globs：docs/_tech_graph/**、app/**、components/**、lib/**。

必须增补：jsonPKmermaid 非必读（见 08）；双轨制表；禁止手改 graph.json、整包灌 prompt；Agent 读取顺序用 pnpm tech-graph:query；T003/fixtures 仅 task 指向后端路径时；物化轨实验轨非必读；稳定引用 graph_v2_schema、工作区 SPEC；按需引用后端 jsonPKmermaid。目录树补 graph.json、_manifest.json、_contract_manifest.json。保留现有水墨/路由叙述。

## 任务 3：tools/gen_agents_md.py

从 ai-ink-brain-api-python/tools/gen_agents_md.py 原样复制到本仓 tools/。AGENTS.md 安全红线后插入 <!-- RULES_AUTO_GENERATED -->。必读 §2 注明 gen_agents_md；原必读第 6 条（日记）移到「非必读」表：

## 非必读（按需）

| 路径 | 说明 |
|------|------|
| docs/diary/ | Agent 总结、实验报告；默认不读 |
| content/diary/ | 博客日记正文素材；默认不读 |
| 配对后端 docs/diary/jsonPKmermaid/ | 图谱实验轨；仅 task/闸口复现 |
| 写作规范 | docs/diary/DIARY_GUIDE.md + 工作区 DIARY_GUIDE.md |

执行：python3 tools/gen_agents_md.py（marker 以下勿手改）。

## 任务 4：.cursor/rules/README.md

增加 00-core、05-harness-semi-auto（若新增）、08-docs-diary；更新 10-tech-graph 说明。

## 任务 5（推荐）：05-harness-semi-auto.mdc、00-core.mdc

05：复制后端，替换 docs/tasks/active/ → content/tasks/active/；docs/harness/invokes/ → content/harness/invokes/。
00：与后端 00-core.mdc 同文。

## 任务 6：docs/diary/DIARY_GUIDE.md

文首 §0：docs/diary 与 content/diary 非必读；落盘纪律；实验轨指向后端 jsonPKmermaid。后接前端日记写作说明。

## 非范围

- 不修改 app/、components/ 业务代码
- 不迁移 content/diary/ 历史
- 不复制 jsonPKmermaid 到本仓
- 除非用户要求，不要 git commit

## 自检

cd <ai-ink-brain>
python3 tools/gen_agents_md.py
python3 tools/gen_agents_md.py --check
ls .cursor/rules/*.mdc

完成后回复：变更文件列表、与后端的刻意差异、--check 结果。
```

---

## 修订记录

| 日期 | 说明 |
| --- | --- |
| 2026-05-22 | 初版：由后端 Agent 生成，落盘 `content/harness/invokes/` 供前端 Agent 续跑 |
