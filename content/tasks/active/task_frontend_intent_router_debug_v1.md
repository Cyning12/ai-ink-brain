# 前端：Intent Router 可视化（v1）— Unified Chat 展示 mode 与 why

状态：pending  
依赖：后端输出 `router.decision` 事件（见 `ai-ink-brain-api-python/docs/tasks/task_intent_router_backend_v1.md`）  
设计：`ai-ink-brain-api-python/docs/UI/v1/UI-04-intent-router-v1.md`

## 目标

在 Unified Chat 页面中，让用户/开发者能看到：

- 当前轮次最终 `mode`（rag/text2sql/no_data/tool:*）
- 路由 why：规则命中、证据校验结果、回退原因

## 范围

- 修改 `components/unified-chat/UnifiedChatPageClient.tsx`：
  - 从 events 中找到 `type=router.decision`
  - 在右栏控制台/调试区展示决策信息
- UI 展示可简单：折叠区 + JSON 预览

## 验收

- [ ] 发起一次对话后，右栏能看到 `final_mode`
- [ ] 能看到 `rule_hits` 与 `evidence`（ddl_hits/fts_hits 等）
- [ ] prefer 切换时，展示内容随之变化

