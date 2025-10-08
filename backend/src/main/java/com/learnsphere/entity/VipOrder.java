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
    private Integer duration; // 持续时间（月）
    private BigDecimal amount;
    private String status; // PAID, PENDING
    private LocalDateTime createTime;
    private LocalDateTime payTime;
}
