# 🛡️ LearnSphere AI - 安全配置与审计文档

> 本文档详细介绍了 LearnSphere AI 的安全配置、敏感信息加密及权限审计日志的使用说明。

## 🔐 1. 敏感配置加密 (Configuration Encryption)

为了防止数据库密码、API Key 等敏感信息泄露，我们引入了 **Jasypt** 对配置文件进行加密。

### 1.1 加密工具使用
我们在 `backend/` 目录下提供了快捷脚本 `encrypt-config.ps1`，用于生成加密后的配置项。

**使用步骤：**
1. 设置环境变量 `JASYPT_PASSWORD`（加密密钥）。
   ```powershell
   $env:JASYPT_PASSWORD="YourSecretKey"
   ```
   > ⚠️ 如果不设置，脚本默认使用 `LearnSphere2026SecretKey`作为密钥（仅限开发环境使用，生产环境**必须**修改）。

2. 运行脚本：
   ```powershell
   cd backend
   .\encrypt-config.ps1
   ```
   脚本会输出加密后的密文，格式为 `ENC(...)`。

### 1.2 配置应用
将生成的密文复制到 `backend/src/main/resources/application-secret.properties` 中：

```properties
# 数据库密码
spring.datasource.password=ENC(加密后的字符串)

# AI API Key
ai.api-key=ENC(加密后的字符串)
```

### 1.3 启动参数
在启动应用时，需要传入解密密钥：
```bash
java -jar -Djasypt.encryptor.password=YourSecretKey learn-sphere-ai-backend.jar
```

---

## 📝 2. 权限审计日志 (Permission Audit Log)

系统内置了基于 AOP 的管理员操作审计功能，自动记录关键的增删改查操作。

### 2.1 审计范围
目前涵盖以下模块的管理操作：
- **认证模块**：管理员登录、登出
- **词汇管理**：添加、更新、删除、批量导入、AI生成详情、去重
- **内容管理**：阅读、听力、写作、语法、口语的增删改
- **AI 治理**：内容审查

### 2.2 使用方法 (@AdminOperation)
在 Controller 方法上添加 `@AdminOperation` 注解即可自动记录日志。

**示例代码：**
```java
@PostMapping("/vocabulary")
@AdminOperation(module = "词汇管理", action = "添加词汇")
public Result<?> addVocabulary(@RequestBody Vocabulary vocabulary) {
    // ...
}
```

### 2.3 日志查询
管理员可在后台管理系统中查看操作日志（需前端实现对应界面），日志存储在 `admin_log` 表中。

**表结构 (`admin_log`)：**
- `admin_id`: 操作管理员ID
- `module`: 模块名称
- `action`: 操作名称
- `details`: 操作参数详情（自动序列化，敏感字段会自动脱敏）
- `ip`: 操作来源IP
- `status`: 操作结果 (1:成功, 0:失败)
- `create_time`: 操作时间

---

## ⚠️ 3. 安全最佳实践

1. **不要提交 `application-secret.properties`**：该文件已包含在 `.gitignore` 中。
2. **生产环境密钥管理**：生产环境务必使用复杂的 `jasypt.encryptor.password`，且不要硬编码在脚本中。
3. **定期轮换密钥**：建议定期更换 Jasypt 密钥和数据库密码。
