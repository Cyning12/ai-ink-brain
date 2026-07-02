#!/usr/bin/env sh
# 本地复刻 .github/workflows/quality.yml（Harness Verify · PR 合并前）
# 用法：pnpm ci:local [--skip-install]
set -eu

ROOT="$(CDPATH= cd "$(dirname "$0")/.." && pwd)"
API_PYTHON="${API_PYTHON_ROOT:-$ROOT/../ai-ink-brain-api-python}"
SKIP_INSTALL=0

for arg in "$@"; do
  case "$arg" in
    --skip-install) SKIP_INSTALL=1 ;;
    -h|--help)
      echo "用法: pnpm ci:local [--skip-install]"
      echo "  对齐 workflow quality · lint + test + build + tech-graph"
      echo "  API_PYTHON_ROOT 可覆盖后端工具路径（默认 ../ai-ink-brain-api-python）"
      exit 0
      ;;
    *)
      echo "未知参数: $arg（支持 --skip-install）" >&2
      exit 2
      ;;
  esac
done

if [ ! -d "$API_PYTHON/tools" ]; then
  echo "FAIL: 未找到后端工具目录: $API_PYTHON/tools" >&2
  echo "提示: 将 ai-ink-brain-api-python 放在与前端同级，或设置 API_PYTHON_ROOT" >&2
  exit 2
fi

cd "$ROOT"
echo "==> ci:local @ $ROOT"
echo "==> api-python tools @ $API_PYTHON"

if [ "$SKIP_INSTALL" -eq 0 ]; then
  echo "==> pnpm install --frozen-lockfile"
  pnpm install --frozen-lockfile
else
  echo "==> skip pnpm install (--skip-install)"
fi

GRAPH_INPUT="$ROOT/docs/_tech_graph"
GRAPH_OUTPUT="$ROOT/docs/_tech_graph/graph.json"
MANIFEST="$ROOT/docs/_tech_graph/_manifest.json"

echo "==> tech graph graph.json (--check)"
python3 "$API_PYTHON/tools/tech_graph_graph_export.py" \
  --input "$GRAPH_INPUT" \
  --output "$GRAPH_OUTPUT" \
  --check

echo "==> tech graph graph_v2 equivalence"
python3 "$API_PYTHON/tools/tech_graph_graph_equivalence_check.py" \
  --input "$GRAPH_INPUT" \
  --graph "$GRAPH_OUTPUT"

echo "==> tech graph manifest (frontend)"
python3 "$API_PYTHON/tools/tech_graph_manifest_check.py" \
  --repo frontend \
  --repo-root "$ROOT" \
  --manifest "$MANIFEST"

echo "==> tech graph schema (--check-backend-sync)"
python3 scripts/tech_graph_schema_check.py --check-backend-sync

echo "==> pytest tests/test_graph_v2_schema.py"
python3 -m pytest tests/test_graph_v2_schema.py -q

echo "==> pnpm lint"
pnpm lint

echo "==> pnpm test"
pnpm test

echo "==> pnpm build"
pnpm build

echo ""
echo "OK: ci:local 全部通过（与 quality workflow 对齐）"
