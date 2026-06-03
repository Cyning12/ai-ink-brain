# Portfolio 内容同步（W5）

将 sibling 仓 [`ai-coding-closed-loop-articles`](../../ai-coding-closed-loop-articles) 中的 **MVP 语料** 幂等复制到本仓 `content/methodology/`、`content/resume/`、`content/evidence/`。

`evidence/` 默认 **两个文件**：`methodology-card.md`（PUBLISH 节选 · Q3 长卡）与 **`evidence-card.md`（检索用摘要 · Q3/Q5 短段，含 1/9 边界）**。

## 前置

| 项 | 说明 |
|----|------|
| articles 仓 | 与 `ai-ink-brain` 并列 clone；仓根须含 **`ARTICLE_*_vol3_*.md`**（legacy）或 **`*卷三*.md`**（公众稿现行命名） |
| 可选简历源 | `--docs-root` 下 `cv-online.md`，否则生成 **resume stub** |
| 后端 ingest | 配对 `ai-ink-brain-api-python` 进程须设 **`CONTENT_ROOT=<本仓绝对路径>/content`** |
| **鉴权** | 维护者 **服务端** 密钥：`SYNC_ADMIN_SECRET`（与 Python admin 同值；shell 文档别名 **`ADMIN_TOKEN`**）。**禁止** 在 curl 示例中使用 `NEXT_PUBLIC_ADMIN_SECRET` |

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
2. 本仓 `.env.local`：`SYNC_ADMIN_SECRET=<与 Python admin 同值>`（**勿** 提交 Git）
3. 任选其一：

**路径 A — 直连 Python（推荐 · 对齐投递计划 §3.3）**

```bash
export ADMIN_TOKEN="$SYNC_ADMIN_SECRET"   # 文档别名，非 env 键名

curl -sS -X POST "$PY_API_URL/api/py/admin/sync" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**路径 B — 经 BFF（本地 `pnpm dev` 已起）**

```bash
curl -sS -X POST "http://localhost:3000/api/admin/sync" \
  -H "Authorization: Bearer $SYNC_ADMIN_SECRET" \
  -H "Content-Type: application/json"
```

4. 若响应含 `jobId`，轮询：`GET ".../admin/sync?jobId=<id>"`（路径 A 用 `$PY_API_URL/api/py/admin/sync?jobId=…`；路径 B 用 `localhost:3000/api/admin/sync?jobId=…`）

**硬 FAIL**：`result.filesScanned === 0`（三目录任一无 `.md` 或 `CONTENT_ROOT` 错误）。通过门槛：`filesScanned > 0` 且 `chunksUpserted > 0`（五问质量属 **W6**）。

**废弃（勿再使用）**

```bash
# ❌ admin/sync 已废弃 NEXT_PUBLIC_ADMIN_SECRET / x-admin-token 文档示例
-H "x-admin-token: $NEXT_PUBLIC_ADMIN_SECRET"
```

## 禁止

- 脚本内 **禁止** 嵌入 API Key
- **禁止** 将 `docs/tasks/`、`docs/harness/` 等维护目录同步进 portfolio 路径
- **visitor / visitor-admin** 秘钥 **无** sync 能力（投递计划 §3.4）

## 关联

- Task：`docs/tasks/active/task_portfolio_content_sync_script_v1.md`
- SPEC：`docs/tasks/specs/SPEC-portfolio_admin_sync_auth_v1_zh.md` · `SPEC-portfolio_demo_site_v1_zh.md` §4.5 · §6.5
