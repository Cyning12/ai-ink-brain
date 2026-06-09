<div class="md-table-wrap">
<table>
<thead><tr>
<th>卷</th>
<th>副标题（连载）</th>
<th>你得到什么</th>
</tr></thead>
<tbody>
<tr>
<td>—</td>
<td><a href="https://cloud.tencent.com/developer/article/2681553">从「更会写」到「敢合并」</a></td>
<td>从「更会写」到「敢合并」· 15 分钟导读</td>
</tr>
<tr>
<td><a href="https://cloud.tencent.com/developer/article/2675471">卷一</a></td>
<td>怎样才算「做完」</td>
<td>动机、双轨总览、最小起步</td>
</tr>
<tr>
<td><a href="https://cloud.tencent.com/developer/article/2676250">卷二</a></td>
<td>技术图谱</td>
<td>子图、读法对照、图谱 CI</td>
</tr>
<tr>
<td><a href="https://cloud.tencent.com/developer/article/2678669">卷三</a></td>
<td>Harness 与 SDD</td>
<td>实践 SDD 的 Harness 协作流程（任务单、签收、阶段流）</td>
</tr>
<tr>
<td><a href="https://cloud.tencent.com/developer/article/2680278">卷四</a></td>
<td>闭环交付与经验沉淀</td>
<td>专题流水线、跨轮回顾摘要</td>
</tr>
<tr>
<td><a href="https://cloud.tencent.com/developer/article/2681115">卷五</a></td>
<td>存量怎么落地</td>
<td>案例机制、FAQ、阶段 0～3、诚实边界</td>
</tr>
</tbody>
</table></div>
## 目录

<div class="md-table-wrap">
<table>
<thead><tr>
<th>节</th>
<th>标题</th>
</tr></thead>
<tbody>
<tr>
<td>—</td>
<td>摘要</td>
</tr>
<tr>
<td><strong>17</strong></td>
<td>一轮专题交付：从 SPEC 到归档</td>
</tr>
<tr>
<td><strong>18</strong></td>
<td>闭环后：经验卡片与跨轮回顾摘要</td>
</tr>
<tr>
<td><strong>19</strong></td>
<td>与「只会 Prompt」的工具链如何叠加</td>
</tr>
<tr>
<td><strong>20</strong></td>
<td>结语</td>
</tr>
</tbody>
</table></div>
<hr />

## 摘要

若你还没读过 **卷一～卷三**，建议先看：卷一讲意图 / 成果 / 验收；卷二讲 **技术图谱**；卷三讲 **任务单、书面签收、合并前自动检查**。

**本卷讲合并之后**：一整轮有边界的专题，如何从写清任务单走到 **收尾归档**；以及（可选）怎样少翻冗长的协作留痕。

卷三解决 **敢不敢合并**；卷四解决 **合完有没有收好尾**。核心一句：**跨轮回顾摘要** 帮你在跨任务回顾时 **快速定位当时的决策**；**不替代** 技术图谱回答「改哪里、影响谁」——那是卷二的事。

下文用笔者在 **示例后端 API 服务 + 可选 Next/BFF 前端** 上的一次虚构专题，走通 happy path，并演一次 **契约检查拦住合并** 的主线失败（§17）；§18 说明收尾后 **经验卡片、团队 Skill、编译摘要** 如何分工，以及笔者在后端示例仓做过的 **跨轮回顾对照**（有数字边界，勿外推）。

<hr />

## 17. 一轮专题交付：从 SPEC 到归档

### 17.1 本卷在协作栈里的位置

先对齐三句话（后文不再重复）：

1. **协作流程（Harness）** 以 **任务单** 为核心：任务单是开工规格（验收、非范围、失败路径），不是与流程并列的第二套 paperwork。
2. **敢合并** = **合并前自动检查全绿** + **书面审查结论落盘**——不是「在平台上点一下 Approve 就算交付」。
3. 下文用 **一条专题** 串起卷一～三；相对 **卷一 §6 的理想路径**，本节用 **主失败分支** 说明：为什么「有地图、有任务单」仍可能被 CI 拦下，以及怎样 **同 PR 修回绿**。

### 17.2 什么叫「一轮专题」

**一轮专题** = 有边界的一包工程交付，而不是和模型无限续聊。

它可以对应产品上的一个 Epic，也可以对应你们仓库里 **一条任务链**（一个主任务单 + 若干关联子任务）。关键是：

- **意图、成果、验收** 在任务单里写死（卷一 §3、卷三 §11）；
- **改哪条链路** 在任务单里挂 **图谱入口**（卷二 §8.3）；
- **结束标志** 是：代码合并 + 任务单与审查记录 **可检索** +（可选）收尾后的编译摘要（§18）。

### 17.3 端到端流水线

```mermaid
flowchart LR
    A["意图澄清"] --> B["任务单冻结"]
    B --> C["实现<br/>人 + Agent"]
    C --> D["自检"]
    D --> E["合并前 CI"]
    E --> F["审查签收"]
    F --> G["合并"]
    G --> H["收尾归档"]
    H --> I["可选：编译摘要"]

    style B fill:#fff8e1
    style F fill:#fff8e1
    style H fill:#e8f5e9
```

各阶段 **产出什么、回哪一卷**，见下表。

<div class="md-table-wrap">
<table>
<thead><tr>
<th>阶段</th>
<th>本轮应留下什么</th>
<th>回指</th>
</tr></thead>
<tbody>
<tr>
<td>开工</td>
<td>任务单：验收清单、非范围、失败路径、测试策略；建议一行图谱入口</td>
<td>卷三 §11</td>
</tr>
<tr>
<td>实现</td>
<td>代码 + <strong>顺手更新</strong> 结构图（若动到流程的边/调用关系）</td>
<td>卷二 §8.3、§9.5</td>
</tr>
<tr>
<td>合并前</td>
<td>与 PR 相同的自动检查 <strong>全绿</strong></td>
<td>卷二 §9.5、卷三 §13</td>
</tr>
<tr>
<td>签收</td>
<td>书面记录：对照任务单与 CI 的 <strong>结束本轮</strong> 结论</td>
<td>卷三 §12</td>
</tr>
<tr>
<td>收尾</td>
<td>任务单移入已归档目录；审查链可查</td>
<td>本节</td>
</tr>
<tr>
<td>可选</td>
<td>从已收尾材料 <strong>编译</strong> 的跨任务摘要页</td>
<td>§18</td>
</tr>
</tbody>
</table></div>
### 17.4 案例：统一聊天流的 SSE 字段对齐（虚构）

<blockquote>
<p>（本节展示 <strong>主线失败分支</strong>：契约/锚点检查拦住合并，而非一帆风顺。）</p>
</blockquote>
以下情节 **完全匿名化**，仅说明机制；读者不必与任何真实仓库一一对应。

**背景**：示例栈为 **Python 后端 API** + **Next.js BFF** 消费后端的流式聊天（SSE）。产品要把统一聊天流里某一事件的字段名与必填项对齐，方便前端解析。

**任务单（节选）**

<div class="md-table-wrap">
<table>
<thead><tr>
<th>字段</th>
<th>内容</th>
</tr></thead>
<tbody>
<tr>
<td><strong>非范围</strong></td>
<td>不改登录与会话链路</td>
</tr>
<tr>
<td><strong>图谱入口</strong></td>
<td>从「统一聊天」相关分册进入（卷二）</td>
</tr>
<tr>
<td><strong>测试策略</strong></td>
<td><strong>必须自动化</strong>：SSE 事件字段与错误形状</td>
</tr>
<tr>
<td><strong>合并前必绿</strong></td>
<td>与 PR 一致的 workflow 全绿（卷三 §13）</td>
</tr>
<tr>
<td><strong>验收</strong></td>
<td>单测绿 + 合并前检查全绿 + 审查签收</td>
</tr>
</tbody>
</table></div>
**节拍 1～2：开工与实现**

人先冻结任务单；Agent 按图谱入口改后端流式接口，调整某一 SSE 事件的字段名。实现者 **只改了代码**，忘记同步 **契约/锚点清单**（仓库里用清单文件声明「文档里写明的端点 / 事件 / 字段应与代码一致」——具体文件名因项目而异，公众稿只记 **机制**）。

**节拍 3：主失败分支——合并被契约检查拦住**

推送 PR 后，**契约/锚点检查** 变红（与单测 workflow 并列，不是替代关系）。流水线给出的信息 **建议使用类似下面这种清晰提示**（勿暴露内部路径）：

```text
❌ 合并被阻塞：契约/锚点与代码不一致
位置：统一聊天 · SSE 事件 "chunk_done"
文档声明：字段 message_id（必填）
当前代码：字段 msg_id（必填）
你可以：
  1. 若确属契约变更：在任务单写明变更 → 同 PR 更新契约/锚点与结构图 → 补测试；
  2. 若为误改：回滚相关代码；
  3. 本地运行与 PR 相同的检查命令，确认变绿后再 push。
```

这就是读者常问的 **「图谱 / 契约 CI」**：不是玄学，而是 **机器对照「你承诺的对外形状」与「仓库里实际代码」**。它管的是 **门牌号对不对**，下文 17.5 再补一句 **具体行为** 与签收纪律。

**路径 A（本案例采用）**：确认产品就是要改名 → 在任务单补 **变更说明（Delta）** → **同一 PR** 内更新契约/锚点清单 +（若流程的边/调用关系变了）更新结构图 → 补/改 SSE 相关单测 → 检查变绿 → 审查签收 → 合并。

**路径 B（穿插一句）**：若发现是 Agent 误改字段，**回滚** 相关代码即可变绿——不必硬改文档去「凑」过检查。

**切勿** 再开一个「只改文档」的 PR 等代码 PR 先合：容易 **双 PR 死锁**。习惯应是 **原子提交**：代码 + 契约/锚点/图 + 测试 **同 PR 一起走**。若 PR 已推送才发现漏改契约/锚点，应在 **同一 PR 上补推**，不要另开「只改文档」的 PR。

**节拍 4～6：副分支、合并与收尾**

- **副分支（一句）**：有时 **契约/锚点检查** 已绿，**单测仍红**——说明 **门牌号对了，具体行为逻辑仍可能错**。这时要靠失败路径与 `pytest`（卷五 FAQ 会再展开）。
- **合并后**：验收通过，任务单移入 **已归档任务目录**；开工前审核与合并前签收的 **书面记录** 仍可查——不是「合并完就散」。
- **业务代码合并不会自动变成** 跨轮回顾摘要；摘要须 **收尾后按需** 生成（§18）。本案例 **不展开** 知识库编译 细节。

前端 BFF 的类型与消费逻辑，在同一 Epic 里 **另 PR 串行** 即可；卷四 **不展开** 改前端细节。

### 17.5 专题收尾纪律（通俗版）

<div class="md-table-wrap">
<table>
<thead><tr>
<th>误解</th>
<th>实际</th>
</tr></thead>
<tbody>
<tr>
<td>合并 = 结束</td>
<td>还要 <strong>收尾归档</strong>：状态、审查链可查</td>
</tr>
<tr>
<td>合并 = 自动生成知识库页面</td>
<td><strong>无自动同步</strong>；摘要 / LLM Wiki 页均 <strong>可选、按需</strong></td>
</tr>
<tr>
<td>仅点击平台 <strong>Approve</strong> 就行</td>
<td><strong>机器绿 + 书面签收</strong> 并列</td>
</tr>
</tbody>
</table></div>
收尾归档 **不等于** 再跑一轮全自动「打回重做」（那是进阶调优话题，卷五再提）。收尾首先是 **归档与可检索**。

**拒开工与驳回（不占主线）**：任务单字段不齐（缺非范围、失败路径、合并前必绿条等）时，应在 **实现开始前** 书面指出并 **阻塞开工**（卷三 §12.4 有清单思路，本卷不展开审核表模板）。实现不合格应 **驳回并要求** 修代码或补测，而不是只改聊天结论。

### 17.7 失败复盘：五类根因（建议性）

合并后若仍要复盘，笔者建议用 **五类根因** 归类（**非** 强制录入数据库）：

1. **规格漏项**（任务单没写清的边界）  
2. **契约 / 锚点未与代码同步**（本节主线）  
3. **失败路径未覆盖的测试**  
4. **结构图与真实流程漂移**  
5. **跨端假设错误**（后端改了，前端仍按旧字段）

可附一张 **失败路径表**（卷三 §11.4），例如：

<div class="md-table-wrap">
<table>
<thead><tr>
<th>触发</th>
<th>行为</th>
<th>可否重试</th>
<th>用户可见</th>
</tr></thead>
<tbody>
<tr>
<td>SSE 字段与文档不一致</td>
<td>合并被阻塞</td>
<td>修代码或补锚点后重跑检查</td>
<td>开发者看 CI 日志</td>
</tr>
</tbody>
</table></div>
**不建议** 把「15 分钟必须响应」「全团队强制 Feature Flag」写成本文标配——视你们基础设施而定。

更细的 匿名化 踩坑备忘，可在收尾后整理进 **经验卡片** 或 §18 的编译摘要层；**不必** 规定「每个新任务必须先检索 失败案例库」。

### 17.8 与卷三 §13 的衔接

卷三在阶段流末尾留过 **收尾后可选一步**；本节把它 **展开为可执行纪律**，但不重复卷三的 SDD 阶段图全文。

**AB 对照、载荷降幅等数字** 属于「收尾后怎么少翻留痕」，放在 **§18**——避免在流水线章节里混入实验结论。

<hr />

## 18. 闭环后：经验卡片与跨轮回顾摘要

<blockquote>
<p>若你 <strong>连任务单与合并前 CI 门禁都尚未跑通</strong>，本节可先略过；等 <strong>跑通 3～5 个专题</strong> 再回来看收尾沉淀。</p>
</blockquote>
§17 讲 **怎么合并、怎么收尾**；本节讲 **收尾之后** 多出来的三层「沉淀」：哪些是 **可选备忘**，哪些值得 **编译成摘要**，以及它们与卷二 **技术图谱**、卷一结语里的 **经验卡片 / Skill** 如何分工。

### 18.1 四种物件，先分清

<div class="md-table-wrap">
<table>
<thead><tr>
<th>通俗名</th>
<th>是什么</th>
<th>何时写</th>
<th>谁读</th>
</tr></thead>
<tbody>
<tr>
<td><strong>技术图谱</strong></td>
<td>改哪里、从哪进、会影响谁（结构地图）</td>
<td>改代码、改流程时（PR 时同步更新）</td>
<td>实现期（卷二）</td>
</tr>
<tr>
<td><strong>跨轮回顾摘要</strong></td>
<td>从 <strong>已收尾</strong> 的任务与审查材料 <strong>编译</strong> 出的跨任务概念页</td>
<td>Epic 收尾后 <strong>按需</strong></td>
<td>跨会话回顾、跨轮回顾</td>
</tr>
<tr>
<td><strong>经验卡片</strong></td>
<td>一轮闭环后的 <strong>短备忘</strong>（踩坑、命令、决策）</td>
<td>合并后 <strong>可选</strong></td>
<td>人 + 下次开工的 Agent</td>
</tr>
<tr>
<td><strong>团队 Skill / 规则</strong></td>
<td>编辑器里 <strong>可复用的习惯</strong>（命名、测试顺序）</td>
<td>同类任务 <strong>重复 ≥2 次</strong> 后</td>
<td>Agent 默认注入</td>
</tr>
</tbody>
</table></div>
**一句话**：图谱管 **结构**；任务单 + 签收管 **本轮交付依据**（**真值**=唯一可信依据；卷三：验收勾了什么、谁签收，**以任务单与书面记录为准**）；摘要管 **跨轮决策蒸馏**；Skill 管 **怎么问、怎么测**。

### 18.2 与 PRD、LLM Wiki、技术图谱的划界

读者听到 **Wiki**，常会想到 Confluence、飞书文档里 **人工维护** 的产品百科。本文另有一类：**LLM Wiki**——由 Agent **增量编写并维护** 的 Markdown 知识库：原始资料只读，中间层页面由 LLM 交叉引用、持续整理；你主要 **提问与把关来源**，不必亲手维护每一页。理论出处见下文 §18.2.1。

这与 **PRD / 需求文档**（人写的产品规格）、**技术图谱**（改代码用的流程 / 契约 / 入口地图，卷二）、**跨轮回顾摘要**（从已收尾任务与审查材料 **编译** 出的 Epic 级决策页）都不同。

笔者在示例项目中用下表避免混用。下表与卷二 §8.5「Wiki / 需求文档」呼应，并补上 **LLM Wiki** 一列：

<div class="md-table-wrap">
<table>
<thead><tr>
<th>类型</th>
<th>谁维护</th>
<th>答什么</th>
<th>何时更新</th>
<th>典型误用</th>
</tr></thead>
<tbody>
<tr>
<td><strong>PRD / 需求文档</strong></td>
<td>产品、研发</td>
<td>产品需求、用户故事、业务规则</td>
<td>需求变更</td>
<td>当 <strong>代码地图</strong> 用</td>
</tr>
<tr>
<td><strong>LLM Wiki</strong></td>
<td>Agent（人审核来源）</td>
<td>多源资料 <strong>编译</strong> 成的主题页、交叉引用</td>
<td>新资料 <strong>纳入知识库</strong></td>
<td><strong>替代</strong> 技术图谱或 Harness 签收</td>
</tr>
<tr>
<td><strong>技术图谱</strong></td>
<td>人 + Agent 顺手改</td>
<td>工程入口、依赖、契约/锚点</td>
<td>改流程、PR 顺手改图</td>
<td>把 PRD 全文贴进仓库</td>
</tr>
<tr>
<td><strong>跨轮回顾摘要</strong></td>
<td>收尾后按需 <strong>编译</strong></td>
<td>Epic 级 <strong>工程决策</strong> 与踩坑模式</td>
<td>Epic 收尾后</td>
<td><strong>替代图谱</strong> 做影响分析</td>
</tr>
</tbody>
</table></div>
**跨轮回顾摘要不是 PRD，也不等于整本 LLM Wiki。** 摘要回答「这个 Epic 收尾时工程上定了什么」；PRD 回答「用户要什么」；LLM Wiki 若采用，往往是 **更广的领域知识层**（可收录摘要页，但 **不能** 代替任务单字段与合并前检查）。在笔者后端示例仓里，回顾摘要与部分 Wiki 页同属「可读沉淀层」，公众稿 **不展开** 仓内目录名。

<blockquote>
<p><strong>与卷二 §8.5 的对照</strong>：卷二表中「Wiki / 需求文档」主要指 <strong>人工产品文档</strong>；本卷补写的 <strong>LLM Wiki</strong> 指 <strong>Agent 维护</strong> 的知识库模式——二者不要混称为「产品 Wiki」。</p>
</blockquote>
#### 18.2.1 借鉴 Karpathy 的 LLM Wiki：为何用在跨轮回顾

笔者在 **跨轮回顾** 场景借鉴了 Andrej Karpathy 公开阐述的 **[LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)** 思路（业内讨论度较高，可自行阅读原文）。与「把文件丢进向量库、每次问答现检索」不同，LLM Wiki 主张：原始资料保持只读，由 LLM **持续维护** 一层可交叉引用的 Wiki 页面——知识 **编译进结构里、并保持更新**，而不是每问从碎片里重新拼凑。

**笔者为何把它落在专题收尾上？** 跑通 Harness 之后，任务单、审查记录、对话导出会 **越积越多**。半年后再问「这个 Epic 当时定了什么、踩过什么坑」，若每次让 Agent **整包读取** 全部分支留痕，上下文成本高、噪声大，回答还容易 **漂移**（本轮临时拼出的片段，与当时书面签收不一定一致）。**跨轮回顾摘要** 是在这一思路上，把 **已收尾** 材料 **蒸馏** 成少量 synthesis 页，专门服务跨会话回顾——属于 **初步** 缓解「文档越来越多、回顾越来越难」，不是一劳永逸的知识管理产品。

**为何不把传统 RAG 当主方案？**（针对 **本项目协作留痕**，不是否定 RAG 的全部用途）

<div class="md-table-wrap">
<table>
<thead><tr>
<th>做法</th>
<th>在跨轮回顾上的短板</th>
</tr></thead>
<tbody>
<tr>
<td><strong>传统 RAG</strong>（上传 task/review，按问检索 chunk）</td>
<td>每问 <strong>重新发现</strong> 知识，缺少 <strong>跨轮积累</strong>；合成多份留痕时容易漏约束、口径飘</td>
</tr>
<tr>
<td><strong>按项目文档做通用 chunk</strong></td>
<td>切分粒度、元数据、更新策略成本高；对 <strong>边界已冻结的已收尾材料</strong>，投入往往 <strong>大于收益</strong></td>
</tr>
<tr>
<td><strong>更复杂的方案（如 GraphRAG）</strong></td>
<td>对「先跑通跨轮回顾、少翻留痕」的团队，多数是 <strong>过度工程</strong>；本系列不展开</td>
</tr>
</tbody>
</table></div>
线上 **ChatBI / 用户问答** 仍可用各自的 RAG 栈；本卷只讨论 **工程收尾后的可读沉淀**。与技术图谱、Harness 签收的分工仍见上表——**摘要/Wiki 层不替代**「改哪里」的地图，也不替代「敢不敢合」的 CI 与书面落盘。

### 18.3 为什么需要编译摘要（故事线）

协作一旦走 Harness，**过程留痕** 会自然变长（§18.2.1）。收尾半年后，你若仍只靠完整读取原文做回顾，成本高、噪声大，还容易漏 **跨任务的模式**（例如「这类改动必须过契约/锚点检查」）。

笔者在示例后端仓的习惯是：

```text
跨轮回顾：先看摘要索引 → 打开单篇 synthesis 摘要 → 必要时再回链原始 task/review
```

**合并业务代码 ≠ 自动生成摘要**。收尾归档（§17）之后，是否 **摘要编译入库** 摘要（或写入 LLM Wiki 的某一类页面），仍按团队纪律 **按需触发**——不是 push 到 `main` 就立刻多出一页知识库。

### 18.4 跨轮回顾对照：摘要层省了多少上下文？

下面数字来自笔者在 **单一后端示例仓** 做的 **跨轮回顾** 对照实验（2026-05），**不是** 线上用户流量，也 **不等于** 模型 API 的 token 账单。实验用事先声明的 **gold 题集**：六类 **代表性收尾场景**（例如 Harness 文档试点、图谱门禁、流式探针、契约/锚点检查 CI、LLM Wiki 层元实验、Harness 与 Wiki 层闭环主任务单等），**每类四题**，在 **后端 API 单仓** 内答题（**不含** 前端 / 双仓场景）。**降幅为字符量代理**，不代表线上 API token 实际消耗；题集 **仅含后端 API 仓**，降幅 **不代表** 全行业或双仓场景的 token 账单。

**两组对比**（同一套题，只改 Agent **先读什么**；A 为基准，B 在 A 上叠摘要）

<div class="md-table-wrap">
<table>
<thead><tr>
<th>组别</th>
<th>Agent 先读的材料</th>
</tr></thead>
<tbody>
<tr>
<td><strong>A · 仅 Harness 要点包</strong></td>
<td>专题收尾纪律与任务要点摘录（不含冗长的多轮执行留痕全文）</td>
</tr>
<tr>
<td><strong>B · 要点包 + 回顾摘要</strong></td>
<td>在 A 的基础上，再读 <strong>跨轮回顾摘要</strong>（已收尾 Epic 的 synthesis 页）</td>
</tr>
</tbody>
</table></div>
**能写什么结论**

在同一题集下，**B 组** 相对 **A 组**，喂给模型的 **字符量（载荷代理）** 大约还能再少 **六成到七成多**（六类场景聚合约 **61%–77%**；笔者另有一类试点文档域约 **79%**，见脚注）。六类里 **五类** 四题全中；**一类** 只中了三题——因为该 Epic 的编译摘要 **漏写了测试策略字段**，有一道题 Agent 无法从摘要里还原「必须自动化」的约束。

<blockquote>
<p><strong>脚注</strong>：单域试点（文档试点）降幅约 <strong>79%</strong>；正文六类场景区间为 <strong>61%–77%</strong>。请勿以单域替代整体结论。</p>
</blockquote>
**诚实边界（不可外推）**

1. **没写进摘要的运行时细节与生产配置**，不能当事实用——仍以代码与合并前检查为准。  
2. **前端 Next/BFF** 与双仓协作须 **另行验证**，不能靠这一后端实验代替。  
3. **线上 RAG / ChatBI 排障效果** 等实现级指标，本实验 **未覆盖**。

**失败样本（必写）**

**某 Harness 与 Wiki 层闭环主任务单** 在 **B 组（叠摘要）** 下 **3/4**：根因是编译时 **未把主任务单上的测试策略枚举蒸馏进摘要**，不是模型「突然变笨」。这提醒笔者：**摘要省字** 与 **摘要写全** 要一起管——摘要编译 纪律和任务单字段一样，漏一项就会在回顾题上露馅。

### 18.5 什么时候读什么（读序）

<div class="md-table-wrap">
<table>
<thead><tr>
<th>你的任务</th>
<th>建议先读</th>
</tr></thead>
<tbody>
<tr>
<td><strong>开工改代码</strong></td>
<td>技术图谱 + 本轮回任务单（卷二 + 卷三）</td>
</tr>
<tr>
<td><strong>跨 Epic 回顾、写复盘</strong></td>
<td>摘要索引 → 单篇 synthesis → 必要时回图谱或原文</td>
</tr>
<tr>
<td><strong>配置编辑器默认行为</strong></td>
<td>团队 Skill（卷一 §7 伏笔）</td>
</tr>
</tbody>
</table></div>
摘要索引建议放在团队约定的归档目录（例如 `docs/archive/` 或你们自定的 `synthesis/` 路径），与 **仍活跃的任务单目录** 分开，避免 Agent 把「已收尾 Epic」当成当前开工材料。

### 18.6 与经验卡片、Skill 的叠放

<div class="md-table-wrap">
<table>
<thead><tr>
<th>层</th>
<th>管什么</th>
<th>不替代什么</th>
</tr></thead>
<tbody>
<tr>
<td><strong>Skill / 规则</strong></td>
<td>怎么提问、怎么跑测试、命名习惯</td>
<td>合并前 CI、书面签收等</td>
</tr>
<tr>
<td><strong>经验卡片</strong></td>
<td>本轮踩坑与命令备忘</td>
<td>任务单字段与审查链</td>
</tr>
<tr>
<td><strong>跨轮回顾摘要</strong></td>
<td>Epic 级决策与模式</td>
<td>技术图谱做影响分析</td>
</tr>
<tr>
<td><strong>技术图谱</strong></td>
<td>入口与依赖</td>
<td>产品 PRD 全文</td>
</tr>
</tbody>
</table></div>
**签收仍然不可省**：摘要再全，也不能代替卷三的 **非范围、失败路径、合并前必绿**。

### 18.7 可选：一条 匿名化 踩坑备忘

笔者曾把「编译摘要」当成「合并后自动出现」——实际 **收尾归档后还要按需触发** 编译，否则回顾时只有冗长原文。此类备忘适合写在 **经验卡片**（一两段），不必写进每份摘要正文。

<hr />

## 19. 与「只会 Prompt」的工具链如何叠加

不少读者问：「我已经有 Cursor Rules、Copilot 指令、各种 Prompt 大全，还要学图谱和 Harness 吗？」

笔者的回答是：**要叠，但不是重复。** Prompt 管 **这一轮对话怎么说**；本系列管 **改哪、敢不敢合、收尾后怎么少忘**——三件事 Rules 很难单独承担。

### 19.1 各自擅长什么

<div class="md-table-wrap">
<table>
<thead><tr>
<th>能力</th>
<th>Prompt / Rules 典型做法</th>
<th>本系列（卷二～四）</th>
</tr></thead>
<tbody>
<tr>
<td>语气与风格</td>
<td>&quot;用 TypeScript 严格模式&quot;、&quot;回答要简短&quot;</td>
<td>不替代；可放进团队 Skill（§18）</td>
</tr>
<tr>
<td>单次编码</td>
<td>Composer 里描述需求</td>
<td><strong>任务单</strong> 冻结验收、非范围、失败路径（卷三）</td>
</tr>
<tr>
<td>仓库结构</td>
<td>偶尔 @ 几个文件</td>
<td><strong>技术图谱</strong> 给入口与影响面（卷二）</td>
</tr>
<tr>
<td>合并把关</td>
<td>很少覆盖</td>
<td><strong>合并前自动检查 + 书面签收</strong>（卷三、§17）</td>
</tr>
<tr>
<td>跨任务记忆</td>
<td>个人笔记、Notion</td>
<td><strong>跨轮回顾摘要</strong>（§18，可选）</td>
</tr>
</tbody>
</table></div>
**不是**「买了 Cursor Pro 就不用画地图」；也 **不是**「多贴十条 System Prompt 就等于 Harness」。

### 19.2 叠放关系（一张表）

<div class="md-table-wrap">
<table>
<thead><tr>
<th>层</th>
<th>现有实践</th>
<th>本系列补什么</th>
</tr></thead>
<tbody>
<tr>
<td><strong>会话习惯</strong></td>
<td>编辑器 Rules、Skill</td>
<td>团队 Skill：重复 ≥2 次的测试顺序、命名习惯（§18）</td>
</tr>
<tr>
<td><strong>单次任务</strong></td>
<td>Chat、Composer、Agent</td>
<td>任务单 + SDD 阶段流 + 审查签收（卷三）</td>
</tr>
<tr>
<td><strong>仓库结构</strong></td>
<td>常缺失</td>
<td>技术图谱 + 契约/锚点检查（卷二、§17）</td>
</tr>
<tr>
<td><strong>跨任务</strong></td>
<td>笔记、飞书文档</td>
<td>跨轮回顾摘要索引（§18，可选）</td>
</tr>
</tbody>
</table></div>
### 19.3 换模型、Auto 模式时靠什么

卷一 §0 提过：在 **Auto / 换模型** 时，单条 Prompt 容易漂移；笔者更信 **流程 + 机器验收 + 高敏书面复检**：

- 任务单字段不随模型变而消失；  
- 合并前检查仍须全绿；  
- 动对外 API、流式协议时，仍建议 **独立复检**（卷三 §12.5）。

若团队想 **换模型前自检**，可自行列 **几条定性问题** + **可选** 的小场景自测表（卷五将提供可复制模板）——结果 **仅供内部讨论**，**不作** PR 合并条件，也 **不设**「模型成功率 KPI」。那是纪律辅助，不是新的闸门。

### 19.4 最小叠加建议（三条）

若你已有 Prompt 库，想 **最小成本** 叠上本系列，笔者建议顺序：

1. **保留卷一 §6 任务单骨架**（验收、非范围、失败路径、合并前必绿）——明天就能用。  
2. **选一条链路画最小地图**（卷二 §8.2–8.3），任务单写图谱入口。  
3. **收尾后可选**：写一张 **经验卡片**；同类任务重复两次再沉淀 **团队 Skill**；Epic 结束再考虑 **编译摘要**。

范例栈是笔者在用的 **后端 API + 可选 Next/BFF 双仓** 组合，**不是**「一个 React 单体教程」——全栈读者请按自己的仓拆成 **契约 + 分栈合并前命令**（卷一 §6 分栈）。

<hr />

## 20. 结语

卷四把卷一～三收束成 **一条可执行的专题收尾故事**：

<div class="md-table-wrap">
<table>
<thead><tr>
<th>卷</th>
<th>你带走什么</th>
</tr></thead>
<tbody>
<tr>
<td><strong>卷一</strong></td>
<td>意图 / 成果 / 验收；图谱与流程 <strong>叠放</strong></td>
</tr>
<tr>
<td><strong>卷二</strong></td>
<td>技术图谱：先看地图再动手</td>
</tr>
<tr>
<td><strong>卷三</strong></td>
<td>任务单、书面签收、合并前必绿</td>
</tr>
<tr>
<td><strong>卷四</strong></td>
<td>专题跑通 + 收尾归档；（可选）编译摘要 <strong>少翻留痕</strong></td>
</tr>
</tbody>
</table></div>
**图谱** 回答改哪里；**Harness** 回答敢不敢合；**跨轮回顾摘要** 回答跨 Epic 怎么回顾——三者 **都不替代** 彼此。

若你读卷三时对 **冷层 / 温层 / 热层** 仍有「是不是架构三层」的疑惑：卷三正文已发表；请以 **[卷五 §23.1](https://cloud.tencent.com/developer/article/2681115)** 对照表为准（协作记忆分层，不是架构 / 契约 / 实现）。

**下一卷 · [卷五](https://cloud.tencent.com/developer/article/2681115)** 面向 **存量项目**：一周量级如何试通一条链、常见误区、渐进路线；附册（术语、模板、延伸阅读）将另行连载；卷五 §26 链出 **Blocking 三行模板** 与 **换模型定性自检** 等规划附件。

新项目：从卷一 §6 起步。老项目：从卷五 **阶段 0**（手动门禁写进任务单）起步。
