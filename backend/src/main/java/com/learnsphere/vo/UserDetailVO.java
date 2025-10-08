package com.learnsphere.vo;

import com.learnsphere.entity.User;
import lombok.Data;

@Data
public class UserDetailVO {
    private User user;

    // VIP Info
    private boolean isVip;
    private String vipExpireTime;

    // Stats
    private long totalWordsLearned;
    private long totalCheckins;
    private long totalAiUsage; // AI usage count
}
