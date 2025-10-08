package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.learnsphere.entity.VocabularyMastery;
import com.learnsphere.mapper.VocabularyMasteryMapper;
import com.learnsphere.service.IVocabularyMasteryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 词汇掌握度服务实现
 * 
 * 核心功能：
 * 1. 记录学习结果
 * 2. 计算下次复习时间（艾宾浩斯遗忘曲线）
 * 3. 更新掌握等级
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VocabularyMasteryServiceImpl implements IVocabularyMasteryService {

    private final VocabularyMasteryMapper masteryMapper;

    /**
     * 艾宾浩斯遗忘曲线间隔（天）
     * 答对后的复习间隔
     */
    private static final int[] REVIEW_INTERVALS = {
            1, // 第1次：1天后
            2, // 第2次：2天后
            4, // 第3次：4天后
            7, // 第4次：7天后
            15, // 第5次：15天后
            30 // 第6次及以后：30天后
    };

    @Override
    @Transactional
    public void recordReview(Long userId, Long vocabularyId, boolean isCorrect) {
        log.info("Recording review: userId={}, vocabularyId={}, correct={}", userId, vocabularyId, isCorrect);

        // 查询或创建掌握记录
        VocabularyMastery mastery = getOrCreateMastery(userId, vocabularyId);

        // 更新统计
        mastery.setReviewCount(mastery.getReviewCount() + 1);
        if (isCorrect) {
            mastery.setCorrectCount(mastery.getCorrectCount() + 1);
        } else {
            mastery.setWrongCount(mastery.getWrongCount() + 1);
        }

        // 更新掌握等级
        updateMasteryLevel(mastery, isCorrect);

        // 计算下次复习时间
        LocalDateTime nextReview = calculateNextReviewTime(mastery, isCorrect);
        mastery.setNextReviewTime(nextReview);
        mastery.setLastReviewTime(LocalDateTime.now());

        masteryMapper.updateById(mastery);

        log.info("Mastery updated: level={}, nextReview={}", mastery.getMasteryLevel(), nextReview);
    }

    @Override
    public List<Map<String, Object>> getReviewList(Long userId, Integer limit) {
        return masteryMapper.getReviewList(userId, limit);
    }

    @Override
    public Map<String, Object> getMasteryStats(Long userId) {
        return masteryMapper.getMasteryStats(userId);
    }

    @Override
    @Transactional
    public void toggleFavorite(Long userId, Long vocabularyId, boolean favorite) {
        VocabularyMastery mastery = getOrCreateMastery(userId, vocabularyId);
        mastery.setIsFavorite(favorite);
        masteryMapper.updateById(mastery);
    }

    @Override
    @Transactional
    public void addNotes(Long userId, Long vocabularyId, String notes) {
        VocabularyMastery mastery = getOrCreateMastery(userId, vocabularyId);
        mastery.setNotes(notes);
        masteryMapper.updateById(mastery);
    }

    @Override
    public VocabularyMastery getMasteryDetail(Long userId, Long vocabularyId) {
        return getOrCreateMastery(userId, vocabularyId);
    }

    /**
     * 获取或创建掌握记录
     */
    private VocabularyMastery getOrCreateMastery(Long userId, Long vocabularyId) {
        LambdaQueryWrapper<VocabularyMastery> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(VocabularyMastery::getUserId, userId)
                .eq(VocabularyMastery::getVocabularyId, vocabularyId);

        VocabularyMastery mastery = masteryMapper.selectOne(wrapper);

        if (mastery == null) {
            mastery = new VocabularyMastery();
            mastery.setUserId(userId);
            mastery.setVocabularyId(vocabularyId);
            mastery.setMasteryLevel(0);
            mastery.setReviewCount(0);
            mastery.setCorrectCount(0);
            mastery.setWrongCount(0);
            mastery.setIsFavorite(false);
            mastery.setFirstLearnedTime(LocalDateTime.now());
            mastery.setNextReviewTime(LocalDateTime.now());
            masteryMapper.insert(mastery);
        }

        return mastery;
    }

    /**
     * 更新掌握等级
     * 基于连续答对/答错次数动态调整
     */
    private void updateMasteryLevel(VocabularyMastery mastery, boolean isCorrect) {
        int currentLevel = mastery.getMasteryLevel();
        int reviewCount = mastery.getReviewCount();
        double correctRate = mastery.getMasteryRate();

        if (isCorrect) {
            // 答对：提升等级
            if (correctRate >= 90 && reviewCount >= 5) {
                currentLevel = Math.min(5, currentLevel + 1);
            } else if (correctRate >= 70 && reviewCount >= 3) {
                currentLevel = Math.min(4, currentLevel + 1);
            } else if (reviewCount >= 2) {
                currentLevel = Math.max(currentLevel, 1);
            }
        } else {
            // 答错：降低等级
            if (correctRate < 50 && reviewCount >= 3) {
                currentLevel = Math.max(0, currentLevel - 2);
            } else {
                currentLevel = Math.max(0, currentLevel - 1);
            }
        }

        mastery.setMasteryLevel(currentLevel);
    }

    /**
     * 计算下次复习时间（艾宾浩斯遗忘曲线）
     */
    private LocalDateTime calculateNextReviewTime(VocabularyMastery mastery, boolean isCorrect) {
        if (!isCorrect) {
            // 答错：明天就复习
            return LocalDateTime.now().plusDays(1);
        }

        // 答对：根据复习次数决定间隔
        int reviewCount = mastery.getReviewCount();
        int intervalIndex = Math.min(reviewCount - 1, REVIEW_INTERVALS.length - 1);
        int days = REVIEW_INTERVALS[Math.max(0, intervalIndex)];

        // 掌握程度越高，间隔越长
        if (mastery.getMasteryLevel() >= 5) {
            days = 30; // 完全掌握：30天后复习
        } else if (mastery.getMasteryLevel() >= 3) {
            days = Math.min(days, 15); // 熟悉：最多15天
        }

        return LocalDateTime.now().plusDays(days);
    }
}
