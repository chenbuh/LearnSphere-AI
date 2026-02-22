# 登录验证码功能说明文档

## 1. 功能概述
为了提高系统安全性，防止恶意暴力破解用户密码，我们在网站登录页面引入了智能验证码机制。该机制会自动监测登录失败次数，仅在必要时要求用户输入验证码。

**注意：** 管理后台（Admin）登录流程保持不变，不启用此验证码校验。

## 2. 核心流程
1.  **失败计数**：系统使用 Redis 记录每个用户名的登录失败次数（Key 为 `login_fail_count:{username}`，有效期 1 小时）。
2.  **触发阈值**：当同一个用户名登录失败次数达到 **3 次**时，后续登录请求必须携带正确的验证码。
3.  **前端展示**：
    *   在登录页面输入用户名后，失去焦点（Blur）时会自动检查是否需要验证码。
    *   如果需要，页面将显示验证码输入框及图片。
    *   登录失败时，前端也会重新检查并刷新验证码需求状态。
4.  **自动重置**：
    *   登录成功后，失败计数会自动清零。
    *   验证码验证成功后，当前使用的验证码立即失效（一次性）。

## 3. 接口变更

### 3.1 检查是否需要验证码
*   **URL**: `/api/auth/captcha/required`
*   **Method**: `GET`
*   **Query Params**: `username` (String)
*   **Response**: 
    ```json
    {
      "code": 200,
      "data": {
        "required": true // true 为需要，false 为不需要
      }
    }
    ```

### 3.2 获取验证码图片
*   **URL**: `/api/auth/captcha`
*   **Method**: `GET`
*   **Response**: 
    ```json
    {
      "code": 200,
      "data": {
        "captchaKey": "uuid", // 用于标识验证码
        "captchaImage": "data:image/png;base64,..." // Base64 图片
      }
    }
    ```

### 3.3 登录接口更新
*   **URL**: `/api/auth/login`
*   **Method**: `POST`
*   **Body**: 
    ```json
    {
      "username": "...",
      "password": "...",
      "captchaCode": "...", // 验证码（如果需要）
      "captchaKey": "..."   // 验证码 Key（如果需要）
    }
    ```

## 4. 技术实现
*   **后端**：
    *   使用 `Hutool-captcha` 生成干扰线验证码。
    *   使用 `Redis` 存储验证码（有效期 2 分钟）及失败尝试计数。
    *   在 `UserServiceImpl.login` 中集成校验逻辑。
*   **前端**：
    *   在 `LoginView.vue` 中动态根据后台反馈显示/隐藏验证码模块。
    *   使用 `authApi.checkCaptchaRequired` 进行异步校验。

## 5. 安全建议
*   建议在生产环境中结合 IP 频率限制进一步增强防御。
*   目前的计数器是基于用户名的，如果需要基于 IP 也可以在 `AuthController` 中获取客户端 IP 并进行计数。
