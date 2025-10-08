package com.learnsphere.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.dto.LearningRecordDTO;
import com.learnsphere.entity.LearningRecord;
import com.learnsphere.entity.User;
import com.learnsphere.mapper.LearningRecordMapper;
import com.learnsphere.mapper.UserMapper;
import com.learnsphere.service.IAchievementService;
import com.learnsphere.service.ICheckinService;
import com.learnsphere.service.ILearningRecordService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 学习记录服务实现
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Slf4j
@Service
public class LearningRecordServiceImpl extends ServiceImpl<LearningRecordMapper, LearningRecord>
        implements ILearningRecordService {

    private final ICheckinService checkinService;
    private final UserMapper userMapper;
    private final IAchievementService achievementService;

    public LearningRecordServiceImpl(ICheckinService checkinService, UserMapper userMapper,
            IAchievementService achievementService) {
        this.checkinService = checkinService;
        this.userMapper = userMapper;
        this.achievementService = achievementService;
    }

    @Override
    public Integer createRecord(Long userId, LearningRecordDTO dto) {
        LearningRecord record = new LearningRecord();
        BeanUtil.copyProperties(dto, record);
        record.setUserId(userId);
        record.setReviewCount(0);
        record.setLastReviewTime(LocalDateTime.now());

        // 根据掌握程度计算下次复习时间
        record.setNextReviewTime(calculateNextReviewTime(dto.getMasteryLevel()));

        this.save(record);

        // 自动打卡
        checkinService.checkin(userId);

        // 计算和更新积分
        int pointsEarned = 10; // 基础分
        if (dto.getMasteryLevel() != null && dto.getMasteryLevel() >= 3) {
            pointsEarned += 10; // 掌握/正确额外加分
        }

        try {
            User user = userMapper.selectById(userId);
            if (user != null) {
                int currentPoints = user.getPoints() == null ? 0 : user.getPoints();
                user.setPoints(currentPoints + pointsEarned);
                userMapper.updateById(user);
            }

            // Check Achievements
            // 1. First Blood & Total Records
            achievementService.incrementProgress(userId, "total_records", 1);

            // 2. Vocab Master
            if ("vocabulary".equals(dto.getContentType()) && dto.getIsCorrect() == 1) {
                achievementService.incrementProgress(userId, "vocab_count", 1);
            }

            // 3. Perfect Score
            if (dto.getScore() != null && dto.getScore() >= 100) {
                achievementService.incrementProgress(userId, "perfect_score", 1);
            }

        } catch (Exception e) {
            // 积分更新失败不影响记录保存，仅记录日志
            log.error("Failed to update user points or achievements for user: " + userId, e);
        }

        return pointsEarned;
    }

    @Override
    public Page<LearningRecord> getUserRecords(Long userId, Integer page, Integer pageSize, String contentType,
            Integer isCorrect) {
        Page<LearningRecord> pageParam = new Page<>(page, pageSize);
        LambdaQueryWrapper<LearningRecord> wrapper = new LambdaQueryWrapper<>();

        wrapper.eq(LearningRecord::getUserId, userId);

        if (contentType != null && !contentType.isEmpty()) {
            wrapper.eq(LearningRecord::getContentType, contentType);
        }

        if (isCorrect != null) {
            wrapper.eq(LearningRecord::getIsCorrect, isCorrect);
        }

        wrapper.orderByDesc(LearningRecord::getCreateTime);

        return this.page(pageParam, wrapper);
    }

    @Override
    public Map<String, Object> getUserStatistics(Long userId) {
        Map<String, Object> statistics = baseMapper.getUserStatistics(userId);
        List<Map<String, Object>> byType = baseMapper.getUserStatisticsByType(userId);

        Map<String, Object> result = new HashMap<>();
        if (statistics != null) {
            result.put("overall", statistics);
        }
        if (byType != null) {
            result.put("byType", byType);
        }

        // 添加连续打卡天数
        Integer consecutiveDays = checkinService.getConsecutiveDays(userId);
        result.put("consecutiveDays", consecutiveDays);

        // 默认返回7天趋势
        Map<String, Object> trends = getTrendStatistics(userId, 7);
        result.putAll(trends);

        // 计算增长数据
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> weeklyStatsList = (List<Map<String, Object>>) trends.get("weeklyStats");
        long growthTime = 0;
        if (weeklyStatsList != null) {
            for (Map<String, Object> day : weeklyStatsList) {
                Object timeObj = day.get("timeSpent");
                if (timeObj instanceof Number) {
                    growthTime += ((Number) timeObj).longValue();
                }
            }
        }
        result.put("growthTime", growthTime);

        Integer growthVocab = baseMapper.getNewVocabCount(userId, java.time.LocalDate.now().minusDays(6).toString());
        result.put("growthVocab", growthVocab != null ? growthVocab : 0);

        // Pre-calculate ability stats for AI to ensure all 6 dimensions are covered
        Map<String, Map<String, Object>> abilityStats = new HashMap<>();
        String[] requiredAbilities = { "vocabulary", "grammar", "reading", "listening", "writing", "speaking" };

        // Initialize with defaults
        for (String ability : requiredAbilities) {
            Map<String, Object> defaultStat = new HashMap<>();
            defaultStat.put("count", 0);
            defaultStat.put("avgScore", 0.0);
            defaultStat.put("mastery", 0); // 0-5 scale estimate
            abilityStats.put(ability, defaultStat);
        }

        // Fill with actual data
        if (byType != null) {
            for (Map<String, Object> typeStat : byType) {
                String type = (String) typeStat.get("content_type");
                if (type != null && abilityStats.containsKey(type)) {
                    abilityStats.get(type).put("count", typeStat.get("count"));
                    abilityStats.get(type).put("avgScore", typeStat.get("avgScore"));
                    // Estimate mastery
                    Number avgScore = (Number) typeStat.get("avgScore");
                    abilityStats.get(type).put("mastery", avgScore.doubleValue() / 20.0); // Rough estimate
                }
            }
        }

        // Special handling for Speaking (inferred from Listening and Reading if
        // missing)
        // This helps AI generate a non-zero estimation if actual data is missing
        Map<String, Object> speaking = abilityStats.get("speaking");
        if (((Number) speaking.get("count")).intValue() == 0) {
            Map<String, Object> listening = abilityStats.get("listening");
            Map<String, Object> reading = abilityStats.get("reading");
            double inferredScore = (((Number) listening.get("avgScore")).doubleValue() * 0.6
                    + ((Number) reading.get("avgScore")).doubleValue() * 0.4) * 0.8; // Speaking usually lower
            speaking.put("avgScore", inferredScore);
            speaking.put("inferred", true);
        }

        result.put("abilityStats", abilityStats);

        return result;
    }

    @Override
    public Map<String, Object> getTrendStatistics(Long userId, Integer days) {
        if (days == null || days <= 0)
            days = 7;
        String startDate = java.time.LocalDate.now().minusDays(days - 1).toString();

        List<Map<String, Object>> weeklyStats = baseMapper.getLearningTimeStats(userId, startDate);
        List<Map<String, Object>> trendStats = baseMapper.getAccuracyTrendStats(userId, startDate);

        Map<String, Object> result = new HashMap<>();
        result.put("weeklyStats", weeklyStats);
        result.put("trendStats", trendStats);
        return result;
    }

    @Override
    public Page<LearningRecord> getReviewList(Long userId, Integer page, Integer pageSize) {
        Page<LearningRecord> pageParam = new Page<>(page, pageSize);
        LambdaQueryWrapper<LearningRecord> wrapper = new LambdaQueryWrapper<>();

        wrapper.eq(LearningRecord::getUserId, userId);
        wrapper.le(LearningRecord::getNextReviewTime, LocalDateTime.now());
        wrapper.orderByAsc(LearningRecord::getNextReviewTime);

        return this.page(pageParam, wrapper);
    }

    /**
     * 根据掌握程度计算下次复习时间
     */
    private LocalDateTime calculateNextReviewTime(Integer masteryLevel) {
        if (masteryLevel == null) {
            masteryLevel = 0;
        }

        // 根据艾宾浩斯遗忘曲线设置复习间隔
        int[] intervals = { 1, 2, 4, 7, 15, 30 }; // 天数
        int days = intervals[Math.min(masteryLevel, intervals.length - 1)];

        return LocalDateTime.now().plusDays(days);
    }
}
