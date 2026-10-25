# AI 服务连接配置

后台入口：**AI 治理 → 稳定性 → AI 服务配置**。

## 配置步骤

1. 填写 API URL，可使用 `https://你的服务地址/v1` 或完整的 `/chat/completions` 地址。
2. 填写该服务对应的 API Key。已配置时留空保留原密钥，填写新值则替换。
3. 填写服务提供方支持的模型 ID。
4. 按需选择推理强度（见下节）。
5. 点击“保存配置”。后续文本 AI 调用立即读取新配置。

接口采用 OpenAI 兼容的 Chat Completions 请求与响应格式。URL 根路径会补充 `/v1`，
完整 `/chat/completions` 路径不会重复拼接。可参考
[百炼兼容接口说明](https://www.alibabacloud.com/help/en/model-studio/deep-thinking)。

设置用于学习内容生成、AI 助教、词汇详情补全和模拟考试等文本 AI 功能。
AI 助教的专项模型配置仍可单独覆盖其模型；保存全局服务配置时会清除旧模型覆盖，
使这些功能统一采用本次保存的模型。

## 推理强度

后台「推理强度」是**全局统一**的一个档位，对所有文本 AI 调用生效。
不同厂商的参数名和取值范围都不一样，所以保存的是统一档位，下发时按模型名自动翻译。

| 档位 | qwen3 系列 | DeepSeek | o 系列 / gpt-5 |
|---|---|---|---|
| 关闭 | `enable_thinking=false` | `thinking.type=disabled` + `reasoning_effort=none` | 不下发，走模型默认 |
| 低 | `enable_thinking=true` + `thinking_budget=1024` | `reasoning_effort=low` | `reasoning_effort=low` |
| 中 | `enable_thinking=true` + `thinking_budget=4096` | `reasoning_effort=high`（DeepSeek 无 medium） | `reasoning_effort=medium` |
| 高 | `enable_thinking=true` + `thinking_budget=16384` | `reasoning_effort=high` | `reasoning_effort=high` |

**只有识别出的思考模型才会收到这些参数**：模型名以 `qwen3` 开头或包含 `-thinking`
走 DashScope 分支；以 `deepseek` 开头走 DeepSeek 分支；以 `o1`/`o3`/`o4`/`gpt-5` 开头走
OpenAI 分支。其它模型（`qwen-turbo`、`gpt-4o` 等）**一个参数都不下发**——
给不支持的模型硬塞参数轻则被忽略，重则直接 400。

所以：**换了不支持的模型后，推理强度设置会静默失效**，后台的提示文字会跟着模型名变化，
保存前可以据此判断当前模型是否支持。

> **DeepSeek 特别注意**：它的 `reasoning_effort` 只接受 `none`/`low`/`high`/`max`，
> **没有 medium**。后台选「中」时会按 `high` 下发。DeepSeek 默认开启思考，
> 所以选「关闭」会同时下发 `thinking.type=disabled` 与 `reasoning_effort=none`。

> 关于「关闭」：qwen3 系列**默认是开启思考的**，所以选「关闭」必须显式下发
> `enable_thinking=false` 才真的关掉。而 OpenAI 侧没有「关闭」这个取值，
> 所以选关闭时不下发 `reasoning_effort`，走模型默认行为。

> 思考预算不是越大越好。给简单任务（如词汇详情补全）设「高」会让单次调用明显变慢，
> 前端可能等到超时。建议默认用「关闭」或「低」，只给作文批改、口语评估这类
> 需要细想的场景用「高」。

## 失败重试与额度退还

### 重试

AI 调用经过 Resilience4j 的 Retry 装饰，**最多 3 次**，指数退避（2s → 4s）。

只重试「重试有可能成功」的故障：`IOException`、`TimeoutException`、
`HttpTimeoutException`、`ConnectException`。

**不重试**确定性失败：`IllegalStateException`（如「请先配置 AI API Key」、
「AI 接口请求失败（HTTP 401）」）、`IllegalArgumentException`、`InterruptedException`。

> 这条很关键。如果所有异常都重试，那么 API Key 填错、余额不足、模型名不存在
> 这类错误会让用户白等 6 秒（2s + 4s）后才看到同样的报错，还额外消耗上游请求次数。

### 额度退还

额度在业务方法**执行前**预扣。现在只有两种情况保留扣减：

1. 方法正常返回，且返回值**没有**降级标记；
2. 方法正常返回，但返回值不是 Map（无法判断，按成功处理）。

其余情况（抛异常、或返回 `_from=local` / `_from=mock` 的降级结果）**一律退还**。

> 为什么降级也退：降级意味着 AI 没有真正产出内容，用户拿到的是本地题库或兜底数据。
> 这种情况消耗的是我们自己的资源，不是上游 API 的计费额度，不应该扣用户的次数。

> `_from` 有 `local` 和 `mock` 两个取值，两者都是降级。只判断其中一个会导致
> 另一条路径下用户被白扣额度——这个坑在实测时踩过。

退还用 `decrement` 而不是 `delete`，避免把当天其它成功调用累积的计数一起清掉。
退还失败时只记 ERROR 日志（含 userId / feature / cost / key 供人工核对），
不覆盖原始业务异常。

## 保存与恢复

URL、模型、推理强度及加密后的 Key 保存在 MySQL `system_config` 的 `internal.ai.provider`
配置项中。API Key 不回显到后台配置响应，不写入前端持久化存储。密钥加密使用部署的 Jasypt
加密器，因此需保持 `JASYPT_PASSWORD` 等加密设置稳定。改变加密设置后，应迁移密文或重新保存密钥。

> `JASYPT_PASSWORD` 未设置时保存配置会失败并提示 `Password cannot be set empty`。
> 这是加密器初始化失败，不是表单问题——先配好环境变量再保存。

“恢复部署默认”移除后台覆盖，并重新使用后端的 `ai.api-url`、`ai.api-key`、`ai.model`。
部署默认值可通过 `AI_API_URL`、`AI_API_KEY`、`AI_MODEL` 或本地 secret 文件配置。
**推理强度没有部署默认值**，恢复默认即等于「关闭」。

连接配置参与 AI 结果缓存标识，切换 URL、Key、模型**或推理强度**后不会继续使用此前配置的
缓存结果。推理强度纳入缓存标识是必要的：同一个 prompt 在不同档位下产出不同，
不纳入会导致改档位后仍命中旧结果，看起来像设置没生效。

## 更新代码后的首次使用

先重新启动后端，再刷新后台页面。如果页面提示需要加载 URL 和 Key 配置接口，说明后台页面已更新，
而当前后端进程尚未加载新接口。输入框仍可手动编辑，但旧接口会阻止保存 URL 和 Key；
建议先重启并刷新，再填写保存。保存后的后续配置变更不需要再次重启。

## 验证范围

单元测试覆盖配置加密保存、密钥留空保留、恢复部署默认、URL 校验、兼容接口请求与响应转换、
推理强度档位归一与持久化、档位到厂商参数的映射（含不支持的模型不下发任何参数）、
以及管理接口读取和保存。测试使用模拟上游响应，不会使用真实 API Key 发送模型请求。

推理强度的端到端行为已用本地 mock 厂商服务实测确认：配置 `qwen3-max` + 高档时，
实际发出的请求体含 `enable_thinking=true` 与 `thinking_budget=16384`；
切到关闭后变为 `enable_thinking=false` 且无预算字段；
换成 `qwen-turbo` 后两个字段都不出现。
