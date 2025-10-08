package com.learnsphere.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.learnsphere.entity.Vocabulary;

/**
 * 词汇服务接口
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
public interface IVocabularyService extends IService<Vocabulary> {

    /**
     * 分页查询词汇列表
     * 
     * @param page       页码
     * @param pageSize   每页数量
     * @param examType   考试类型
     * @param difficulty 难度等级
     * @param keyword    关键词
     * @return 词汇分页数据
     */
    Page<Vocabulary> getVocabularyList(Integer page, Integer pageSize, String examType, Integer difficulty,
            String keyword);

    /**
     * 获取每日单词
     * 
     * @param examType 考试类型
     * @param count    数量
     * @return 每日单词列表
     */
    Page<Vocabulary> getDailyWords(String examType, Integer count);

    /**
     * 根据ID获取词汇详情
     * 
     * @param id 词汇ID
     * @return 词汇详情
     */
    /**
     * 根据ID获取词汇详情
     * 
     * @param id 词汇ID
     * @return 词汇详情
     */
    Vocabulary getVocabularyDetail(Long id);

    /**
     * AI 生成词汇详细信息
     * 
     * @param word 单词
     * @return 词汇详情对象
     */
    Vocabulary generateVocabularyDetails(String word);
}
