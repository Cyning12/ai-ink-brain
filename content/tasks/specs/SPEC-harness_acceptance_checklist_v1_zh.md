# SPEC：Harness 关账前 · 前端交互验收清单（v1）

| 项 | 内容 |
|----|------|
| **状态** | `active` |
| **类型** | Harness 规约（`content/tasks/specs/`） |
| **Agent Skill** | `.cursor/skills/harness-close-acceptance-checklist/SKILL.md` |
| **清单模板** | `content/tasks/templates/CHECKLIST_TEMPLATE_acceptance_zh.md` |

---

## 1. 规则（一句话）

**凡关账前需要人在前端（浏览器 / Preview / 生产 URL）做交互验收的 task，必须有独立落盘的验收清单文件；仅 CI 绿不能代替。**

---

## 2. 判定

见 Skill **「何时必须有验收清单」**。

task 文首字段：

| 字段 | 值 |
|------|-----|
| `acceptance_interaction` | `required` \| `not_applicable` |
| **验收清单**（元信息第二行或链） | `content/tasks/reinspect_results/CHECKLIST_<task_basename>_acceptance_zh.md` |

---

## 3. 落盘与帽序

见 Skill **「落盘路径」** · **「帽序职责」**。

**参考实例**：[`CHECKLIST_task_portfolio_e2e_demo_qa_v1_acceptance_zh.md`](../reinspect_results/CHECKLIST_portfolio_e2e_demo_qa_v1_acceptance_zh.md)（Portfolio W6）。

---

## 4. 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-06-03 | v1：Skill + 模板 + SPEC 初版（W6 实践沉淀） |
