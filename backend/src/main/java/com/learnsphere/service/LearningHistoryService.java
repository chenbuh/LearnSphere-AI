package com.learnsphere.service;

import com.learnsphere.entity.LearningRecord;

import java.util.Map;

/**
 * 学习历史服务接口
 */
public interface LearningHistoryService {

    /**
     * 获取答题历史
     * 
     * @param module 模块类型
     * @param page   页码
     * @param size   每页数量
     * @return 分页数据
     */
    Map<String, Object> getAnswerHistory(String module, int page, int size);

    /**
     * 保存答题记录
     * 
     * @param record 学习记录
     */
    void saveAnswerRecord(LearningRecord record);

    /**
     * 获取学习统计
     * 
     * @return 统计数据
     */
    Map<String, Object> getLearningStats();
}
