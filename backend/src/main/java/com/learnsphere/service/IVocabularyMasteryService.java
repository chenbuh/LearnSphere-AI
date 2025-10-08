package com.learnsphere.service;

import com.learnsphere.entity.VocabularyMastery;

import java.util.List;
import java.util.Map;

/**
 * 词汇掌握度服务接口
 */
public interface IVocabularyMasteryService {

    /**
     * 记录学习结果
     * 
     * @param userId       用户ID
     * @param vocabularyId 词汇ID
     * @param isCorrect    是否答对
     */
    void recordReview(Long userId, Long vocabularyId, boolean isCorrect);

    /**
     * 获取需要复习的单词列表
     * 
     * @param userId 用户ID
     * @param limit  数量限制
     * @return 单词列表
     */
    List<Map<String, Object>> getReviewList(Long userId, Integer limit);

    /**
     * 获取用户词汇掌握统计
     * 
     * @param userId 用户ID
     * @return 统计数据
     */
    Map<String, Object> getMasteryStats(Long userId);

    /**
     * 收藏/取消收藏单词
     * 
     * @param userId       用户ID
     * @param vocabularyId 词汇ID
     * @param favorite     是否收藏
     */
    void toggleFavorite(Long userId, Long vocabularyId, boolean favorite);

    /**
     * 添加笔记
     * 
     * @param userId       用户ID
     * @param vocabularyId 词汇ID
     * @param notes        笔记内容
     */
    void addNotes(Long userId, Long vocabularyId, String notes);

    /**
     * 获取单词掌握详情
     * 
     * @param userId       用户ID
     * @param vocabularyId 词汇ID
     * @return 掌握详情
     */
    VocabularyMastery getMasteryDetail(Long userId, Long vocabularyId);
}
