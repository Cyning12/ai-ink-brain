# AI-Ink-Brain：个人知识库与 RAG 智能博客

一个基于 Next.js 构建的现代化全栈博客系统，将个人学习日志、Demo 展示与 RAG（Retrieval-Augmented Generation）技术深度融合。它不仅是我的思维沉淀空间，也是一个可交互的 AI 智能体。

## ✨ 项目亮点

- **🎨 水墨极简美学**：低饱和度配色 + 大留白，视觉风格参考传统水墨画，追求极致阅读体验。
- **🤖 语义化对话（RAG）**：集成 SiliconFlow（DeepSeek/Claude）接口，可通过聊天窗口针对本站所有文章深度问答。
- **⚡ 全栈 Serverless**：基于 Next.js App Router 与 Vercel 部署，利用 Edge Runtime 实现毫秒级 AI 流式响应。
- **🗂️ 向量驱动**：使用 Supabase（pgvector）存储文章 Embedding，支持语义搜索而非简单关键词匹配。
- **🛠️ 自动化管线**：结合 GitHub Actions，实现文章发布自动触发向量化更新。

## 🏗️ 技术栈

- **Framework**：Next.js 15（App Router）
- **AI SDK**：Vercel AI SDK & LangChain.js
- **Styling**：Tailwind CSS
- **Database**：Supabase（PostgreSQL + pgvector）
- **LLM Provider**：SiliconFlow
- **Editor**：Cursor（AI-first development）

## 🚀 核心功能规划

- [ ] **Blog Engine**：支持 MDX 的高性能内容渲染。
- [ ] **RAG Chatbot**：浮动式 AI 助手，具备上下文感知与文档引用功能。
- [ ] **Project Showcase**：动态展示 AI Demo（如 Regulation RAG 工具）。
- [ ] **Automated Cover**：利用 AI 生成统一水墨风格的文章封面。

## 🛠️ 本地开发

克隆项目：

```bash
git clone https://github.com/your-username/ai-ink-brain.git
```

安装依赖：

```bash
npm install
```

环境变量：复制 `.env.example` 并填入你的 `SILICONFLOW_API_KEY` 和 Supabase 密钥。

启动：

```bash
npm run dev
```

## 👨‍💻 关于作者

我是一名正在向 AI Application Development Engineer 转型的开发者。这个项目是我在 AI 浪潮下的实践记录与技术落地。