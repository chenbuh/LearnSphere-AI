package com.learnsphere.service.impl;

import com.learnsphere.entity.User;
import com.learnsphere.mapper.UserMapper;
import com.learnsphere.service.IAchievementService;
import com.learnsphere.service.ICheckinService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * 打卡服务实现
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CheckinServiceImpl implements ICheckinService {

    private final UserMapper userMapper;
    private final IAchievementService achievementService;

    @Override
    @Transactional
    public void checkin(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            log.warn("用户不存在: {}", userId);
            return;
        }

        LocalDate today = LocalDate.now();
        LocalDate lastCheckin = user.getLastCheckinDate();

        // 如果今天已经打卡，不重复处理
        if (lastCheckin != null && lastCheckin.equals(today)) {
            return;
        }

        // 计算连续天数
        int consecutiveDays = user.getConsecutiveDays() != null ? user.getConsecutiveDays() : 0;
        int totalDays = user.getTotalCheckinDays() != null ? user.getTotalCheckinDays() : 0;

        if (lastCheckin == null) {
            // 第一次打卡
            consecutiveDays = 1;
        } else if (lastCheckin.equals(today.minusDays(1))) {
            // 连续打卡
            consecutiveDays++;
        } else {
            // 中断了，重新开始
            consecutiveDays = 1;
        }

        // 更新用户打卡信息
        user.setConsecutiveDays(consecutiveDays);
        user.setLastCheckinDate(today);
        user.setTotalCheckinDays(totalDays + 1);

        userMapper.updateById(user);
        log.info("用户 {} 打卡成功，连续 {} 天", userId, consecutiveDays);

        // Achievement checks
        try {
            // Update streak
            achievementService.updateProgress(userId, "checkin_streak", consecutiveDays);

            // Check early bird (before 8 AM)
            if (java.time.LocalTime.now().getHour() < 8) {
                achievementService.incrementProgress(userId, "checkin_time", 1);
            }
        } catch (Exception e) {
            log.error("Failed to update checkin achievements", e);
        }
    }

    @Override
    public Integer getConsecutiveDays(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            return 0;
        }

        LocalDate today = LocalDate.now();
        LocalDate lastCheckin = user.getLastCheckinDate();

        // 如果最后打卡日期是今天或昨天，返回连续天数
        if (lastCheckin != null &&
                (lastCheckin.equals(today) || lastCheckin.equals(today.minusDays(1)))) {
            return user.getConsecutiveDays() != null ? user.getConsecutiveDays() : 0;
        }

        // 否则连续天数已中断
        return 0;
    }
}
