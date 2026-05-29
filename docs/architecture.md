# Architecture

## Overview
Single-page AI copywriting tool. User enters keywords/topic → selects platform → AI generates copy → copy/regenerate.

## Flow
```
User Input → Platform Select → AI API → Output Display → Copy/Regenerate
```

## Components
- InputPage: textarea + platform selector + generate button
- OutputPanel: generated copy display + copy button + regenerate

## Data Flow
```
Client (form) → /api/generate → LLM API → Response streamed back
```

## i18n
- next-intl, messages/zh-CN.json + messages/en.json
- Cookie-based language persistence
- Default: zh-CN
