# Portfolio 内容同步（W5）

将 sibling 仓 [`ai-coding-closed-loop-articles`](../../ai-coding-closed-loop-articles) 中的 **MVP 三文件** 幂等复制到本仓 `content/methodology/`、`content/resume/`、`content/evidence/`。

## 前置

| 项 | 说明 |
|----|------|
| articles 仓 | 与 `ai-ink-brain` 并列 clone；仓根须含 `ARTICLE_*_vol3_*.md` |
| 可选简历源 | `--docs-root` 下 `cv-online.md`，否则生成 **resume stub** |
| 后端 ingest | 配对 `ai-ink-brain-api-python` 进程须设 **`CONTENT_ROOT=<本仓绝对路径>/content`** |

## 用法

```bash
chmod +x tools/sync-portfolio-content.sh

# 默认路径（sibling articles + assets）
./tools/sync-portfolio-content.sh

# 预览
./tools/sync-portfolio-content.sh --dry-run

# 覆盖已存在文件
./tools/sync-portfolio-content.sh --force

# 自定义源
./tools/sync-portfolio-content.sh \
  --articles-root /path/to/ai-coding-closed-loop-articles \
  --docs-root /path/to/ai-coding-closed-loop-articles/assets
```

stdout 末尾输出 **sync manifest**；连续两次运行（无 `--force`）应 **SKIP** 已存在文件。

## 同步后触发 ingest（人工）

1. 后端 `.env`：`CONTENT_ROOT=/absolute/path/to/ai-ink-brain/content`
2. 本仓 `pnpm dev`（BFF `localhost:3000`）
3. 触发（与 `app/api/admin/sync/route.ts` 一致）：

```bash
curl -sS -X POST "http://localhost:3000/api/admin/sync" \
  -H "x-admin-token: $NEXT_PUBLIC_ADMIN_SECRET" \
  -H "Content-Type: application/json"
```

4. 若响应含 `jobId`，轮询：`GET "http://localhost:3000/api/admin/sync?jobId=<id>"`

**硬 FAIL**：`result.filesScanned === 0`（三目录任一无 `.md` 或 `CONTENT_ROOT` 错误）。通过门槛：`filesScanned > 0` 且 `chunksUpserted > 0`（五问质量属 **W6**）。

## 禁止

- 脚本内 **禁止** 嵌入 API Key
- **禁止** 将 `content/tasks/`、`content/harness/` 等维护目录同步进 portfolio 路径

## 关联

- Task：`content/tasks/active/task_portfolio_content_sync_script_v1.md`
- SPEC：`content/tasks/specs/SPEC-portfolio_demo_site_v1_zh.md` §4.5 · §6.5
