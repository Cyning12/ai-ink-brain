# Prompt · 三方 Agent 验收 — 前端编码规范 L2（v1）

| 项 | 内容 |
| --- | --- |
| **状态** | `draft` |
| **版本** | v1.0 |
| **日期** | 2026-06-09 |
| **用途** | 独立于起草者，验收 P2～P4（L2 正文 + L3 规则 + ESLint P4） |
| **落盘** | [`reviews/`](reviews/README.md) |
| **关联** | [`CODING_FRONTEND_L2_v1_zh.md`](CODING_FRONTEND_L2_v1_zh.md) · 工作区 L1 |

---

## 1. 使用方式

1. Open Folder：**`Projects/`**（须读 `ai-ink-brain/` + `docs/standards/`）。
2. 新会话或 `Task(generalPurpose)` 粘贴 **§3**。
3. 验收项含 **文档可执行性** + **L3 规则存在** + **`pnpm lint` 可跑**（若环境允许执行）。
4. 报告落盘 `ai-ink-brain/docs/standards/reviews/review_frontend_L2_R1_YYYYMMDD.md`。

---

## 2. 占位符

| 占位符 | 示例 |
| --- | --- |
| `{{REVIEW_ROUND}}` | `R1` |
| `{{REVIEWER_ROLE}}` | Cursor 三方新会话 |
| `{{FOCUS}}` | `全稿+P3+P4` / `仅 L2 条文` / `仅 ESLint 与 CI` |

---

## 3. 可复制 Prompt 正文

```text
你 = **三方验收 Agent**（独立于编码规范起草者；默认只审不改）。

【环境】
- Open Folder：Projects/
- 须 Read / @ 读取下列本地文件；禁止凭记忆评审。

【纪律】
- 结论附证据：`路径#F-xx` 或 `eslint.config.mjs` 行号。
- 阻塞项须可操作；禁止代签「验收通过」。
- 未授权不得改仓内文件；可建议 diff。

【必读（相对 Projects/）】
1. ai-ink-brain/docs/standards/README.md
2. ai-ink-brain/docs/standards/CODING_FRONTEND_L2_v1_zh.md（F-01～F-14 · §3～§6）
3. docs/standards/CODING_BASELINE_L1_v1_zh.md（L1 §4 PR 自检 · 对照 L2 §4）
4. ai-ink-brain/.cursor/rules/07-coding-standards-l2.mdc（P3 · ≤15 行短链）
5. ai-ink-brain/eslint.config.mjs（P4 · no-explicit-any）
6. ai-ink-brain/docs/meta/PROJECT_CONFIG_AI_INK_BRAIN.md（§C 环境变量 · 对照 F-03）
7. ai-ink-brain/.github/workflows/quality.yml（若有 · 对照 F-14 CI）

【验收输入】
- 轮次：{{REVIEW_ROUND}}
- 评审方：{{REVIEWER_ROLE}}
- 焦点：{{FOCUS}}
- 范围：P2 L2 draft + P3 规则 + P4 ESLint

【验收维度】

V1 L2 与 L1 映射
- 每条 F-xx 是否标注「遵循 B-xx」且可执行？
- F-03/F-05/F-13 与 PROJECT_CONFIG 是否一致？

V2 前端栈落地
- F-08/F-09/F-10 是否覆盖 Next App Router + React 19 实际约束？
- AF-01～AF-05 是否覆盖本仓典型坏例？

V3 L3 可消费性（P3）
- `07-coding-standards-l2.mdc` 是否短链、无全文复制、globs 合理？
- AGENTS.md / docs/tasks/README 是否可链达 L2？

V4 工具背压（P4）
- `eslint.config.mjs` 是否启用 `@typescript-eslint/no-explicit-any: error`？
- 若可执行：在 ai-ink-brain 根运行 `pnpm lint`，报告 pass/fail（失败列规则与文件）。

V5 CI 与 OUTLINE
- F-14 命令是否与 quality.yml / AGENTS §8 一致？
- 工作区 docs/standards/README 是否索引本 L2？

V6 缺口与 P2 后续
- ANTI_PATTERNS 全表、L2 `active` 签收条件、后端 L2 对称性。

【输出】
1. 阅读确认表
2. 完整报告（§4 模板）
3. Executive Summary ≤10 行（阻塞数 / 签收建议）

【禁止】
- 未读必填项即结论
- 用风格偏好否定已明确的 L1/L2 条文
```

---

## 4. 落盘模板

`reviews/review_frontend_L2_{{REVIEW_ROUND}}_YYYYMMDD.md`

```markdown
# 三方验收 — 前端编码规范 L2（{{REVIEW_ROUND}}）

| 状态 | 建议签收 / 须修订 / 阻塞 |
| 评审方 | {{REVIEWER_ROLE}} |
| 焦点 | {{FOCUS}} |

## 维度评分

| 维度 | 结论 | 证据 |
| V1 L1 映射 | | |
| V2 栈落地 | | |
| V3 L3 | | |
| V4 ESLint P4 | | |
| V5 CI | | |
| V6 缺口 | | |

## 阻塞项

| ID | 位置 | 建议 |

## 非阻塞建议

| ID | 位置 | 建议 |

## 签收

- [ ] 建议签收（L2 → active；可并后端 L2）
- [ ] 须修订后再审
```

---

## 5. 修订记录

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| v1.0 | 2026-06-09 | P2～P4 验收 Prompt |
