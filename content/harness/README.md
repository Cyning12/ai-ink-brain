# content/harness（前端仓 Harness 产物）

> 用途：存放前端仓 Harness 的 `invokes/`、`reviews/` 与本仓对照说明。  
> 对照基线：`ai-ink-brain-api-python/docs/harness/README.md` §2.1（taxonomy）。

---

## 前后端 taxonomy 对照（P1-4 parity）

| 维度 | 前端仓（本目录） | 后端仓基线（§2.1） | parity 说明 |
| --- | --- | --- | --- |
| prompts hats/templates/handoff | 工作区 `Projects/docs/harness/prompts/` 作为共享真值（当前前端仅消费） | `docs/harness/prompts/{hats,templates,handoff}` | 前端不复制帽子正文，保持单源，避免漂移 |
| invokes 落盘 | `content/harness/invokes/` | `docs/harness/invokes/by-task/<task_slug>/` | 前端已具备 invoke 真值目录，后续按 task_slug 子目录演进 |
| reviews 落盘 | `content/harness/reviews/` | `docs/harness/reviews/by-task/<task_slug>/` | 前端已具备 review 真值目录，当前命名可追溯 |
| 50 复检沉淀 | `content/harness/reviews/`（沿用本仓约定） | `docs/tasks/reinspect_results/` | 前端仓可在下一轮 parity 对齐到独立 `reinspect_results` |
| 指针策略 | 工作区 `docs/harness/reviews/` 与 `docs/harness/invokes/` 可写 pointer 指回前端真值 | 工作区同样支持 pointer | 双仓均采用“真值单点 + 指针索引” |

---

## 前端 基准 slug（已锁定）

> 状态：`HG-FRONTEND-GOLD-SLUGS` **approved**（2026-05-27）· 工作区 task `task_harness_frontend_p1_4_wiki_parity_v1` 已关账。

- `frontend-tech-graph-v2-manifest`
- `frontend-vercel-ai-sdk-main-stream`
- `frontend-unified-chat-typewriter-v0`

---

## 约束重申

- 不修改 `ai-ink-brain-api-python/api/`。
- 不新增或改写后端 `docs/coding_wiki/syntheses/`。
- 关账 PR 描述需引用 AB-REP scorecard：`60.8%–77.3%` 与 `5/6 W 4/4`。
