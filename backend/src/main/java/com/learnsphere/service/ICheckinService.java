package com.learnsphere.service;

/**
 * 打卡服务接口
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
public interface ICheckinService {

    /**
     * 用户打卡（创建学习记录时自动调用）
     * 
     * @param userId 用户ID
     */
    void checkin(Long userId);

    /**
     * 获取用户连续打卡天数
     * 
     * @param userId 用户ID
     * @return 连续打卡天数
     */
    Integer getConsecutiveDays(Long userId);
}
