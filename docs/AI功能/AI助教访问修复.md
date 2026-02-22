# AI 学习助手权限修复计划

## 📋 问题描述

**现状**: 普通用户（非 VIP）无法使用 AI 学习助手功能。
**现象**: 当普通用户尝试向 AI 助教提问或点击"问问 AI"按钮时，系统提示"此功能仅限 VIP 会员使用"。
**原因**: 后端 `AITutorController` 中的接口使用了 `@RequireVip` 注解，但未明确设置 `minLevel = 0`，导致默认要求 VIP 等级 1（即正式会员）。

## ✅ 修复方案

### 1. 后端权限调整

修改 `backend\src\main\java\com\learnsphere\controller\AITutorController.java` 中的相关接口：

- 将 `@RequireVip(feature = "AI 助教提问", checkQuota = true)` 
- 修改为 `@RequireVip(feature = "AI 助教提问", checkQuota = true, minLevel = 0)`

这样非 VIP 用户（Level 0）也可以进入权限校验逻辑，并由 `VipCheckAspect` 进行配额检查。

### 2. 配额逻辑验证

已确认 `UserController.java` 和 `VipCheckAspect.java` 中的逻辑：
- 普通用户默认享有 **200 次/日** 的 AI 助教提问配额。
- 这一配额与"内容生成"配额（5次/日）是独立计算的，旨在鼓励用户更多地使用助教进行学习答疑。

## 🎯 修复效果

- ✅ 普通用户可以正常打开 AI 学习助手。
- ✅ 普通用户可以每天免费提问最多 200 次。
- ✅ 提问次数耗尽后，系统会正常提示额度不足（符合预期）。
- ✅ VIP 用户继续享有更高（400-1500次）的提问额度。

## 📊 影响范围

### 已更新文件
- `AITutorController.java`: 更新了 `chat` 和 `chatWithHistory` 接口的访问级别。

### 测试建议
1. 使用普通用户账号登录。
2. 进入"语法练习"、"阅读理解"或"错题本"。
3. 点击"AI 助教"或"问问 AI"。
4. 确认提问能否得到响应。
5. 确认个人中心的"今日助教提问配额"是否同步扣减。

---
**修复人员**: Antigravity AI  
**修复时间**: 2026-02-14 (UTC)  
**版本**: 2.5.1  
