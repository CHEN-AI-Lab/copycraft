# CopyCraft — AI Copywriting Tool

AI 驱动的多平台文案生成工具。输入想法，AI 生成适用于微信、小红书、微博等平台的优化文案。

## 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp apps/web/.env.example apps/web/.env.local
# 编辑 .env.local，填入你的 API Key

# 3. 启动开发服务器
pnpm dev          # http://localhost:3000
```

## 项目架构

```
copycraft/
├── shared/         ← 跨平台共享层（类型、校验、常量、工具函数）
├── apps/web/       ← Web 端（Next.js 15 App Router）
├── packages/ui/    ← 共享 UI 组件库
├── tests/          ← 单元测试 + E2E 测试
├── scripts/        ← 自动化脚本
└── docs/           ← 架构文档 + 决策日志
```

## 常用命令

| 命令 | 作用 |
|------|------|
| `pnpm dev` | 启动 Web 开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm test` | 运行单元测试 |
| `pnpm test:e2e` | 运行 E2E 测试（需 Playwright） |
| `pnpm lint` | 代码检查 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm check` | 全部检查（类型 + lint + 测试 + 构建） |
| `bash scripts/setup.sh` | 新环境初始化 |
| `bash scripts/check.sh` | 完整质量检查 |
| `bash scripts/deploy.sh` | 部署上线 |

## 技术栈

- **框架**: Next.js 15 (App Router) + React 19
- **语言**: TypeScript (strict)
- **样式**: Tailwind CSS 4 + dark mode
- **国际化**: next-intl (zh-CN / en)
- **共享层**: monorepo (pnpm workspace)
- **测试**: Vitest + Playwright
- **部署**: Vercel

## 环境变量

见 `apps/web/.env.example`：

- `OPENAI_API_KEY` / `DEEPSEEK_API_KEY` — AI API Key
- `CREEM_API_KEY` — 支付 API Key（可选）
- `NEXT_PUBLIC_PRICE_ID` — 商品 ID（可选）

## 共享层（shared/）

多端复用的核心代码：

- `shared/types/` — 跨平台类型定义
- `shared/constants/` — 平台/语气/长度配置
- `shared/validators/` — Zod 校验 schemas
- `shared/utils/` — 纯函数工具集
- `shared/api/` — 统一 API 客户端
- `shared/hooks/` — 通用 React hooks

新增端（小程序/App/桌面）时，`shared/` 代码直接复用，只写 UI 层。