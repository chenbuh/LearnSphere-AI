package com.learnsphere.service;

import com.learnsphere.entity.Achievement;
import java.util.List;
import java.util.Map;

public interface IAchievementService {
    /**
     * Set/Update achievement progress
     * 
     * @param userId        user id
     * @param conditionType condition type code
     * @param value         current value (absolute value, e.g. total streak)
     * @return List of newly unlocked achievements
     */
    List<Achievement> updateProgress(Long userId, String conditionType, int value);

    /**
     * Increment achievement progress (cumulative)
     * 
     * @param userId        user id
     * @param conditionType condition type code
     * @param delta         increment amount
     * @return List of newly unlocked achievements
     */
    List<Achievement> incrementProgress(Long userId, String conditionType, int delta);

    /**
     * Get all achievements with user status
     */
    List<Map<String, Object>> getUserAchievements(Long userId);
}
