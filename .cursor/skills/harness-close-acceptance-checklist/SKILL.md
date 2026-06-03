---
name: harness-close-acceptance-checklist
description: >-
  Ink Harness 关账（40/50/CLOSE）前：若 task 含须人在浏览器/Preview 上完成的前端交互验收，
  必须落盘可勾选验收清单（CHECKLIST_*_acceptance_zh.md），并在 task/reinspect 中链路径。
  用于 CLOSE、HG-REINSPECT、50 复检、E2E/演示/五问/录屏类 task、或用户要求验收清单时。
  与 harness-looptask-handoff 配合使用。
---

# Harness 关账前 · 前端交互验收清单（Ink）

## 何时必须有验收清单

task 满足 **任一** 即 `acceptance_interaction: required`（文首 Harness 元信息 **必填**）：

| 信号 | 示例 |
|------|------|
| 人在 **浏览器** 点按、解锁、看 UI | Unified Chat unlock、chip 五问、录屏 |
| **Preview / 生产 URL** 验收 | Vercel Preview、§6.7 同项目演示 |
| `test_strategy_note` 写明人工/E2E/预跑 | 「Preview URL 人工五问」 |
| 验收标准含 **录屏 / 截图 / Timeline 留证** | P0-D 演示素材 |
| **HG-REINSPECT** 且 blocks `done` | 关账前人签演示层 |

**不必**清单（填 `acceptance_interaction: not_applicable` + **一行理由**）：

- 仅改文档/配置、无页面行为变更  
- 仅 `pnpm lint/test/build` 且 task 明确无 URL 验收  
- 纯后端/跨仓且 Open Folder 不在本仓 UI  

**拿不准**：默认 `required`，10 帽在 task 写清。

---

## 落盘路径与命名（强制）

| 项 | 约定 |
|----|------|
| **路径** | `content/tasks/reinspect_results/CHECKLIST_<task_basename>_acceptance_zh.md` |
| **basename** | 与 task 文件名一致，如 `task_portfolio_e2e_demo_qa_v1` → `CHECKLIST_task_portfolio_e2e_demo_qa_v1_acceptance_zh.md` |
| **模板** | 复制 [`content/tasks/templates/CHECKLIST_TEMPLATE_acceptance_zh.md`](../../content/tasks/templates/CHECKLIST_TEMPLATE_acceptance_zh.md) 后替换占位符 |
| **禁止** | 仅在对话里列 checkbox 不落盘；仅用 task 正文表代替独立 CHECKLIST 文件 |

---

## 帽序职责

| 帽 | 动作 |
|----|------|
| **10** | 判定 `acceptance_interaction`；验收标准拆成 **可勾选行**；task 文首链 CHECKLIST（可先「待 40 创建」） |
| **30–40** | Agent 能跑的勾 **Agent** 列（如 CI）；不能跑的留 **维护者 ☐** |
| **50** | reinspect **必须** 引用同一 CHECKLIST；写明 Agent 已勾 / 待人勾 |
| **CLOSE** | **硬停**：无 CHECKLIST 文件或 §H 未填且 `acceptance_interaction: required` → **不得** `git mv` done、不得代签 `HG-REINSPECT` |

---

## CHECKLIST 最低结构

1. **元信息**：task 路径 · task_slug · freeze_id · deadline（可选）  
2. **分节**：至少 **环境/前置** · **交互步骤**（逐步 ☐） · **CI/自动化**（若有） · **Harness 关账**（reviews/reinspect/gate）  
3. **§H 维护者签收**：可关账 / 豁免 / 仍阻塞 · 签字栏  
4. 与 task **五问/录屏/路由** 表 **语义一致**，不引入 task 未声明的验收项  

---

## task 文首必填（有交互验收时）

在 Harness 元信息表增加：

```markdown
| **acceptance_interaction** | `required` |
| **验收清单** | `content/tasks/reinspect_results/CHECKLIST_<basename>_acceptance_zh.md` |
```

`not_applicable` 时第二行可写「—」并附 `acceptance_interaction_note` 一行。

---

## 与 50 / CLOSE / looptask-handoff 关系

- **50**：`task_*_reinspect_*.md` 文首表增加 **验收清单** 链到 CHECKLIST（与 reinspect 并列，不可省略）  
- **CLOSE**：[`harness-looptask-handoff`](../harness-looptask-handoff/SKILL.md) 的「须人手动改动」表 + 本清单 §H  
- **示例**：`CHECKLIST_task_portfolio_e2e_demo_qa_v1_acceptance_zh.md`（Portfolio W6）

---

## Agent 禁止

- 代勾维护者 ☐ 或写「视同通过」  
- 五问/录屏未验却将 50 标为全绿 pass（应 `pass-with-notes` + 清单待人勾）  
- `HG-REINSPECT` `pending` → `approved`  

---

## 给 Cursor

`CHECKLIST`、`acceptance_interaction`、`HG-REINSPECT`、`Preview`、`关账前`、`reinspect_results`、`50`、`CLOSE`
