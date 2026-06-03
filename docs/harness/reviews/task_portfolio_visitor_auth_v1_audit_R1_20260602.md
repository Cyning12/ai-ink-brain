# Task 审查 R1 · portfolio-visitor-auth-v1

| 字段 | 值 |
|------|-----|
| **task** | `docs/tasks/active/task_portfolio_visitor_auth_v1.md` |
| **轮次** | R1 |
| **日期** | 2026-06-02 |
| **审查帽** | 22 |
| **git_branch** | `task/portfolio-visitor-auth-v1` |

## 审查结论摘要

**结论：放行 → 可进 30**

task 验收与 SPEC §4.3 对齐；failure_paths F1–F4 已列；W4（debug/chip）与 W6（SSE Bearer/五问）边界清晰。

## 核对清单

- [x] 双 env `PORTFOLIO_VISITOR_*` · TTL 72h/24h
- [x] unlock 优先级 portfolio → Ink → ChatBI
- [x] Cookie HMAC · 禁止明文秘钥
- [x] session 返回 `role` + `expiresAt`
- [x] portfolio Unified 邮件 UX · 隐藏 ChatBI DB 明文 UI
- [x] `gen-portfolio-secrets.sh` 交付
- [x] 公开静态页零 gate（非范围明确 middleware 禁止）

## 阻塞项

无。

## 建议

- 30 帽补充 `portfolio-session` 单测
- merge 前建议浏览器 unlock 烟测（可记入 50 warn）

## 下一棒

**30 执行**（HG-AUDIT-R1 `approved`）
