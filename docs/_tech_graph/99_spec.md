```mermaid
flowchart TD
  %% 99_spec: 前端实现规约（图形化、低 token、可追溯、反幻觉）

  START[开始维护图谱] --> SCOPE{变更范围?}

  SCOPE -->|新增/修改页面| PAGES["app/**/page.tsx\n必须在 00_main + 10_flow_route 体现"]:::r
  SCOPE -->|新增/修改 API Route| API["app/api/**/route.ts\n必须在 00_main + 11_flow_api 体现"]:::r
  SCOPE -->|新增/修改鉴权| AUTH["lib/auth.ts + app/api/auth/**\n必须在 12_flow_auth 体现"]:::r
  SCOPE -->|新增/修改核心类型| TYPES["lib/**/types 或 components/**/types\n必须在 01_struct 体现"]:::r
  SCOPE -->|新增/修改通用组件数据流| COMP["components/**\n必须在 13_flow_components 体现"]:::r

  %% 反幻觉强约束：所有节点需可定位到真实文件/路由/函数
  PAGES --> NOHALLU
  API --> NOHALLU
  AUTH --> NOHALLU
  TYPES --> NOHALLU
  COMP --> NOHALLU

  NOHALLU["规则：图谱节点 = 真实存在实体\n- 路由必须来自 app/**/page.tsx\n- API 必须来自 app/api/**/route.ts\n- 组件必须来自 components/**\n- 类型必须来自真实 export type/interface\n- 禁止虚构页面/接口/组件/类型"]:::e

  %% 按需加载：主图只连到子图，不在一个文件塞满
  NOHALLU --> LAZY["按需加载\n00_main 仅做总图 + 连接子图\n10/11/12/13/01/02 分文件维护"]:::r

  %% 版本追溯：每次重要变更追加 timeline 节点
  LAZY --> VER["02_version: 追加一条版本节点\n(日期 + commit + 主题)"]:::r

  %% 输出格式规范
  VER --> FORMAT["输出必须为 .md + Mermaid\n禁止：纯文本长文档/大段 TS interface/大段 JSON"]:::e

  classDef r fill:#eef6ff,stroke:#4a90e2,color:#123;
  classDef e fill:#fff7e6,stroke:#d89b00,color:#553;
```

---

## 机器轨（graph_v2）与 CI 门禁

| 项 | 约定 |
| --- | --- |
| 真值文件 | `graph.json`（`schema_version: graph_v2`）与 `graph_v2_schema.md` |
| 导出 / 漂移 | `pnpm tech-graph:graph-export`；PR 必绿 `pnpm tech-graph:graph-check`（`quality` workflow） |
| 等价 | `pnpm tech-graph:equivalence-check`（`.ai.md` 参考图 vs 已提交 JSON；锚点 ≥95%、label ≥90%） |
| 结构 | `pnpm tech-graph:schema-check`（可选本地） |
| 查询 | `pnpm tech-graph:query <op> …`（方案2；默认 Agent 机器轨，见闸口 B 结论） |
| 工具脚本 | 复用 `ai-ink-brain-api-python/tools/tech_graph_*.py`（勿在前端仓复制） |
| 迁移手册 | `content/tasks/specs/MIGRATION-tech_graph_v2_frontend_playbook_v1_zh.md` |

**CI 顺序（`quality` · `lint-and-build`）**：checkout 本仓 → checkout 后端工具仓 → `pnpm install` → Python 3.11 → graph `--check` → **equivalence** → `pnpm lint` → `pnpm test` → `pnpm build`。

**失败时**：见 `graph_v2_schema.md` §7 与 Playbook §7（FP-V2-*）。

---

## 跨仓契约（SSE / Unified Chat）

- **真值**：`ai-ink-brain-api-python/docs/_tech_graph/_contract_manifest.json`（本仓 **不** 复制）。
- **前端锚点**（须在 `11_flow_api` / `13_flow_components` 与 manifest `frontend_anchors` 一致）：
  - SSE 消费：`components/unified-chat/UnifiedChatPageClient.tsx`
  - BFF 透传：`app/api/py/unified/chat/stream/route.ts`
- **本地校验（工作区 sibling 布局）**：

```bash
python3 ../ai-ink-brain-api-python/tools/tech_graph_contract_check.py
```

退出码 `0` 表示后端产出 ⊇ 契约且前端读取 ⊆ 契约。

