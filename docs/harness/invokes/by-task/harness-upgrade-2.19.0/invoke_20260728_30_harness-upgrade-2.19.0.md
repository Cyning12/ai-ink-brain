# Invoke · 30 · harness-upgrade-2.19.0

| 字段 | 值 |
|------|-----|
| **hat** | `30` |
| **task** | `docs/tasks/active/task_harness_upgrade_2.19.0.md` |
| **task_slug** | `harness-upgrade-2.19.0` |
| **git_branch** | `task/harness-upgrade-2-19-0` |
| **日期** | 2026-07-28 |

---

## §3 执行摘要

1. 基线：自 `task/harness-upgrade-2-18-migrate`（2.18.0）开 `task/harness-upgrade-2-19-0`
2. `npx --yes @cyning/harness@2.19.0 upgrade --yes --target .`（不带 `--ide`）
3. 恢复 Ink overlay：`.cursor/rules/06-harness-pointer.mdc`；钉 `harness.pin.json=2.19.0`
4. `check` → 已是最新 · exit 0
5. `task lint-wiki-delta --scope all`：初扫 missing=11 → 按 `## Harness 元信息` 可解析表补齐 → **PASS missing=0**
6. 质量门：`pnpm lint` / `test` / `build`
7. 落盘本 task + R1；`verify --task`；`task close --file … --yes`

## 命令留证

```text
manifest.version=2.19.0 · preset=harness-only · ide=["cursor"] · from_version=2.18.0
LINT-WIKI-DELTA: PASS · scanned=58 · missing=0
WikiTrack: 未启用（本波）
```

## 自检

- [x] 未改业务页面/BFF
- [x] 未关无关 active 业务 task
- [x] 未默认 `--allow-*-gap`
- [x] 未使用 `task close --target .`
