package com.learnsphere.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.learnsphere.dto.LearningRecordDTO;
import com.learnsphere.entity.LearningRecord;

import java.util.Map;

/**
 * 学习记录服务接口
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
public interface ILearningRecordService extends IService<LearningRecord> {

    /**
     * 创建学习记录
     * 
     * @return 获得的积分
     */
    Integer createRecord(Long userId, LearningRecordDTO dto);

    /**
     * 获取用户学习记录列表
     */
    Page<LearningRecord> getUserRecords(Long userId, Integer page, Integer pageSize, String contentType,
            Integer isCorrect);

    /**
     * 获取用户学习统计
     */
    Map<String, Object> getUserStatistics(Long userId);

    /**
     * 获取趋势统计
     * 
     * @param userId 用户ID
     * @param days   天数 (7 or 30)
     */
    Map<String, Object> getTrendStatistics(Long userId, Integer days);

    /**
     * 获取用户需要复习的内容
     */
    Page<LearningRecord> getReviewList(Long userId, Integer page, Integer pageSize);
}
