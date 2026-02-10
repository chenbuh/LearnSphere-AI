package com.learnsphere.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

/**
 * 用户完整档案 DTO
 * 包含用户画像、学习轨迹、AI使用分析、活跃度分析、价值分层等
 */
@Data
public class UserProfileDTO {

    // 基础用户信息
    private UserBasicInfo user;

    // 用户标签 (自动分类)
    private String userTag; // "高潜力用户", "活跃用户", "流失风险", "新用户", "沉睡用户"

    // 流失风险等级
    private String riskLevel; // "LOW", "MEDIUM", "HIGH"

    // 基础统计
    private Statistics statistics;

    // 学习轨迹
    private LearningTrack learningTrack;

    // AI 使用画像
    private AIUsageProfile aiUsageProfile;

    // 活跃度热力图数据
    private ActivityHeatmap activityHeatmap;

    // 价值分层信息
    private ValueSegmentation valueSegmentation;

    // 技能评分
    private Map<String, Integer> skillScores;

    // 使用趋势 (7天)
    private List<TrendData> usageTrend;

    // VIP 信息
    private Boolean vip;
    private String vipExpireTime;

    @Data
    public static class UserBasicInfo {
        private Long id;
        private String username;
        private String nickname;
        private String email;
        private String avatar;
        private String createTime;
        private String updateTime;
        private String lastLoginTime;
    }

    @Data
    public static class Statistics {
        private Integer totalWordsLearned;
        private Integer totalAiUsage;
        private Integer totalCheckins;
        private Integer studyStreak;
    }

    @Data
    public static class LearningTrack {
        private List<RecentActivity> recentActivities;
        private Map<String, Integer> subjectPreference; // 学科偏好百分比
    }

    @Data
    public static class RecentActivity {
        private String type; // vocabulary, grammar, reading, etc.
        private String title;
        private String time;
        private Integer score;
    }

    @Data
    public static class AIUsageProfile {
        private List<PreferredFeature> preferredFeatures;
        private Map<String, Integer> topicDistribution;
    }

    @Data
    public static class PreferredFeature {
        private String name; // "AI批改作文", "AI对话练习"
        private Integer usage; // 使用次数
        private Integer percentage; // 占比
    }

    @Data
    public static class ActivityHeatmap {
        private List<HourlyData> hourlyDistribution;
        private List<WeeklyData> weeklyDistribution;
    }

    @Data
    public static class HourlyData {
        private Integer hour; // 0-23
        private Integer count;
    }

    @Data
    public static class WeeklyData {
        private String day; // Monday, Tuesday, etc.
        private Integer count;
    }

    @Data
    public static class ValueSegmentation {
        private String segment; // "高潜力用户", "活跃用户", "流失风险"
        private Integer ltv; // Lifetime Value (预估)
        private Integer engagementScore; // 参与度评分 0-100
        private Integer churnRisk; // 流失风险评分 0-100
        private List<String> reasons; // 分层原因
    }

    @Data
    public static class TrendData {
        private String date;
        private Integer value;
    }
}
