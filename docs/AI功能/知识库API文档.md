# Knowledge Item: Knife4j API Documentation System

## Overview
LearnSphere AI uses **Knife4j** (based on OpenAPI 3 / Swagger) to generate interactive API documentation. This system reduces communication friction between frontend and backend teams by providing clear descriptions of every API endpoint and data field.

## Accessing Documentation
- **URL**: `http://localhost:8080/doc.html` (Local development)
- **Engine**: SpringDoc OpenAPI 3

## Core Components

### 1. Dependency Configuration
The platform uses the Knife4j Spring Boot Starter for Jakarta (Spring Boot 3 compatibility):
```xml
<dependency>
    <groupId>com.github.xiaoymin</groupId>
    <artifactId>knife4j-openapi3-jakarta-spring-boot-starter</artifactId>
    <version>4.3.0</version>
</dependency>
```

### 2. Global Configuration
Configured in `com.learnsphere.config.SwaggerConfig`. It defines basic details like title, version, and contact info.

### 3. Controller Annotations
- **@Tag**: Used at the class level to group APIs (e.g., "AI 生成接口").
- **@Operation**: Used at the method level to describe the endpoint's purpose (e.g., "生成阅读文章").

### 4. Entity & DTO Annotations
- **@Schema**: Used at the class and field level to provide metadata.
  - `description`: Human-readable explanation.
  - `example`: Typical value for the field.
  - `requiredMode`: Indicates if the field is mandatory.
  - `accessMode`: Controls visibility (e.g., `WRITE_ONLY` for passwords).

## Best Practices
1. **Always annotate new DTOs**: Every field in a request or response object should have a `@Schema` description.
2. **Use Examples**: Providing `example` values in `@Schema` allows frontend developers to test APIs immediately from the `doc.html` interface.
3. **Protected Fields**: Hide internal or sensitive fields (like salts or passwords) in response documentation using `accessMode = Schema.AccessMode.WRITE_ONLY`.
4. **Result Wrapper**: The `com.learnsphere.common.Result` class is globally annotated so that the outer structure of every response is well-documented.

## DX Optimization (Developer Experience)
The documentation is enhanced for engineering efficiency:

### 1. API Grouping (Modularization)
APIs are categorized into logical groups via `SwaggerConfig`:
- **1. AI 业务接口**: 阅读、写作、听力、语法等 AI 核心功能。
- **2. 个人/认证接口**: 用户登录、注册、个人资料查询。
- **3. 管理后台接口**: 管理员权限下的所有操作。
- **4. 通用基础接口**: 文件上传、系统配置等。

### 2. Authorization Integration (Sa-Token)
The Knife4j UI supports global authorization:
- In `doc.html`, click **"Authorize"** or the key icon.
- Input the `satoken` value obtained from the login API.
- All subsequent try-it-out requests will automatically include the `satoken` header.

### 3. Global Error Code Visibility
Standardized error codes (200, 401, 403, 429, 500) are documented in the global description for consistent frontend error handling.
