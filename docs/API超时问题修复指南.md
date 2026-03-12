# API 超时问题修复指南

## 快速修复摘要

如果你现在只想先把超时问题压住，最短路径是：

1. 将后端 AI 服务超时从 `30s` 提高到 `120s`
2. 将 Redis 超时从 `5000` 调整到 `10000`
3. 重启后端服务后再验证 AI 生成功能

快速修复后的推荐超时配置：

| 组件 | 超时时间 | 说明 |
|------|---------|------|
| 前端请求 | 120 秒 | 当前已按长请求场景放宽 |
| 后端 AI 服务 | 120 秒 | AI 生成类请求建议至少 120 秒 |
| Redis | 10 秒 | 避免缓存层过早超时 |
| 数据库 | 5-30 秒 | 按查询复杂度调整 |

如果只是排查“为什么 60 秒就报 `timeout of 60000ms exceeded`”，优先看下面这条：

```properties
resilience4j.timelimiter.instances.aiService.timeout-duration=120s
```

## 🐛 问题描述

```text
AxiosError: timeout of 60000ms exceeded
```

这个错误表示 API 请求在 60 秒后超时。对于 AI 生成类请求，这个时间太短了。

## 🔍 问题分析

### 当前超时配置

| 配置位置 | 当前值 | 说明 |
|---------|--------|------|
| 前端 `request.js` | 120,000ms (120秒) | ✅ 已正确配置 |
| 后端 AI 服务 | 30,000ms (30秒) | ❌ 太短 |
| 后端数据库 | 5,000ms (5秒) | ⚠️ 可能需要调整 |

### 问题根源

后端 AI 服务超时配置太短：

```properties
resilience4j.timelimiter.instances.aiService.timeout-duration=30s
```

这导致即使前端等待 120 秒，后端也会更早中断请求。

## ✅ 解决方案

### 方案 1：增加后端 AI 服务超时时间（推荐）

修改后端配置，把 AI 服务超时从 `30s` 提高到 `120s`：

```properties
resilience4j.timelimiter.instances.aiService.timeout-duration=120s
```

### 方案 2：同步检查 Redis 与数据库超时

对于长请求场景，建议同步确认：

```yaml
spring:
  datasource:
    hikari:
      connection-timeout: 30000
      validation-timeout: 5000
```

并把 Redis 超时适当放宽到 `10000ms`，避免缓存层成为新的短板。

### 方案 3：为 AI 服务增加重试与观测

如果 AI 调用链存在偶发波动，可以补充：

- Resilience4j 重试配置
- 慢请求日志
- Prometheus / Grafana 观测

## 🚀 快速修复步骤

### 步骤 1：更新后端配置

优先修改 AI 服务超时：

```properties
resilience4j.timelimiter.instances.aiService.timeout-duration=120s
```

### 步骤 2：按需调整数据库与 Redis 超时

如果本地环境里还有 Redis / 连接池超时，也一并调整。

### 步骤 3：重启后端服务

```bash
cd backend
mvn spring-boot:run
```

### 步骤 4：验证

重启后优先验证三类高频场景：

1. 口语话题或作文生成，预期 `30-60` 秒
2. 模拟试卷生成，预期 `60-120` 秒
3. AI 对话，预期 `10-30` 秒

如果仍然超时，继续检查：

- AI API 密钥是否有效
- 目标模型是否可用
- 后端日志里是否有熔断、限流或网络错误
- 本地 Redis 和数据库是否存在额外阻塞

## 📊 推荐的超时策略

| 操作类型 | 推荐超时 | 说明 |
|---------|---------|------|
| 登录 / 注册 | 10s | 快速响应 |
| 普通查询 | 15-30s | 常规业务请求 |
| AI 对话 | 30s | 中短时生成 |
| AI 内容生成 | 120s | 阅读、口语、写作等生成 |
| 模拟试卷生成 | 180s | 复杂场景可进一步放宽 |

## 历史说明

旧文档 `API超时快速修复.md` 已并入本文，后续只维护这一份。
