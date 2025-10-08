package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.Vocabulary;
import com.learnsphere.exception.BusinessException;
import com.learnsphere.mapper.VocabularyMapper;

import com.learnsphere.service.IVocabularyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 词汇服务
 */
@Slf4j
@Service
public class VocabularyServiceImpl extends ServiceImpl<VocabularyMapper, Vocabulary> implements IVocabularyService {

    @Override
    public Page<Vocabulary> getVocabularyList(Integer page, Integer pageSize, String examType, Integer difficulty,
            String keyword) {
        Page<Vocabulary> pageParam = new Page<>(page, pageSize);
        LambdaQueryWrapper<Vocabulary> wrapper = new LambdaQueryWrapper<>();

        // 考试类型筛选
        if (examType != null && !examType.isEmpty()) {
            wrapper.eq(Vocabulary::getExamType, examType);
        }

        // 难度筛选
        if (difficulty != null) {
            wrapper.eq(Vocabulary::getDifficulty, difficulty);
        }

        // 关键词搜索
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Vocabulary::getWord, keyword)
                    .or().like(Vocabulary::getTranslation, keyword));
        }

        // 按词频降序排序
        wrapper.orderByDesc(Vocabulary::getFrequency);

        return this.page(pageParam, wrapper);
    }

    @Override
    public Page<Vocabulary> getDailyWords(String examType, Integer count) {
        Page<Vocabulary> pageParam = new Page<>(1, count);
        LambdaQueryWrapper<Vocabulary> wrapper = new LambdaQueryWrapper<>();

        if (examType != null && !examType.isEmpty()) {
            wrapper.eq(Vocabulary::getExamType, examType);
        }

        // 按频率降序排序获取高频词
        wrapper.orderByDesc(Vocabulary::getFrequency);

        return this.page(pageParam, wrapper);
    }

    @Override
    public Vocabulary getVocabularyDetail(Long id) {
        Vocabulary vocabulary = this.getById(id);
        if (vocabulary == null) {
            throw new BusinessException("词汇不存在");
        }
        return vocabulary;
    }
}
