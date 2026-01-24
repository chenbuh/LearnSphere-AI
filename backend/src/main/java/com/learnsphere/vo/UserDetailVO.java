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

    // Behavioral Profiling (New)
    private java.util.Map<String, Integer> skillScores; // Radar chart: Listening, Speaking, Reading, Writing, Grammar,
                                                        // Vocab
    private java.util.List<java.util.Map<String, Object>> usageTrend; // Last 7 days AI consumption
    private String riskLevel; // LOW, MEDIUM, HIGH
    private String userTag; // e.g. "学霸", "潜水员", "AI狂热者"
}
