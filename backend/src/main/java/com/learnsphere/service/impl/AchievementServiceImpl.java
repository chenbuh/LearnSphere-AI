package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.learnsphere.entity.Achievement;
import com.learnsphere.entity.User;
import com.learnsphere.entity.UserAchievement;
import com.learnsphere.mapper.AchievementMapper;
import com.learnsphere.mapper.UserAchievementMapper;
import com.learnsphere.mapper.UserMapper;
import com.learnsphere.service.IAchievementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AchievementServiceImpl implements IAchievementService {

    private final AchievementMapper achievementMapper;
    private final UserAchievementMapper userAchievementMapper;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public List<Achievement> updateProgress(Long userId, String conditionType, int value) {
        List<Achievement> achievements = achievementMapper.selectList(
                new LambdaQueryWrapper<Achievement>().eq(Achievement::getConditionType, conditionType));

        List<Achievement> newlyUnlocked = new ArrayList<>();
        for (Achievement achv : achievements) {
            Achievement unlocked = checkAndUnlock(userId, achv, value);
            if (unlocked != null)
                newlyUnlocked.add(unlocked);
        }
        return newlyUnlocked;
    }

    @Override
    @Transactional
    public List<Achievement> incrementProgress(Long userId, String conditionType, int delta) {
        List<Achievement> achievements = achievementMapper.selectList(
                new LambdaQueryWrapper<Achievement>().eq(Achievement::getConditionType, conditionType));

        List<Achievement> newlyUnlocked = new ArrayList<>();
        for (Achievement achv : achievements) {
            UserAchievement ua = getOrCreateUserAchievement(userId, achv.getId());
            if (ua.getStatus() == 1)
                continue;

            int newValue = (ua.getCurrentValue() == null ? 0 : ua.getCurrentValue()) + delta;
            Achievement unlocked = checkAndUnlock(userId, achv, newValue, ua);
            if (unlocked != null)
                newlyUnlocked.add(unlocked);
        }
        return newlyUnlocked;
    }

    @Override
    public List<Map<String, Object>> getUserAchievements(Long userId) {
        return userAchievementMapper.selectUserAchievements(userId);
    }

    private UserAchievement getOrCreateUserAchievement(Long userId, Long achievementId) {
        UserAchievement ua = userAchievementMapper.selectOne(
                new LambdaQueryWrapper<UserAchievement>()
                        .eq(UserAchievement::getUserId, userId)
                        .eq(UserAchievement::getAchievementId, achievementId));
        if (ua == null) {
            ua = new UserAchievement();
            ua.setUserId(userId);
            ua.setAchievementId(achievementId);
            ua.setStatus(0);
            ua.setCurrentValue(0);
            ua.setCreateTime(LocalDateTime.now());
            userAchievementMapper.insert(ua);
        }
        return ua;
    }

    private Achievement checkAndUnlock(Long userId, Achievement achv, int value) {
        UserAchievement ua = getOrCreateUserAchievement(userId, achv.getId());
        return checkAndUnlock(userId, achv, value, ua);
    }

    private Achievement checkAndUnlock(Long userId, Achievement achv, int value, UserAchievement ua) {
        if (ua.getStatus() == 1)
            return null;

        ua.setCurrentValue(value);
        Achievement result = null;

        if (value >= achv.getConditionValue()) {
            ua.setStatus(1);
            ua.setUnlockedTime(LocalDateTime.now());
            result = achv;

            if (achv.getRewardPoints() != null && achv.getRewardPoints() > 0) {
                User user = userMapper.selectById(userId);
                if (user != null) {
                    user.setPoints((user.getPoints() == null ? 0 : user.getPoints()) + achv.getRewardPoints());
                    userMapper.updateById(user);
                }
            }
        }

        ua.setUpdateTime(LocalDateTime.now());
        userAchievementMapper.updateById(ua);
        return result;
    }
}
