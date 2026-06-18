# graph_v2 schema（前端仓 · P2-0 + P2-4a）

> **状态**：与 committed `graph.json` 对齐  
> **落盘**：`docs/_tech_graph/graph.json`，`schema_version: graph_v2`  
> **机器可读真值**：`docs/_tech_graph/graph_v2.schema.json`（与后端仓同源；双轨：本 Markdown + JSON Schema）  
> **关联规格**：`docs/tasks/specs/SPEC-tech_graph_v2_frontend_parity_v1.md`  
> **导出**：自本目录 `*.graph.yaml`；工具在配对后端仓（见 §8）  
> **工作区 SPEC**：`docs/tech_graph/SPEC/json_graph/scheme_1_graph_json.md`

---

## 1. 根对象

| 字段 | 类型 | P2-0 | P2-4a | 说明 |
| --- | --- | --- | --- | --- |
| `schema_version` | string | **必** | **必** | 固定 `graph_v2` |
| `generated_at` | string | **必** | **必** | ISO-8601 UTC（`Z` 后缀） |
| `freeze_id` | string | **必** | **必** | 与后端同源一行；bump 时双仓同步 |
| `nodes` | array | **必** | **必** | 见 §2 |
| `edges` | array | **必** | **必** | 见 §3 |
| `graphs` | array | **禁** | **导出必有** | 分图目录；元素见 §5 |

---

## 2. nodes[]

| 字段 | 类型 | P2-0 | P2-4a | 说明 |
| --- | --- | --- | --- | --- |
| `id` | string | **必** | **必** | `graph_query` 主键（全局扁平） |
| `label` | string | **必** | **必** | 人类可读标签 |
| `kind` | string | **禁** | **可选** | `flow` \| `struct` \| `external` |
| `graph_id` | string | **禁** | **导出必有** | 须存在于 `graphs[].id` |

---

## 3. edges[]

### 3.1 拓扑边

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `from` / `to` | string | 源/目标节点 id |
| `mark` / `type` / `sync` / `label` / `anchors` | 同 P2-0 | |
| `graph_id` | string | 可选；导出时写入来源分图 |

### 3.2 引用边（P2-4a-2）

含 `ref` 时 **不得** 出现 `from`/`to`。`graph_query` **忽略** ref 边。本仓当前 **无** ref 边。

---

## 4. anchors[]

`path`、`symbol`、可选 `line`（仓库相对路径，如 `app/api/py/chat/route.ts`）。

---

## 5. graphs[]

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 默认与 `*.graph.yaml` 文件名去后缀一致 |
| `title` | string | 展示标题 |
| `source_ai_path` | string | **遗留字段**；历史来源 `.ai.md` 相对路径，新图源为 `source_yaml_path` |

本仓分图：`00_main`、`10_flow_route`、`11_flow_api`、`12_flow_auth`、`13_flow_components`。

---

## 6. 等价门禁

拓扑比较 **仅** 含 `from`/`to` 的边。阈值：锚点 ≥95%、边 label ≥90%。CI 见 `quality.yml` **Tech graph equivalence** 步。

---

## 7. failure_paths

| ID | 触发 | 行为 |
| --- | --- | --- |
| FP-4-1 | 字段冲突 | 等价非 0 |
| FP-4-2 | `ref` 未知节点/graph | schema 校验非 0 |
| FP-4-3 | query 默认多读分图 | **禁止**；ref 不参与 BFS |
| FP-4-4 | 无 P2-4 键的 P2-0 图被拒 | schema 须接受 |

前端 CI 扩展：**FP-V2-2**（`--check` 漂移）、**FP-V2-3**（等价阈值），见 Playbook `docs/diary/tech_graph_v2_frontend_migration_playbook_v1_zh.md` §7。

---

## 8. 工具入口（脚本在 `ai-ink-brain-api-python`）

| 脚本 | 用途 |
| --- | --- |
| `tech_graph_graph_export.py` | 导出 / `--check` |
| `tech_graph_graph_equivalence_check.py` | 等价 CI |
| `tech_graph_graph_v2_schema.py` | 结构校验真值（JSON Schema + 校验逻辑） |
| `scripts/tech_graph_schema_check.py` | 前端封装：同步检查本地 `graph_v2.schema.json` 并与后端同源 schema 比对，再校验 `graph.json` |
| `tech_graph_graph_query.py` | 单图 query（`pnpm tech-graph:query …`） |

本地封装见根目录 `package.json` 的 `tech-graph:*`。

---

## 9. `tech_graph_graph_query.py` CLI

```text
python3 …/tech_graph_graph_query.py --graph docs/_tech_graph/graph.json downstream <node_id> <depth>
python3 …/tech_graph_graph_query.py --graph docs/_tech_graph/graph.json describe-impact <node_id> [depth]
```

退出码：`4` 未知节点；`5` 非 graph_v2。详见工作区 `docs/tech_graph/SPEC/query_graph/scheme_2_graph_query.md`。

---

## 修订记录

| 版本 | 日期 | 说明 |
| --- | --- | --- |
| v1.0 | 2026-05-20 | 前端仓落盘；工具路径指向配对后端 |
