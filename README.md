# ContentPilot ✈️

> AI 原生的一人内容工作室 — 让个人创作者用 AI 完成「选题→创作→改写→出图→分发」全链路

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🎯 为什么做这个？

个人创作者一人运营多平台，每天都在重复「写稿→改格式→找图→排版→手动发布」的搬砖循环。现有工具（Postiz等）只解决排期发布，AI只是配角。**ContentPilot 反过来——AI 是主角，从选题到成片全链路驱动。**

## ✨ 核心特性

- 🎯 **选题中心** — 输入关键词，AI推荐热门选题+爆款分析
- ✍️ **创作工坊** — 一键生成4平台文案（小红书/公众号/抖音/B站）
- 🔄 **一键改写** — 源内容自动适配多平台风格，字数差异>30%
- 🎨 **AI出图** — 自动生成封面图+内容卡片，适配各平台尺寸
- 🚀 **一键分发** — 公众号推草稿箱，其他平台导出标准格式
- 🧠 **风格引擎** — 人设档案控制AI输出，生成内容像你写的

## 🏗️ 技术栈

| 技术 | 用途 |
|------|------|
| Next.js 15 | 全栈框架 (App Router) |
| TypeScript | 类型安全 |
| Tailwind CSS 4 | 样式 |
| Prisma + SQLite | 数据存储 |
| OpenAI / DeepSeek API | AI内容生成 |
| Vercel | 部署 |

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/your-username/content-pilot.git
cd content-pilot

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的 API Key

# 初始化数据库
npx prisma db push

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000 即可使用。

## 📁 项目结构

```
content-pilot/
├── docs/                    # 产品需求文档
│   └── PRD.md
├── prisma/                  # 数据库Schema
│   └── schema.prisma
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API Routes
│   │   ├── (dashboard)/     # 仪表盘页面
│   │   │   ├── topics/      # 选题中心
│   │   │   ├── create/      # 创作工坊
│   │   │   ├── distribute/  # 分发枢纽
│   │   │   └── settings/    # 系统设置
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/          # UI组件
│   ├── lib/                 # 核心逻辑
│   │   ├── ai/              # AI调用封装
│   │   ├── platforms/       # 各平台适配器
│   │   ├── persona/         # 人设引擎
│   │   └── utils.ts
│   └── types/               # TypeScript类型
└── README.md
```

## 🔧 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `OPENAI_API_KEY` | OpenAI / DeepSeek API Key | ✅ |
| `AI_BASE_URL` | API 基础 URL (默认 DeepSeek) | ❌ |
| `AI_MODEL` | 模型名称 (默认 deepseek-chat) | ❌ |
| `WECHAT_APPID` | 公众号 AppID | ❌ |
| `WECHAT_SECRET` | 公众号 AppSecret | ❌ |
| `WECHAT_PROXY_URL` | 公众号代理地址 | ❌ |

## 🗺️ 路线图

- [x] v0.1 MVP — 选题+创作+改写+公众号分发
- [ ] v0.2 — 小红书导出+素材库+选题日历
- [ ] v0.3 — 数据看板+风格学习
- [ ] v0.4 — 多人设支持+合规检查

## 🤝 与 Postiz 的区别

| 维度 | Postiz | ContentPilot |
|------|--------|-------------|
| 定位 | 社媒排期工具 | **AI内容创作+分发** |
| AI角色 | 辅助 | **核心驱动** |
| 目标市场 | 海外 | **中文生态** |
| 目标用户 | SaaS团队 | **个人创作者** |

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

⭐ 如果这个项目对你有帮助，欢迎 Star！
