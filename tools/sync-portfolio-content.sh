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

> 由 `tools/sync-portfolio-content.sh` 生成；供 Q3/Q5 与 `evidence` category ingest。
STUB
      log "SYNC ${dest_rel} (stub evidence)"
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
vol3_candidates=("$ARTICLES_ROOT"/ARTICLE_*_vol3_*.md)
if [[ ${#vol3_candidates[@]} -eq 0 ]]; then
  log_err "ERROR: 缺卷三源（未找到 ARTICLE_*_vol3_*.md）"
  exit 1
fi

vol3_src="$(ls -t "$ARTICLES_ROOT"/ARTICLE_*_vol3_*.md | head -n 1)"
vol3_base="$(basename "$vol3_src")"
methodology_dest="${REPO_ROOT}/content/methodology/vol3_${vol3_base}"
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

log ""
log "=== sync manifest (${#SYNCED[@]} paths) ==="
for f in "${SYNCED[@]}"; do
  log "${f#"$REPO_ROOT"/}"
done
