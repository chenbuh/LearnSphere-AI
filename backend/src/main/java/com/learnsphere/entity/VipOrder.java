package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("vip_order")
public class VipOrder {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Integer vipLevel; // 1-月度, 2-季度, 3-年度
    private BigDecimal amount;
    private String status; // PAID, PENDING, MANUAL_GRANTED, REFUNDED
    /** 商户订单号（易支付 out_trade_no） */
    private String outTradeNo;
    /** 易支付平台订单号 */
    private String tradeNo;
    /** 支付方式 alipay / wxpay */
    private String payType;
    private LocalDateTime payTime;
    /** NEW 新开 / RENEW 续费 / UPGRADE 升级补差价 */
    private String orderType;
    /** 升级时剩余时长折算的抵扣金额 */
    private BigDecimal creditAmount;
    private LocalDateTime createTime;
}
