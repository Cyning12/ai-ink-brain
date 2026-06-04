---
title: 在线简历（Portfolio · RAG 同源）
description: 由 PDF 导出 · 刘新宁-11年-AICoding.pdf
date: 2026-06-04
last_portfolio_sync: 2026-06-04
source_pdf: 刘新宁-11年-AICoding.pdf
sync_target: ../../Projects/ai-ink-brain/content/resume/cv-online.md
---

# 刘新宁

男 | 年龄：37岁 |

17319050601 |

231127227@qq.com

14年工作经验 | 求职意向：AI Coding / Agent / 项目架构 | 期望城市：北京

## 个人优势

11 年软件开发经验，腾讯云架构师同盟成员，具备大型电商 App、跨端 B 端（UniApp 小程序 + Web）与中台化交付背景。2025 年起在般果运营平台用 Cursor 完成日常需求开发、维护与迭代；2026 年起沉淀 AI 辅助研发实践（任务签收、评审与发布检查 + 按模块供给架构说明，避免全量架构文档一次性交给 AI），在生产与个人项目中验证，减少改码跑偏与变更难追溯。**公开连载《AI 编程可闭环协作》**（[方法论导读](https://cloud.tencent.com/developer/article/2681553) + 卷一～五 · [GitHub](https://github.com/Cyning12/ai-coding-closed-loop-articles)）。

个人全栈：文档 RAG 问答（已落地） + ChatBI 多助手（建设中）；AI 主导编码，本人负责架构、需求拆解与验收。演示站：https://ai-ink-brain.vercel.app/ · 对话秘钥 231127227@qq.com 邮件申请。技术栈：Next.js、Python、向量库与混合检索。

## 公开作品与演示

- [方法论导读](https://cloud.tencent.com/developer/article/2681553) · [GitHub 连载](https://github.com/Cyning12/ai-coding-closed-loop-articles)
- 演示站：https://ai-ink-brain.vercel.app/
- 访客秘钥：231127227@qq.com（邮件申请 · 普通/深度两档 · 过期失效）

## 专业技能

- 【AI Coding】Cursor 日常研发；AI 协作规范（任务拆分、评审签收、测试/发布检查）；Harness 过程治理
- 【AI 应用】RAG · Text2SQL · Prompt · 自研 Agent 编排（ReAct · Tool 注册 · SSE）· 混合检索 · Supabase(pgvector)
- 【前端 / 跨端】Vue3 · TypeScript · Vuex · UniApp · 小程序 + Web
- 【移动端】iOS（Objective-C / Swift / UIKit）— 多年核心架构经验
- 【工程化】Python · FastAPI · Node.js · REST / SSE · Git · Docker

## 工作经历

### 深圳百果园实业（集团）股份有限公司

多项目

2015.09-2026.01

就职时间10年，下列为集团内项目/岗位时间轴。

### 2024.01-2026.01 | 般果运营管理平台（小程序+Web）移动端/前端研发负责人

1、负责供应商端与总仓端小程序整体架构设计与0–1搭建
2、基于UniApp封装跨端适配层，统一业务模型与状态管理（Vuex）
3、设计高复用组件库与通用业务模块，显著降低后续功能迭代成本
4、实现蓝牙打印能力，支持质检单、送货单等现场作业场景
5、2025 年起以 Cursor 参与日常研发，按模块供给架构上下文并验证 AI 辅助研发流程（生产环境）
### 2016.8–2023.12  | 百果园App iOS端高级工程师/架构设计

1、长期负责百果园AppiOS端核心架构设计与演进，主导购物车、交易链路、首页与基础设施建设
2、随业务中台化推进，转向小程序与Web管理台开发，负责B端系统从0–1的架构搭建
3、在团队中承担复杂问题兜底与技术方案设计角色，推动模块化、组件化和跨端复用
### 2015.9-2016.8 | 一米鲜App iOS研发

负责首页、活动专题主要的一级页面开发和商品详情、凑单等二级页面开发

## 项目经历

### AI Coding 工程治理 + 智能体实践 · 技术负责 · 2025.06-至今

在般果真实迭代中积累 AI-native 协作经验，并在个人项目中完成闭环：针对 Agent 改码的上下文漂移与变更难审计，落地 SDD + TDD + Harness + 架构上下文按需供给。

1、设计协作链：任务拆分、变更说明、评审签收、自动化测试与发布检查（Harness Inform / Constrain / Verify）
2、设计上下文链：按模块/任务范围向 Agent 提供架构说明，禁止全量架构文档一次性灌入；规范落盘 .cursor/rules 并抽象为 跨 Agent SKILL（Claude Code、Kimi Code 等）
3、个人项目：RAG 文档问答（已上线）+ ChatBI 多助手编排（建设中）；后端自研多阶段 RAG + Unified 路由 + ChatBI Agent 循环（ToolRegistry · ReAct · SQL 闸口 · SSE events）
4、业绩：对比全量灌入基线，静态 token 约 1/9；冷启动架构问答 +50%+
5、技术栈：Next.js、FastAPI、混合检索 + rerank、自研 ChatBI Agent、Cursor、Harness
### 般果运营管理平台(uniApp+Web) · 前端研发 · 2024.01-2026.01

百果园控股 B2B 水果供应链平台（总仓 + 城市仓），对接上游供应商与下游小微零售商，覆盖多省城市采销与仓储协同。

1、供应商端与总仓端小程序架构 0–1 搭建；UniApp 跨端适配与 Vuex 状态管理
2、高复用组件库与通用模块；蓝牙打印（质检单、送货单）
3、与后端统一接口规范（鉴权、分页、异常、数据安全）
4、组件复用 70%+；蓝牙打印使现场效率约 +30%
5、技术栈：UniApp、Vue2、JavaScript、Vuex、微信小程序、Web
### 百果园 App服务中台化改造项目 · 多模块负责人（核心开发） · 2021.09-2023.12

1、负责购物车、优惠券、广告、活动等高频服务 Serverless 化，高频服务成功迁移，运维成本下降，大促期间稳定支撑高并发
2、优惠券发放与权益系统；及时达/次日达购物车接口与数据结构优化
3、首页活动与广告配置、广告跳转规则引擎（商品/活动/H5/小程序），优惠券系统支持 App + H5 多端复用
4、前后端接口规范、联调与数据一致性，保障新老系统平滑迁移
5、技术栈：Node.js、MongoDB、Redis、Serverless
### 百果园App iOS端 · iOS研发/架构 · 2015.09-2023.12

1、负责首页、活动专题及商品详情、凑单等主要业务页面开发。长期负责 iOS 核心架构：路由、网络、日志、模型体系
（PGDModelStore 等）

2、实现类 API Gateway + Service Registry 的路由架构，降低模块耦合，统一模型与状态体系，降低多页面数据错乱与重复刷新
3、主导购物车与交易链路、首页/分类/购物车/用户中心主流程
4、推动模块化、组件化与 App–H5 协同，路由框架支持多场营销活动快速上线；日志体系缩短线上问题定位时间
5、技术栈：Objective-C、Swift、UIKit
### 一米鲜 · iOS研发 · 2015.09-2016.12

首页、活动专题主要的一级页面开发和商品详情、凑单等二级页面开发

## 教育经历

河北金融学院

本科

计算机科学与技术

2008-2012

## 资格证书

大学英语四级
