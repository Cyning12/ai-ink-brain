<hr />
title: 证据摘要卡（按需读图 · 记忆分层）
description: Portfolio RAG 演示用压缩摘要；相对 methodology 长文与 methodology-card 全文，专供 Q3/Q5 检索
date: 2026-06-03
<hr />

# 证据摘要卡

<blockquote>
<p><strong>定位</strong>：<code>evidence</code> 目录下的 <strong>检索用摘要</strong>（distill card），不是卷三正文替代品。 长文见 <code>methodology/vol3_*</code>；协作细节见 <code>evidence/methodology-card.md</code>（PUBLISH 节选）。 本卡把 <strong>Q3 纠偏</strong> 与 <strong>Q5 token 边界</strong> 压成短段，便于 RAG 命中关键词。</p>
</blockquote>
<hr />

## 冷 / 温 / 热 与架构三层（Q3）

- **冷/温/热**：**记忆与上下文分层**（长期知识、会话缓存、即时工具输出），用于控制 RAG 与 Agent 的上下文成本。
- **架构三层**：**Inform / Constrain / Verify** 等工程分层，描述「写什么真值、用什么规则、如何验收」。
- **二者不是同一维度**：记忆分层 ≠ 架构分层；勿把「冷层」直接等同于「Inform 层」。

<div class="md-table-wrap">
<table>
<thead><tr>
<th>层</th>
<th>一句话</th>
</tr></thead>
<tbody>
<tr>
<td><strong>冷层</strong></td>
<td>不常变的结构地图（≈ 卷二技术图谱）；任务单里的 <strong>图谱入口</strong></td>
</tr>
<tr>
<td><strong>温层</strong></td>
<td>协作轨迹：任务单 + 书面签收 + 回顾摘要</td>
</tr>
<tr>
<td><strong>热层</strong></td>
<td>运行时事件记忆（远期、非日常必做）</td>
</tr>
</tbody>
</table></div>
<hr />

## 按需读图 vs 整图灌入（Q5）

**问题**：Agent 改代码时，是 **按需读图**（子图 / `graph_query`）还是 **整图灌入**（整包 `graph.json`）更省 token、效果如何？边界在哪？

**结论（固定评测集 · 单仓小样本）**：

- **按需读图**：通过 **`graph_query` 子图查询** 只拉入口节点与邻居，相对把整包 **`graph.json` 灌进上下文**。
- **token 效果**：在演示后端固定评测集上，按需读图 token 约降至 **十分之一（约 1/9）** 量级。
- **适用边界**：适用于 **小样本、单仓、图谱已维护** 的场景；**不能** 外推为全行业或任意大仓默认策略。
- **与冷层关系**：冷层强调「挂到地图上再动手」——工程上通常 **先读图谱入口与影响面**，而不是全仓库乱搜或整图灌入；但 **1/9 数值来自 graph_query 对照实验**，不是泛泛的「少读文件」口号。

**检索关键词**：按需读图、整图灌入、graph_query、graph.json、token、约 1/9、十分之一、小样本边界。

<hr />

<blockquote>
<p>由 <code>tools/sync-portfolio-content.sh</code> · <code>stub:evidence-card</code> 生成；ingest 后 category=<code>evidence</code>。</p>
</blockquote>
