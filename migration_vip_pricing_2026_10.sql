-- VIP 新定价与每日额度（2026-10）
-- 免费 15 点 / 助教 20 次；月度 ¥29 100/100；季度 ¥69 120/150；年度 ¥199 150/200
-- 之后可在管理后台继续调整：VIP 订单 → 套餐价格；系统设置 → 每日 AI 额度

INSERT INTO `system_config` (`config_key`, `config_value`, `description`, `category`) VALUES
  ('vip.price.1', '29', '月度会员价格（元）', 'VIP_PLAN'),
  ('vip.price.2', '69', '季度会员价格（元）', 'VIP_PLAN'),
  ('vip.price.3', '199', '年度会员价格（元）', 'VIP_PLAN'),
  ('ai.limit.daily.0', '15', '普通用户每日 AI 限额', 'AI_LIMIT'),
  ('ai.limit.daily.1', '100', '月度会员每日 AI 限额', 'AI_LIMIT'),
  ('ai.limit.daily.2', '120', '季度会员每日 AI 限额', 'AI_LIMIT'),
  ('ai.limit.daily.3', '150', '年度会员每日 AI 限额', 'AI_LIMIT'),
  ('ai.tutor.limit.daily.0', '20', '普通用户每日 AI 助教限额', 'AI_LIMIT'),
  ('ai.tutor.limit.daily.1', '100', '月度会员每日 AI 助教限额', 'AI_LIMIT'),
  ('ai.tutor.limit.daily.2', '150', '季度会员每日 AI 助教限额', 'AI_LIMIT'),
  ('ai.tutor.limit.daily.3', '200', '年度会员每日 AI 助教限额', 'AI_LIMIT')
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`), `update_time` = NOW();

-- 旧版开通/过期逻辑会把默认额度写进账户（5/50/100/200 点，200/400/800/1500 次），
-- 导致系统设置改了也不生效。把这些“旧默认值”清空，让它们跟随系统设置；
-- 管理员手动设置过的其他数值保持不变。
UPDATE `user` SET `daily_ai_quota` = NULL WHERE `daily_ai_quota` IN (5, 50, 100, 200);
UPDATE `user` SET `daily_tutor_quota` = NULL WHERE `daily_tutor_quota` IN (200, 400, 800, 1500);
