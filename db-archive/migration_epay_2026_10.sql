-- 易支付：vip_order 增加商户订单号 / 平台订单号 / 支付方式 / 支付时间 / 订单类型 / 升级抵扣金额
-- 后端启动时 DatabaseInitializer 也会自动补齐，手动执行重复列会报错，可忽略
ALTER TABLE `vip_order`
  ADD COLUMN `out_trade_no` VARCHAR(64) NULL COMMENT '商户订单号' AFTER `status`,
  ADD COLUMN `trade_no` VARCHAR(64) NULL COMMENT '易支付平台订单号' AFTER `out_trade_no`,
  ADD COLUMN `pay_type` VARCHAR(20) NULL COMMENT 'alipay / wxpay' AFTER `trade_no`,
  ADD COLUMN `pay_time` DATETIME NULL AFTER `pay_type`,
  ADD COLUMN `order_type` VARCHAR(20) NULL COMMENT 'NEW / RENEW / UPGRADE' AFTER `pay_time`,
  ADD COLUMN `credit_amount` DECIMAL(10,2) NULL COMMENT '升级抵扣金额' AFTER `order_type`,
  ADD UNIQUE INDEX `uk_out_trade_no` (`out_trade_no`);
