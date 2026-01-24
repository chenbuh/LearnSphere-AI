package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.learnsphere.entity.LearningRecord;
import com.learnsphere.entity.User;
import com.learnsphere.entity.Vocabulary;
import com.learnsphere.mapper.LearningRecordMapper;
import com.learnsphere.mapper.UserMapper;
import com.learnsphere.mapper.VocabularyMapper;
import com.learnsphere.service.IRecommendationService;
import com.learnsphere.vo.RecommendationVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AI推荐服务实现
 * 基于用户学习记录、掌握程度和遗忘曲线的智能推荐算法
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationServiceImpl implements IRecommendationService {

    private final VocabularyMapper vocabularyMapper;
    private final LearningRecordMapper learningRecordMapper;
    private final UserMapper userMapper;
    private final com.learnsphere.service.IAIGenerationService aiGenerationService;
    private final com.learnsphere.service.ILearningRecordService learningRecordService;

    @Override
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getAIRecommendations(Long userId) {
        log.info("获取用户 {} 的 AI 智能建议", userId);

        // 1. 尝试从最近的完整分析报告中提取
        Map<String, Object> lastAnalysis = aiGenerationService.getLastAnalysis(userId);
        if (lastAnalysis != null && lastAnalysis.containsKey("recommendations")) {
            return (List<Map<String, Object>>) lastAnalysis.get("recommendations");
        }

        // 2. 如果没有分析报告，则实时调用 LLM 生成建议
        try {
            Map<String, Object> statistics = learningRecordService.getUserStatistics(userId);
            return aiGenerationService.generateAIRecommendations(userId, statistics);
        } catch (Exception e) {
            log.error("尝试实时获取 AI 建议失败", e);
            return Collections.emptyList();
        }
    }

    @Override
    public List<RecommendationVO> getPersonalizedRecommendations(Long userId, Integer limit) {
        log.info("获取用户 {} 的个性化推荐，数量: {}", userId, limit);

        try {
            // 获取用户信息
            User user = userMapper.selectById(userId);
            if (user == null) {
                log.warn("用户 {} 不存在", userId);
                return Collections.emptyList();
            }

            // 获取用户学习记录
            List<LearningRecord> learningRecords = learningRecordMapper.selectList(
                    new LambdaQueryWrapper<LearningRecord>()
                            .eq(LearningRecord::getUserId, userId)
                            .eq(LearningRecord::getContentType, "vocabulary"));

            // 获取已学习的词汇ID
            Set<Long> learnedVocabIds = new HashSet<>();
            if (learningRecords != null && !learningRecords.isEmpty()) {
                learnedVocabIds = learningRecords.stream()
                        .filter(r -> r.getContentId() != null)
                        .map(LearningRecord::getContentId)
                        .collect(Collectors.toSet());
            }

            // 计算用户平均掌握程度
            double avgMastery = 2.0; // 默认中等水平
            if (learningRecords != null && !learningRecords.isEmpty()) {
                avgMastery = learningRecords.stream()
                        .filter(r -> r.getMasteryLevel() != null)
                        .mapToInt(LearningRecord::getMasteryLevel)
                        .average()
                        .orElse(2.0);
            }

            // 推荐难度：基于用户当前水平
            int recommendedDifficulty = calculateRecommendedDifficulty(avgMastery);

            // 获取候选词汇
            LambdaQueryWrapper<Vocabulary> queryWrapper = new LambdaQueryWrapper<Vocabulary>()
                    .ge(Vocabulary::getDifficulty, Math.max(1, recommendedDifficulty - 1))
                    .le(Vocabulary::getDifficulty, Math.min(5, recommendedDifficulty + 1))
                    .orderByDesc(Vocabulary::getFrequency);

            // 如果用户有考试类型偏好，优先推荐相关词汇
            if (user.getExamType() != null && !user.getExamType().isEmpty()) {
                queryWrapper.eq(Vocabulary::getExamType, user.getExamType());
            }

            List<Vocabulary> candidates = vocabularyMapper.selectList(queryWrapper);

            if (candidates == null || candidates.isEmpty()) {
                log.warn("没有找到符合条件的词汇");
                return Collections.emptyList();
            }

            // 过滤已学习的词汇
            Set<Long> finalLearnedVocabIds = learnedVocabIds;
            candidates = candidates.stream()
                    .filter(v -> v != null && v.getId() != null)
                    .filter(v -> !finalLearnedVocabIds.contains(v.getId()))
                    .collect(Collectors.toList());

            // 计算推荐分数并排序
            double finalAvgMastery = avgMastery;
            List<RecommendationVO> recommendations = candidates.stream()
                    .map(vocab -> buildRecommendationVO(vocab, user, finalAvgMastery))
                    .filter(Objects::nonNull)
                    .sorted(Comparator.comparingDouble(RecommendationVO::getRecommendScore).reversed())
                    .limit(limit)
                    .collect(Collectors.toList());

            log.info("为用户 {} 生成了 {} 条推荐", userId, recommendations.size());
            return recommendations;
        } catch (Exception e) {
            log.error("获取个性化推荐失败", e);
            return Collections.emptyList();
        }
    }

    @Override
    public List<RecommendationVO> getRecommendationsByDifficulty(Long userId, Integer difficulty, Integer limit) {
        log.info("获取用户 {} 难度 {} 的推荐", userId, difficulty);

        User user = userMapper.selectById(userId);
        if (user == null) {
            return Collections.emptyList();
        }

        // 获取已学习的词汇ID
        List<LearningRecord> learningRecords = learningRecordMapper.selectList(
                new LambdaQueryWrapper<LearningRecord>()
                        .eq(LearningRecord::getUserId, userId)
                        .eq(LearningRecord::getContentType, "vocabulary"));

        Set<Long> learnedVocabIds = learningRecords.stream()
                .map(LearningRecord::getContentId)
                .collect(Collectors.toSet());

        // 查询指定难度的词汇
        List<Vocabulary> vocabularies = vocabularyMapper.selectList(
                new LambdaQueryWrapper<Vocabulary>()
                        .eq(Vocabulary::getDifficulty, difficulty)
                        .orderByDesc(Vocabulary::getFrequency));

        // 过滤并转换
        return vocabularies.stream()
                .filter(v -> !learnedVocabIds.contains(v.getId()))
                .map(vocab -> buildRecommendationVO(vocab, user, difficulty.doubleValue()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public List<RecommendationVO> getReviewRecommendations(Long userId, Integer limit) {
        log.info("获取用户 {} 的复习推荐", userId);

        LocalDateTime now = LocalDateTime.now();

        // 查询需要复习的学习记录
        List<LearningRecord> reviewRecords = learningRecordMapper.selectList(
                new LambdaQueryWrapper<LearningRecord>()
                        .eq(LearningRecord::getUserId, userId)
                        .eq(LearningRecord::getContentType, "vocabulary")
                        .le(LearningRecord::getNextReviewTime, now)
                        .orderByAsc(LearningRecord::getNextReviewTime));

        if (reviewRecords.isEmpty()) {
            // 如果没有到期的，推荐掌握程度较低的
            reviewRecords = learningRecordMapper.selectList(
                    new LambdaQueryWrapper<LearningRecord>()
                            .eq(LearningRecord::getUserId, userId)
                            .eq(LearningRecord::getContentType, "vocabulary")
                            .lt(LearningRecord::getMasteryLevel, 4)
                            .orderByAsc(LearningRecord::getMasteryLevel));
        }

        // 获取词汇详情
        List<Long> vocabIds = reviewRecords.stream()
                .map(LearningRecord::getContentId)
                .limit(limit)
                .collect(Collectors.toList());

        if (vocabIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<Vocabulary> vocabularies = vocabularyMapper.selectBatchIds(vocabIds);
        Map<Long, LearningRecord> recordMap = reviewRecords.stream()
                .collect(Collectors.toMap(LearningRecord::getContentId, r -> r));

        return vocabularies.stream()
                .map(vocab -> buildReviewRecommendationVO(vocab, recordMap.get(vocab.getId())))
                .collect(Collectors.toList());
    }

    @Override
    public List<RecommendationVO> getRecommendationsByExamType(Long userId, String examType, Integer limit) {
        log.info("获取用户 {} 考试类型 {} 的推荐", userId, examType);

        // 获取已学习的词汇ID
        List<LearningRecord> learningRecords = learningRecordMapper.selectList(
                new LambdaQueryWrapper<LearningRecord>()
                        .eq(LearningRecord::getUserId, userId)
                        .eq(LearningRecord::getContentType, "vocabulary"));

        Set<Long> learnedVocabIds = learningRecords.stream()
                .map(LearningRecord::getContentId)
                .collect(Collectors.toSet());

        // 查询指定考试类型的词汇
        List<Vocabulary> vocabularies = vocabularyMapper.selectList(
                new LambdaQueryWrapper<Vocabulary>()
                        .eq(Vocabulary::getExamType, examType)
                        .orderByDesc(Vocabulary::getFrequency));

        User user = userMapper.selectById(userId);

        return vocabularies.stream()
                .filter(v -> !learnedVocabIds.contains(v.getId()))
                .map(vocab -> buildRecommendationVO(vocab, user, 3.0))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * 构建推荐VO
     */
    private RecommendationVO buildRecommendationVO(Vocabulary vocab, User user, double avgMastery) {
        try {
            RecommendationVO vo = new RecommendationVO();
            vo.setVocabularyId(vocab.getId());
            vo.setWord(vocab.getWord() != null ? vocab.getWord() : "");
            vo.setPhonetic(vocab.getPhonetic());
            vo.setDefinition(vocab.getDefinition());
            vo.setTranslation(vocab.getTranslation() != null ? vocab.getTranslation() : "");
            vo.setExample(vocab.getExample());
            vo.setExampleTranslation(vocab.getExampleTranslation());
            vo.setDifficulty(vocab.getDifficulty() != null ? vocab.getDifficulty() : 3);

            // 计算推荐分数
            double score = calculateRecommendScore(vocab, user, avgMastery);
            vo.setRecommendScore(score);

            // 生成推荐原因
            vo.setReason(generateRecommendReason(vocab, user, avgMastery));

            // 解析标签
            if (vocab.getTags() != null && !vocab.getTags().isEmpty()) {
                try {
                    String tagsStr = vocab.getTags().replace("[", "").replace("]", "").replace("\"", "").trim();
                    if (!tagsStr.isEmpty()) {
                        vo.setTags(Arrays.asList(tagsStr.split(",")));
                    } else {
                        vo.setTags(new ArrayList<>());
                    }
                } catch (Exception e) {
                    vo.setTags(new ArrayList<>());
                }
            } else {
                vo.setTags(new ArrayList<>());
            }

            // 预计学习时间（基于难度）
            int difficulty = vocab.getDifficulty() != null ? vocab.getDifficulty() : 3;
            vo.setEstimatedTime(difficulty * 3);

            return vo;
        } catch (Exception e) {
            log.error("构建推荐VO失败: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 构建复习推荐VO
     */
    private RecommendationVO buildReviewRecommendationVO(Vocabulary vocab, LearningRecord record) {
        RecommendationVO vo = new RecommendationVO();
        vo.setVocabularyId(vocab.getId());
        vo.setWord(vocab.getWord());
        vo.setPhonetic(vocab.getPhonetic());
        vo.setDefinition(vocab.getDefinition());
        vo.setTranslation(vocab.getTranslation());
        vo.setExample(vocab.getExample());
        vo.setExampleTranslation(vocab.getExampleTranslation());
        vo.setDifficulty(vocab.getDifficulty());

        // 复习优先级分数
        double score = calculateReviewScore(record);
        vo.setRecommendScore(score);

        vo.setReason(generateReviewReason(record));

        if (vocab.getTags() != null && !vocab.getTags().isEmpty()) {
            vo.setTags(Arrays.asList(vocab.getTags().replace("[", "").replace("]", "").replace("\"", "").split(",")));
        }

        vo.setEstimatedTime(5); // 复习时间较短

        return vo;
    }

    /**
     * 计算推荐分数
     */
    private double calculateRecommendScore(Vocabulary vocab, User user, double avgMastery) {
        try {
            double score = 50.0; // 基础分

            // 词频权重（30分）
            if (vocab.getFrequency() != null && vocab.getFrequency() > 0) {
                score += (vocab.getFrequency() / 100.0) * 30;
            }

            // 难度匹配度（20分）
            int recommendedDifficulty = calculateRecommendedDifficulty(avgMastery);
            int vocabDifficulty = vocab.getDifficulty() != null ? vocab.getDifficulty() : 3;
            int difficultyGap = Math.abs(vocabDifficulty - recommendedDifficulty);
            score += Math.max(0, 20 - difficultyGap * 5);

            // 考试类型匹配（20分）
            if (user != null && user.getExamType() != null && vocab.getExamType() != null
                    && user.getExamType().equals(vocab.getExamType())) {
                score += 20;
            }

            return Math.min(100, Math.max(0, score));
        } catch (Exception e) {
            log.error("计算推荐分数失败: {}", e.getMessage());
            return 50.0;
        }
    }

    /**
     * 计算复习分数
     */
    private double calculateReviewScore(LearningRecord record) {
        double score = 50.0;

        // 掌握程度越低，优先级越高
        score += (5 - record.getMasteryLevel()) * 10;

        // 复习次数越少，优先级越高
        score += Math.max(0, 30 - record.getReviewCount() * 3);

        // 距离下次复习时间越近，优先级越高
        if (record.getNextReviewTime() != null) {
            long daysOverdue = java.time.Duration.between(record.getNextReviewTime(), LocalDateTime.now()).toDays();
            score += Math.min(20, daysOverdue * 2);
        }

        return Math.min(100, score);
    }

    /**
     * 计算推荐难度
     */
    private int calculateRecommendedDifficulty(double avgMastery) {
        if (avgMastery < 1.5)
            return 1;
        if (avgMastery < 2.5)
            return 2;
        if (avgMastery < 3.5)
            return 3;
        if (avgMastery < 4.5)
            return 4;
        return 5;
    }

    /**
     * 生成推荐原因
     */
    private String generateRecommendReason(Vocabulary vocab, User user, double avgMastery) {
        List<String> reasons = new ArrayList<>();

        if (vocab.getFrequency() != null && vocab.getFrequency() > 80) {
            reasons.add("高频词汇");
        }

        int recommendedDifficulty = calculateRecommendedDifficulty(avgMastery);
        if (vocab.getDifficulty().equals(recommendedDifficulty)) {
            reasons.add("难度适中");
        }

        if (user.getExamType() != null && user.getExamType().equals(vocab.getExamType())) {
            reasons.add("符合考试类型");
        }

        return reasons.isEmpty() ? "推荐学习" : String.join("、", reasons);
    }

    /**
     * 生成复习原因
     */
    private String generateReviewReason(LearningRecord record) {
        if (record.getNextReviewTime() != null && record.getNextReviewTime().isBefore(LocalDateTime.now())) {
            long daysOverdue = java.time.Duration.between(record.getNextReviewTime(), LocalDateTime.now()).toDays();
            if (daysOverdue > 0) {
                return "已超期 " + daysOverdue + " 天，建议复习";
            }
            return "到期复习";
        }

        if (record.getMasteryLevel() < 3) {
            return "掌握程度较低，需要加强";
        }

        return "建议复习巩固";
    }
}
