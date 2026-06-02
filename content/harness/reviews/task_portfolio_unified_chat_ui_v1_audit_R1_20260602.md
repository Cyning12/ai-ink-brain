# Task 审查 R1 · portfolio-unified-chat-ui-v1

| 字段 | 值 |
|------|-----|
| **task** | `content/tasks/active/task_portfolio_unified_chat_ui_v1.md` |
| **轮次** | R1（需求审计 · 进 30 前） |
| **日期** | 2026-06-02 |
| **审查帽** | 22 |
| **git_branch** | `task/portfolio-visitor-auth-v1` |
| **freeze_id** | `PORTFOLIO-RAG-DEMO@2026-06-01` |
| **基线** | W3 `3d74537` · task 定稿 `2973731` |

## 审查结论摘要

**结论：放行 → 可进帽 30（实现）**

task 10 帽定稿与 SPEC §4.4 · §6.4 · §6.6、投递计划 §2 chip 逐字 **对齐**；access_level 持久化方案与 W3 ChatBI unlock **不冲突**；failure_paths F1–F6 覆盖 visitor 误开 debug URL 与 re-verify 降级。

**下一棒**：维护者将 **HG-AUDIT-R1** → `approved` 后执行 30。

---

## 对照 SPEC §4.4 / §6.6（档位 → UI）

| SPEC 项 | visitor（L2） | visitor-admin（L0/L1） | task 定稿 | 判定 |
|---------|---------------|------------------------|-----------|------|
| Router Debug 隐藏 | 隐藏 | 隐藏 | `portfolioRouterDebugVisible` 恒 false | ✅ |
| Timeline + ExecutionTrace | 隐藏 | 可见 | `portfolioTimelineVisible(tier)` | ✅ |
| `?debug=1` | 忽略 | 尊重 | visitor `debugEnabled` 恒 false | ✅ |
| Text2SQL / prefer | 保留 | 保留 | 未裁剪 prefer 控件 | ✅ |
| 五问 chip | 5 条 | 5 条 | locked + unlocked 均展示 | ✅ |
| unlock 主路径 | ChatBI token | 同左 | 不改 W3 verify 流程 | ✅ |

---

## 五问 chip 逐字对照（§6.4 · 投递 §2）

| ID | task / SPEC 文案 | 逐字一致 |
|----|------------------|----------|
| Q1 | 《AI 编程可闭环协作》**卷三**讲什么？Harness 和签收是什么？ | ✅ |
| Q2 | **RAG 混合检索**怎么做的？ | ✅ |
| Q3 | **冷/温/热** 和 **架构三层** 区别？ | ✅ |
| Q4 | **11 年经历**里 AI Coding 相关成果？ | ✅ |
| Q5 | 按需读图相对整图灌入 **token/效果**？**边界**？ | ✅ |

---

## access_level 持久化（可实施性）

| 检查项 | 结论 |
|--------|------|
| 存储：`sessionStorage` + token `localStorage` 分离 | ✅ 合理；level 随 tab 会话，token 跨刷新 |
| unlock 写入 + mount re-verify 补 level | ✅ 覆盖刷新丢 level |
| clear 与 `clearChatbiToken` / 401 联动 | ✅ task 已要求 |
| 档位映射 L2 / L0·L1 / 保守 visitor | ✅ 与后端 token gen 语义一致 |
| 不改 BFF / Python | ✅ 非范围遵守 |

---

## failure_paths F1–F6

| # | task 描述 | R1 判定 |
|---|-----------|---------|
| F1 | portfolio 误展示 Router Debug | ✅ 可测 |
| F2 | visitor 仍见 Timeline/Trace | ✅ 可测 |
| F3 | chip 差一字 | ✅ 40 帽逐字表 |
| F4 | development 误隐藏 Router Debug | ✅ 回归项明确 |
| F5 | re-verify 失败 → 保守 visitor | ✅ 安全默认 |
| F6 | visitor + `?debug=1` 忽略 | ✅ 补 SPEC 缺口 |

---

## development 回归

- task 明确：**3 条通用 chip 不变**；Router Debug / Timeline / debug URL **全保留**。
- 实现备忘：`debugEnabled` 仅 portfolio 分支分叉 → **Low 回归风险**。

---

## 非范围确认

- `/evidence` Q3/Q5 锚点：10 帽 **不做** → ✅ 不阻塞 W4
- W6 五问 E2E / Python / unlock API 变更 → ✅ 未越界

---

## 阻塞项 / 退回 10

**无。** 无缺口须退回 10。

---

## 审计签章

| 项 | 值 |
|----|-----|
| **R1 结论** | **PASS · 放行 30** |
| **HG-AUDIT-R1** | 待人批 `approved` |
| **invoke 下一棒** | `invoke_20260602_22R1_portfolio-unified-chat-ui-execute.md` → 帽 30 |
