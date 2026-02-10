package com.learnsphere.dto;

import lombok.Data;
import java.util.List;

/**
 * 批量赠送VIP DTO
 */
@Data
public class BatchVipDTO {
    private List<Long> userIds;
    private Integer vipLevel; // 1, 2, 3
    private Integer duration; // 天数
    private Integer dailyQuota; // 每日AI配额
}
