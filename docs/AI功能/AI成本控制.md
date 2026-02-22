# AI 成本控制与预算策略

## 功能说明

本策略用于控制 AI 调用成本，包含：
- 计价：按模型 + token 统计费用
- 预算：每日预算阈值与告警
- 约束：超预算时阻断 AI 调用（可配置）

## 配置项（system_config）

### 预算控制

- `ai_budget_daily_usd`：每日预算（USD），默认 `100`
- `ai_budget_warning_pct`：告警阈值占比，默认 `0.8`
- `ai_budget_enforce`：是否强制预算限制（true/false），默认 `false`

### 模型计价（USD/1k tokens）

- `ai_cost_per_1k_tokens_qwen_plus`：默认 `0.02`
- `ai_cost_per_1k_tokens_qwen_turbo`：默认 `0.008`
- `ai_cost_per_1k_tokens_default`：默认 `0.01`

> 模型名会被规范化为小写，并将非字母数字替换为 `_`。

## 行为说明

- **未开启强制预算**：仅统计与告警，不阻断调用。
- **开启强制预算**：当日花费达到预算后，后续 AI 调用会被阻断并触发降级逻辑（例如返回本地数据或提示稍后再试）。

## 统计与监控

Redis Key：
- `metrics:ai:cost:usd:YYYY-MM-DD`：当日累计成本

Micrometer 指标：
- `ai.cost.usd`（Counter）
  - tag: `model`

## 建议

- 在 Grafana 中设置 `ai.cost.usd` 相关告警。
- 对高频场景优先开启缓存与降级策略。
