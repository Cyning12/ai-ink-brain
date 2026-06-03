#!/usr/bin/env bash
# Portfolio 演示：从 sibling articles 仓幂等同步 MVP 三文件到 content/{methodology,resume,evidence}
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARTICLES_ROOT="${REPO_ROOT}/../ai-coding-closed-loop-articles"
DOCS_ROOT="${ARTICLES_ROOT}/assets"
DRY_RUN=0
FORCE=0

usage() {
  cat <<'EOF'
用法: tools/sync-portfolio-content.sh [选项]

  --articles-root PATH   默认 ../ai-coding-closed-loop-articles（相对本仓根）
  --docs-root PATH       默认 <articles-root>/assets
  --dry-run              仅打印将复制/跳过的路径
  --force                覆盖已存在目标文件（默认跳过）
  -h, --help             显示帮助

同步后请在后端设置 CONTENT_ROOT=<本仓>/content 并 POST /api/admin/sync（见 tools/README-portfolio-content-sync.md）
EOF
}

log() { printf '%s\n' "$*"; }
log_err() { printf '%s\n' "$*" >&2; }

# 卷三源：legacy ARTICLE_*_vol3_* → 仓根 *卷三*.md（公众稿重命名后）
resolve_vol3_src() {
  local candidates=()
  shopt -s nullglob
  candidates=("$ARTICLES_ROOT"/ARTICLE_*_vol3_*.md)
  if [[ ${#candidates[@]} -gt 0 ]]; then
    ls -t "${candidates[@]}" | head -n 1
    return 0
  fi
  candidates=("$ARTICLES_ROOT"/*卷三*.md)
  if [[ ${#candidates[@]} -gt 0 ]]; then
    ls -t "${candidates[@]}" | head -n 1
    return 0
  fi
  return 1
}

SYNCED=()

# 复制或写 stub；已存在且非 --force 时跳过
materialize() {
  local dest="$1"
  local mode="$2" # copy:<src> | stub:<kind>

  if [[ -f "$dest" && "$FORCE" -eq 0 ]]; then
    log "SKIP ${dest#"$REPO_ROOT"/} (exists)"
    SYNCED+=("$dest")
    return 0
  fi

  local dest_rel="${dest#"$REPO_ROOT"/}"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "DRY-RUN ${mode} -> ${dest_rel}"
    SYNCED+=("$dest")
    return 0
  fi

  mkdir -p "$(dirname "$dest")"
  case "$mode" in
    copy:*)
      local src="${mode#copy:}"
      cp "$src" "$dest"
      log "SYNC ${dest_rel} <- ${src}"
      ;;
    stub:resume)
      cat >"$dest" <<'STUB'
---
title: 在线简历（Portfolio 演示）
description: AI Coding 与 RAG 相关经历摘要（演示 stub，可替换为真值）
date: 2026-06-01
---

# 简历摘要

## RAG 与混合检索

本仓库演示采用 **向量检索 + 全文混合检索**，并对 top-k 结果做 **rerank**，以支撑 Unified Chat 中的 RAG 问答。

## AI Coding 成果（示例）

- 百果园 Cursor 工程化试点与 Ink-Brain 博客/RAG 站点
- 《AI 编程可闭环协作》连载与 Harness 签收实践

> 由 `tools/sync-portfolio-content.sh` 生成的最小 stub；维护者可从 `--docs-root` 提供 `cv-online.md` 覆盖。
STUB
      log "SYNC ${dest_rel} (stub resume)"
      ;;
    stub:evidence)
      cat >"$dest" <<'STUB'
---
title: 方法论证据卡
description: 记忆分层与按需读图边界（Portfolio 演示）
date: 2026-06-01
---

# 证据卡

## 冷 / 温 / 热 与架构三层

- **冷/温/热**：指 **记忆与上下文分层**（长期知识、会话缓存、即时工具输出），用于控制 RAG 与 Agent 的上下文成本。
- **架构三层**：指 **Inform / Constrain / Verify** 等工程分层，描述「写什么真值、用什么规则、如何验收」，与记忆分层 **不是同一维度**。

## 按需读图 vs 整图灌入

在固定评测集上，**子图查询（graph_query）** 相对整包 `graph.json` 灌入，token 约降至 **十分之一（约 1/9）** 量级；适用于 **小样本、单仓** 场景，**不能** 外推为全行业默认。

> 由 `tools/sync-portfolio-content.sh` 生成；无 PUBLISH 源时的 fallback。有 PUBLISH 时请同时保留 `evidence/evidence-card.md` 摘要卡。
STUB
      log "SYNC ${dest_rel} (stub evidence)"
      ;;
    stub:evidence-card)
      cat >"$dest" <<'STUB'
---
title: 证据摘要卡（按需读图 · 记忆分层）
description: Portfolio RAG 演示用压缩摘要；相对 methodology 长文与 methodology-card 全文，专供 Q3/Q5 检索
date: 2026-06-03
---

# 证据摘要卡

> **定位**：`evidence` 目录下的 **检索用摘要**（distill card），不是卷三正文替代品。
> 长文见 `methodology/vol3_*`；协作细节见 `evidence/methodology-card.md`（PUBLISH 节选）。
> 本卡把 **Q3 纠偏** 与 **Q5 token 边界** 压成短段，便于 RAG 命中关键词。

---

## 冷 / 温 / 热 与架构三层（Q3）

- **冷/温/热**：**记忆与上下文分层**（长期知识、会话缓存、即时工具输出），用于控制 RAG 与 Agent 的上下文成本。
- **架构三层**：**Inform / Constrain / Verify** 等工程分层，描述「写什么真值、用什么规则、如何验收」。
- **二者不是同一维度**：记忆分层 ≠ 架构分层；勿把「冷层」直接等同于「Inform 层」。

| 层 | 一句话 |
| --- | --- |
| **冷层** | 不常变的结构地图（≈ 卷二技术图谱）；任务单里的 **图谱入口** |
| **温层** | 协作轨迹：任务单 + 书面签收 + 回顾摘要 |
| **热层** | 运行时事件记忆（远期、非日常必做） |

---

## 按需读图 vs 整图灌入（Q5）

**问题**：Agent 改代码时，是 **按需读图**（子图 / `graph_query`）还是 **整图灌入**（整包 `graph.json`）更省 token、效果如何？边界在哪？

**结论（固定评测集 · 单仓小样本）**：

- **按需读图**：通过 **`graph_query` 子图查询** 只拉入口节点与邻居，相对把整包 **`graph.json` 灌进上下文**。
- **token 效果**：在演示后端固定评测集上，按需读图 token 约降至 **十分之一（约 1/9）** 量级。
- **适用边界**：适用于 **小样本、单仓、图谱已维护** 的场景；**不能** 外推为全行业或任意大仓默认策略。
- **与冷层关系**：冷层强调「挂到地图上再动手」——工程上通常 **先读图谱入口与影响面**，而不是全仓库乱搜或整图灌入；但 **1/9 数值来自 graph_query 对照实验**，不是泛泛的「少读文件」口号。

**检索关键词**：按需读图、整图灌入、graph_query、graph.json、token、约 1/9、十分之一、小样本边界。

---

> 由 `tools/sync-portfolio-content.sh` · `stub:evidence-card` 生成；ingest 后 category=`evidence`。
STUB
      log "SYNC ${dest_rel} (stub evidence-card)"
      ;;
    *)
      log_err "internal: unknown mode $mode"
      return 1
      ;;
  esac
  SYNCED+=("$dest")
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --articles-root)
      ARTICLES_ROOT="$2"
      shift 2
      ;;
    --docs-root)
      DOCS_ROOT="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --force)
      FORCE=1
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      log_err "未知参数: $1"
      usage >&2
      exit 1
      ;;
  esac
done

if [[ ! -d "$ARTICLES_ROOT" ]]; then
  log_err "ERROR: --articles-root 不存在或不可读: $ARTICLES_ROOT"
  log_err "请 clone ai-coding-closed-loop-articles 或通过 --articles-root 指定路径"
  exit 1
fi

ARTICLES_ROOT="$(cd "$ARTICLES_ROOT" && pwd)"
if [[ ! -d "$DOCS_ROOT" ]]; then
  log_err "WARN: --docs-root 不存在，将使用 resume/evidence stub: $DOCS_ROOT" >&2
fi

shopt -s nullglob
vol3_src=""
if vol3_src="$(resolve_vol3_src)"; then
  :
else
  log_err "ERROR: 缺卷三源（未找到 ARTICLE_*_vol3_*.md 或仓根 *卷三*.md）"
  log_err "  articles-root: $ARTICLES_ROOT"
  exit 1
fi

vol3_base="$(basename "$vol3_src")"
if [[ "$vol3_base" == ARTICLE_* ]]; then
  methodology_dest="${REPO_ROOT}/content/methodology/vol3_${vol3_base}"
else
  methodology_dest="${REPO_ROOT}/content/methodology/${vol3_base}"
fi
materialize "$methodology_dest" "copy:${vol3_src}"

resume_dest="${REPO_ROOT}/content/resume/cv-online.md"
resume_src=""
if [[ -d "$DOCS_ROOT" && -f "${DOCS_ROOT}/cv-online.md" ]]; then
  resume_src="${DOCS_ROOT}/cv-online.md"
elif [[ -f "${ARTICLES_ROOT}/cv-online.md" ]]; then
  resume_src="${ARTICLES_ROOT}/cv-online.md"
fi
if [[ -n "$resume_src" ]]; then
  materialize "$resume_dest" "copy:${resume_src}"
else
  materialize "$resume_dest" "stub:resume"
fi

evidence_dest="${REPO_ROOT}/content/evidence/methodology-card.md"
evidence_src=""
if [[ -d "$DOCS_ROOT" ]]; then
  shopt -s nullglob
  publish_matches=("$DOCS_ROOT"/PUBLISH_卷三_*)
  if [[ ${#publish_matches[@]} -gt 0 ]]; then
    evidence_src="$(ls -t "$DOCS_ROOT"/PUBLISH_卷三_* | head -n 1)"
  elif [[ -f "${DOCS_ROOT}/methodology-card.md" ]]; then
    evidence_src="${DOCS_ROOT}/methodology-card.md"
  fi
fi
if [[ -n "$evidence_src" ]]; then
  materialize "$evidence_dest" "copy:${evidence_src}"
else
  materialize "$evidence_dest" "stub:evidence"
fi

# 压缩摘要卡：与 methodology-card（长/PUBLISH）并存，专供 Q5「1/9」等短关键词检索
evidence_card_dest="${REPO_ROOT}/content/evidence/evidence-card.md"
materialize "$evidence_card_dest" "stub:evidence-card"

log ""
log "=== sync manifest (${#SYNCED[@]} paths) ==="
for f in "${SYNCED[@]}"; do
  log "${f#"$REPO_ROOT"/}"
done
