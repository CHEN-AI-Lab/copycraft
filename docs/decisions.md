# 关键决策日志

## ADR-001: monorepo + shared/ 架构

**决定**：采用 pnpm workspace monorepo 结构，shared/ 为纯 TS 共享层，apps/ 放各端应用。

**理由**：后续可能增加小程序/App/桌面端，共享层保证类型、校验、工具函数统一，避免多端各写一套。

## ADR-002: 使用 Zod 做校验

**决定**：前后端共用 Zod schema 做输入校验。

**理由**：类型安全、运行时校验一体化，减少重复代码。

## ADR-003: next-intl 中英文双语

**决定**：使用 next-intl 实现 zh-CN / en 切换。

**理由**：内置 App Router 支持，SEO 友好，翻译文件用 JSON 管理。

## ADR-004: AI 模型选型

**决定**：支持 OpenAI 和 DeepSeek API 切换，通过环境变量配置。

**理由**：用户已有 DeepSeek Key，但保留 OpenAI 兼容作为备选。

## ADR-005: 文案长度控制

**决定**：前端传 length 参数，后端动态拼入 system prompt，禁用后端自动换行处理（已撤销此决定，恢复为短=不换行，中/长=自动按句号换行）。