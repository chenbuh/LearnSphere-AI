package com.learnsphere.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.dto.LearningRecordDTO;
import com.learnsphere.entity.LearningRecord;
import com.learnsphere.entity.User;
import com.learnsphere.mapper.LearningRecordMapper;
import com.learnsphere.mapper.UserMapper;
import com.learnsphere.service.IAchievementService;
import com.learnsphere.service.ICheckinService;
import com.learnsphere.service.ILearningRecordService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.entity.*;
import com.learnsphere.mapper.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

/**
 * 学习记录服务实现
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Slf4j
@Service
public class LearningRecordServiceImpl extends ServiceImpl<LearningRecordMapper, LearningRecord>
        implements ILearningRecordService {

    private final ICheckinService checkinService;
    private final UserMapper userMapper;
    private final IAchievementService achievementService;

    private final ListeningMaterialMapper listeningMaterialMapper;
    private final ReadingArticleMapper readingArticleMapper;
    private final GrammarExerciseMapper grammarExerciseMapper;
    private final SpeakingTopicMapper speakingTopicMapper;
    private final WritingTopicMapper writingTopicMapper;

    public LearningRecordServiceImpl(ICheckinService checkinService, UserMapper userMapper,
            IAchievementService achievementService,
            ListeningMaterialMapper listeningMaterialMapper,
            ReadingArticleMapper readingArticleMapper,
            GrammarExerciseMapper grammarExerciseMapper,
            SpeakingTopicMapper speakingTopicMapper,
            WritingTopicMapper writingTopicMapper) {
        this.checkinService = checkinService;
        this.userMapper = userMapper;
        this.achievementService = achievementService;
        this.listeningMaterialMapper = listeningMaterialMapper;
        this.readingArticleMapper = readingArticleMapper;
        this.grammarExerciseMapper = grammarExerciseMapper;
        this.speakingTopicMapper = speakingTopicMapper;
        this.writingTopicMapper = writingTopicMapper;
    }

    /**
     * 创建并保存学习记录
     * 业务流程：
     * 1. 复制属性并初始化复习次数。
     * 2. 根据用户当前的掌握等级，计算下一次需要复习的时间（基于 艾宾浩斯遗忘曲线）。
     * 3. 自动触发每日打卡。
     * 4. 计算积分：基础分(10) + 掌握/正确额外分(10)。
     * 5. 触发成就检查：首胜、总记录数、词汇达人、满分等成就。
     *
     * @param userId 关联的用户ID
     * @param dto    包含答题结果、分数、掌握程度等信息
     * @return 本次练习获得的积分数
     */
    @Override
    public Integer createRecord(Long userId, LearningRecordDTO dto) {
        LearningRecord record = new LearningRecord();
        BeanUtil.copyProperties(dto, record);
        record.setUserId(userId);
        record.setReviewCount(0);
        record.setLastReviewTime(LocalDateTime.now());

        // 根据掌握程度计算下次复习时间
        record.setNextReviewTime(calculateNextReviewTime(dto.getMasteryLevel()));

        log.info("Creating learning record: userId={}, contentType={}, contentId={}, originalContent length={}",
                userId, dto.getContentType(), dto.getContentId(),
                dto.getOriginalContent() != null ? dto.getOriginalContent().length() : 0);

        this.save(record);

        log.info("Successfully saved learning record with ID: {}", record.getId());

        // 自动打卡
        checkinService.checkin(userId);

        // 计算和更新积分
        int pointsEarned = 10; // 基础分
        if (dto.getMasteryLevel() != null && dto.getMasteryLevel() >= 3) {
            pointsEarned += 10; // 掌握/正确额外加分
        }

        try {
            User user = userMapper.selectById(userId);
            if (user != null) {
                int currentPoints = user.getPoints() == null ? 0 : user.getPoints();
                user.setPoints(currentPoints + pointsEarned);
                userMapper.updateById(user);
            }

            // 检查并更新成就进度
            // 1. 记录总数成就 (First Blood & Total Records)
            achievementService.incrementProgress(userId, "total_records", 1);

            // 2. 词汇大师成就 (Vocab Master)
            if ("vocabulary".equals(dto.getContentType()) && dto.getIsCorrect() == 1) {
                achievementService.incrementProgress(userId, "vocab_count", 1);
            }

            // 3. 完美得分成就 (Perfect Score)
            if (dto.getScore() != null && dto.getScore() >= 100) {
                achievementService.incrementProgress(userId, "perfect_score", 1);
            }

        } catch (Exception e) {
            // 积分更新失败不影响记录保存，仅记录日志
            log.error("Failed to update user points or achievements for user: " + userId, e);
        }

        return pointsEarned;
    }

    /**
     * 获取用户学习记录（分页）
     * 支持按内容类型和是否正确进行筛选。
     */
    @Override
    public Page<LearningRecord> getUserRecords(Long userId, Integer page, Integer pageSize, String contentType,
            Integer isCorrect) {
        Page<LearningRecord> pageParam = new Page<>(page, pageSize);
        LambdaQueryWrapper<LearningRecord> wrapper = new LambdaQueryWrapper<>();

        wrapper.eq(LearningRecord::getUserId, userId);

        if (contentType != null && !contentType.isEmpty()) {
            wrapper.eq(LearningRecord::getContentType, contentType);
        }

        if (isCorrect != null) {
            wrapper.eq(LearningRecord::getIsCorrect, isCorrect);
        }

        wrapper.orderByDesc(LearningRecord::getCreateTime);

        return this.page(pageParam, wrapper);
    }

    /**
     * 获取用户全维度统计数据
     * 包含：
     * 1. 总体统计 (overall)
     * 2. 分类统计 (byType)
     * 3. 连续打卡天数
     * 4. 学习趋势 (7天)
     * 5. 六维能力雷达图数据 (abilityStats)
     */
    @Override
    public Map<String, Object> getUserStatistics(Long userId) {
        Map<String, Object> statistics = baseMapper.getUserStatistics(userId);
        List<Map<String, Object>> byType = baseMapper.getUserStatisticsByType(userId);

        Map<String, Object> result = new HashMap<>();
        if (statistics != null) {
            result.put("overall", statistics);
        }
        if (byType != null) {
            result.put("byType", byType);
        }

        // 添加连续打卡天数
        Integer consecutiveDays = checkinService.getConsecutiveDays(userId);
        result.put("consecutiveDays", consecutiveDays);

        // 默认返回7天趋势
        Map<String, Object> trends = getTrendStatistics(userId, 7);
        result.putAll(trends);

        // 计算增长数据
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> weeklyStatsList = (List<Map<String, Object>>) trends.get("weeklyStats");
        long growthTime = 0;
        if (weeklyStatsList != null) {
            for (Map<String, Object> day : weeklyStatsList) {
                Object timeObj = day.get("timeSpent");
                if (timeObj instanceof Number) {
                    growthTime += ((Number) timeObj).longValue();
                }
            }
        }
        result.put("growthTime", growthTime);

        Integer growthVocab = baseMapper.getNewVocabCount(userId, java.time.LocalDate.now().minusDays(6).toString());
        result.put("growthVocab", growthVocab != null ? growthVocab : 0);

        // 预计算 AI 需要的六维能力数据
        Map<String, Map<String, Object>> abilityStats = new HashMap<>();
        String[] requiredAbilities = { "vocabulary", "grammar", "reading", "listening", "writing", "speaking" };

        // 初始化默认值
        for (String ability : requiredAbilities) {
            Map<String, Object> defaultStat = new HashMap<>();
            defaultStat.put("count", 0);
            defaultStat.put("avgScore", 0.0);
            defaultStat.put("mastery", 0); // 0-5 估计值
            abilityStats.put(ability, defaultStat);
        }

        // 填充实际数据
        if (byType != null) {
            for (Map<String, Object> typeStat : byType) {
                String type = (String) typeStat.get("content_type");
                if (type != null && abilityStats.containsKey(type)) {
                    abilityStats.get(type).put("count", typeStat.get("count"));
                    abilityStats.get(type).put("avgScore", typeStat.get("avgScore"));
                    // 估算掌握度
                    Number avgScore = (Number) typeStat.get("avgScore");
                    // 修复：处理 avgScore 为 null 的情况（全部答错时 AVG(score) 返回 null）
                    double mastery = (avgScore != null) ? avgScore.doubleValue() / 20.0 : 0.0;
                    abilityStats.get(type).put("mastery", mastery);
                }
            }
        }

        // 特殊处理口语 (已移除推理逻辑，保持真实数据)

        result.put("abilityStats", abilityStats);

        return result;
    }

    /**
     * 获取学习趋势统计
     * 
     * @param days 统计天数 (默认7天)
     */
    @Override
    public Map<String, Object> getTrendStatistics(Long userId, Integer days) {
        if (days == null || days <= 0)
            days = 7;

        java.time.LocalDate end = java.time.LocalDate.now();
        java.time.LocalDate start = end.minusDays(days - 1);
        String startDate = start.toString();

        List<Map<String, Object>> dbWeeklyStats = baseMapper.getLearningTimeStats(userId, startDate);
        List<Map<String, Object>> dbTrendStats = baseMapper.getAccuracyTrendStats(userId, startDate);

        // 填充日期空缺，确保返回连续的日期数据
        List<Map<String, Object>> weeklyStats = fillDateGaps(dbWeeklyStats, start, end, "timeSpent", 0);
        List<Map<String, Object>> trendStats = fillDateGaps(dbTrendStats, start, end, "accuracy", null);

        Map<String, Object> result = new HashMap<>();
        result.put("weeklyStats", weeklyStats);
        result.put("trendStats", trendStats);
        return result;
    }

    private List<Map<String, Object>> fillDateGaps(List<Map<String, Object>> dbData, java.time.LocalDate start,
            java.time.LocalDate end, String valueKey, Object defaultValue) {
        Map<String, Map<String, Object>> dataMap = new HashMap<>();
        if (dbData != null) {
            for (Map<String, Object> item : dbData) {
                Object dateObj = item.get("date");
                if (dateObj != null) {
                    dataMap.put(dateObj.toString(), item);
                }
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        java.time.LocalDate current = start;
        while (!current.isAfter(end)) {
            String dateStr = current.toString();
            if (dataMap.containsKey(dateStr)) {
                result.add(dataMap.get(dateStr));
            } else {
                Map<String, Object> emptyItem = new HashMap<>();
                emptyItem.put("date", dateStr);
                emptyItem.put(valueKey, defaultValue);
                result.add(emptyItem);
            }
            current = current.plusDays(1);
        }
        return result;
    }

    /**
     * 获取待复习列表 (艾宾浩斯)
     * 查询 next_review_time <= 当前时间的记录
     */
    @Override
    public Page<LearningRecord> getReviewList(Long userId, Integer page, Integer pageSize) {
        Page<LearningRecord> pageParam = new Page<>(page, pageSize);
        LambdaQueryWrapper<LearningRecord> wrapper = new LambdaQueryWrapper<>();

        wrapper.eq(LearningRecord::getUserId, userId);
        wrapper.le(LearningRecord::getNextReviewTime, LocalDateTime.now());
        wrapper.orderByAsc(LearningRecord::getNextReviewTime);

        return this.page(pageParam, wrapper);
    }

    /**
     * 根据掌握程度计算下次复习时间
     * 基于艾宾浩斯遗忘曲线 (Ebbinghaus Forgetting Curve) 的简化实现。
     * masteryLevel 越高，复习间隔越长。
     * 间隔序列：1天 -> 2天 -> 4天 -> 7天 -> 15天 -> 30天
     *
     * @param masteryLevel 用户当前的掌握等级 (0-5)
     * @return 计算出的下次复习时间点
     */
    private LocalDateTime calculateNextReviewTime(Integer masteryLevel) {
        if (masteryLevel == null) {
            masteryLevel = 0;
        }

        // 根据艾宾浩斯遗忘曲线设置复习间隔
        int[] intervals = { 1, 2, 4, 7, 15, 30 }; // 天数
        int days = intervals[Math.min(masteryLevel, intervals.length - 1)];

        return LocalDateTime.now().plusDays(days);
    }

    @Override
    public Map<String, Object> getAnswerHistory(String module, int page, int size) {
        Long userId = StpUtil.getLoginIdAsLong();
        Map<String, Object> result = new HashMap<>();

        // 1. 查询 LearningRecord
        Page<LearningRecord> recordPage = new Page<>(page, size);
        LambdaQueryWrapper<LearningRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(LearningRecord::getUserId, userId)
                .eq(LearningRecord::getContentType, module.toLowerCase())
                .orderByDesc(LearningRecord::getCreateTime);

        this.page(recordPage, wrapper);

        // 2. 组装数据
        List<Map<String, Object>> records = new ArrayList<>();

        // Reading & Listening 模块：按文章/篇章分组处理
        if ("reading".equalsIgnoreCase(module) || "listening".equalsIgnoreCase(module)) {
            // 按文章标题分组
            Map<String, List<LearningRecord>> groups = new LinkedHashMap<>();

            log.info("Found {} {} records for user {}", recordPage.getRecords().size(), module, userId);

            String defaultTitle = "reading".equalsIgnoreCase(module) ? "阅读练习" : "听力练习";

            for (LearningRecord record : recordPage.getRecords()) {
                String title = defaultTitle;
                String original = record.getOriginalContent();

                if (original != null && original.length() > 10) {
                    try {
                        ObjectMapper mapper = new ObjectMapper();
                        Map<String, Object> contentMap = mapper.readValue(original,
                                new TypeReference<Map<String, Object>>() {
                                });
                        if (contentMap.containsKey("title")) {
                            title = contentMap.get("title").toString();
                        } else if (contentMap.containsKey("passage")) {
                            title = contentMap.get("passage").toString();
                        }
                    } catch (Exception e) {
                        // 解析失败，使用默认标题
                    }
                }

                // 防御性编程：createTime 可能为 null
                String dateStr = LocalDateTime.now().toLocalDate().toString();
                if (record.getCreateTime() != null) {
                    dateStr = record.getCreateTime().toLocalDate().toString();
                }

                // 使用 title + createDate 作为分组键
                String groupKey = title + "_" + dateStr;
                groups.computeIfAbsent(groupKey, k -> new ArrayList<>()).add(record);
            }

            // 为每组文章创建一个历史记录
            for (List<LearningRecord> group : groups.values()) {
                if (group.isEmpty())
                    continue;

                LearningRecord firstRecord = group.get(0);
                Map<String, Object> item = new HashMap<>();

                // 基础信息
                item.put("id", firstRecord.getId());
                item.put("createTime", firstRecord.getCreateTime());
                item.put("contentType", module.toLowerCase());

                String title = defaultTitle;
                String mainContent = "";
                List<Map<String, Object>> allQuestions = new ArrayList<>();
                int correctCount = 0;

                for (LearningRecord record : group) {
                    String original = record.getOriginalContent();
                    if (original != null && original.length() > 10) {
                        try {
                            ObjectMapper mapper = new ObjectMapper();
                            Map<String, Object> contentMap = mapper.readValue(original,
                                    new TypeReference<Map<String, Object>>() {
                                    });

                            if (contentMap.containsKey("title")) {
                                title = contentMap.get("title").toString();
                            } else if (contentMap.containsKey("passage")) {
                                title = contentMap.get("passage").toString();
                            }

                            if (contentMap.containsKey("content") && mainContent.isEmpty()) {
                                mainContent = contentMap.get("content").toString();
                            } else if (contentMap.containsKey("script") && mainContent.isEmpty()) {
                                mainContent = contentMap.get("script").toString();
                            }

                            if (contentMap.containsKey("question")) {
                                Object qObj = contentMap.get("question");
                                Map<String, Object> questionMap = null;

                                if (qObj instanceof Map) {
                                    questionMap = (Map<String, Object>) qObj;
                                } else if (qObj instanceof String) {
                                    // 兼容旧格式：question 仅为字符串
                                    questionMap = new HashMap<>();
                                    questionMap.put("question", qObj);
                                }

                                if (questionMap != null) {
                                    // 添加用户答案信息
                                    questionMap.put("userAnswer", record.getAnswer());
                                    questionMap.put("correctAnswer", record.getCorrectAnswer());
                                    questionMap.put("isCorrect", record.getIsCorrect());
                                    allQuestions.add(questionMap);
                                }
                            }

                            if (record.getIsCorrect() == 1) {
                                correctCount++;
                            }
                        } catch (Exception e) {
                            log.error("Failed to parse originalContent", e);
                        }
                    }
                }

                // 计算平均分数
                int avgScore = allQuestions.isEmpty() ? 0 : (correctCount * 100 / allQuestions.size());

                item.put("title", title);
                item.put("content", mainContent); // Unified field
                item.put("questions", allQuestions);
                item.put("score", avgScore);
                item.put("difficulty", "medium");

                records.add(item);
            }
        } else {
            // 其他模块：逐条处理
            for (LearningRecord record : recordPage.getRecords()) {
                Map<String, Object> item = new HashMap<>();
                // 基础信息
                item.put("id", record.getId());
                item.put("score", record.getScore());
                item.put("isCorrect", record.getIsCorrect());
                item.put("createTime", record.getCreateTime());
                item.put("answer", record.getAnswer());
                item.put("correctAnswer", record.getCorrectAnswer());
                item.put("contentType", record.getContentType());
                item.put("originalContent", record.getOriginalContent());

                // 尝试获取题目内容
                Object questionsContent = null;
                String original = record.getOriginalContent();
                if (original != null && original.length() > 5) {
                    questionsContent = original;
                }

                String title = "练习";
                String difficulty = "normal";

                // 回查 Content 表补充信息
                if (record.getContentId() != null) {
                    try {
                        switch (module.toLowerCase()) {
                            case "listening":
                                ListeningMaterial lm = listeningMaterialMapper.selectById(record.getContentId());
                                if (lm != null) {
                                    if (questionsContent == null)
                                        questionsContent = lm.getQuestions();
                                    title = lm.getTitle();
                                    difficulty = lm.getDifficulty();
                                }
                                break;
                            case "reading":
                                // Reading 模块在外层特殊处理，跳过此处
                                break;
                            case "grammar":
                                GrammarExercise ge = grammarExerciseMapper.selectById(record.getContentId());
                                if (ge != null) {
                                    if (questionsContent == null) {
                                        if (ge.getQuestions() != null && !ge.getQuestions().isEmpty()) {
                                            questionsContent = ge.getQuestions();
                                        } else {
                                            Map<String, Object> singleQ = new HashMap<>();
                                            singleQ.put("question", ge.getQuestion());
                                            // 实体中缺少 options, answer, explanation 字段，暂时无法补全
                                            List<Object> list = new ArrayList<>();
                                            list.add(singleQ);
                                            questionsContent = list;
                                        }
                                    }
                                    title = ge.getTopic() != null ? ge.getTopic() : "语法练习";
                                    difficulty = ge.getDifficulty();
                                }
                                break;
                            case "speaking":
                                // 优先从 originalContent 解析
                                if (original != null && original.length() > 10) {
                                    try {
                                        ObjectMapper mapper = new ObjectMapper();
                                        Map<String, Object> contentMap = mapper.readValue(original,
                                                new TypeReference<Map<String, Object>>() {
                                                });
                                        if (contentMap.containsKey("topic")) {
                                            @SuppressWarnings("unchecked")
                                            Map<String, Object> topicMap = (Map<String, Object>) contentMap
                                                    .get("topic");
                                            // 提取 topic 的各个字段
                                            item.put("topic", topicMap.get("topic"));
                                            item.put("question", topicMap.get("question"));
                                            item.put("type", topicMap.get("type"));
                                            item.put("keywords", topicMap.get("keywords"));
                                            item.put("tips", topicMap.get("tips"));
                                            item.put("hints", topicMap.get("hints"));
                                            title = topicMap.get("title") != null ? topicMap.get("title").toString()
                                                    : "口语练习";
                                            difficulty = topicMap.get("difficulty") != null
                                                    ? topicMap.get("difficulty").toString()
                                                    : "normal";
                                        }
                                    } catch (Exception parseEx) {
                                        log.warn("Failed to parse speaking originalContent: {}", parseEx.getMessage());
                                    }
                                }

                                // 如果解析失败或没有 originalContent，尝试从数据库查询
                                if (record.getContentId() != null && record.getContentId() > 0) {
                                    SpeakingTopic st = speakingTopicMapper.selectById(record.getContentId());
                                    if (st != null) {
                                        if (!item.containsKey("question")) {
                                            item.put("question", st.getQuestion());
                                            item.put("type", st.getType());
                                            item.put("keywords", st.getKeywords());
                                            item.put("tips", st.getTips());
                                        }
                                        if (title.equals("练习"))
                                            title = st.getTitle();
                                        if (difficulty.equals("normal"))
                                            difficulty = st.getDifficulty();
                                    }
                                }
                                break;
                            case "writing":
                                // 优先从 originalContent 解析
                                if (original != null && original.length() > 10) {
                                    try {
                                        ObjectMapper mapper = new ObjectMapper();
                                        Map<String, Object> contentMap = mapper.readValue(original,
                                                new TypeReference<Map<String, Object>>() {
                                                });
                                        if (contentMap.containsKey("topic")) {
                                            @SuppressWarnings("unchecked")
                                            Map<String, Object> topicMap = (Map<String, Object>) contentMap
                                                    .get("topic");
                                            item.put("prompt", topicMap.get("prompt"));
                                            item.put("mode", topicMap.get("mode"));
                                            item.put("tips", topicMap.get("tips"));
                                            title = topicMap.get("title") != null ? topicMap.get("title").toString()
                                                    : "写作练习";
                                            difficulty = topicMap.get("difficulty") != null
                                                    ? topicMap.get("difficulty").toString()
                                                    : "normal";
                                        }
                                    } catch (Exception parseEx) {
                                        log.warn("Failed to parse writing originalContent: {}", parseEx.getMessage());
                                    }
                                }

                                // 如果解析失败或没有 originalContent，尝试从数据库查询
                                if (record.getContentId() != null && record.getContentId() > 0) {
                                    WritingTopic wt = writingTopicMapper.selectById(record.getContentId());
                                    if (wt != null) {
                                        if (!item.containsKey("prompt")) {
                                            item.put("prompt", wt.getPrompt());
                                            item.put("mode", wt.getMode());
                                            item.put("tips", wt.getTips());
                                        }
                                        if (title.equals("练习"))
                                            title = wt.getTitle();
                                        if (difficulty.equals("normal"))
                                            difficulty = wt.getDifficulty();
                                    }
                                }
                                break;
                        }
                    } catch (Exception e) {
                        log.error("Error fetching content details", e);
                    }
                }

                item.put("questions", questionsContent);
                item.put("title", title);
                item.put("difficulty", difficulty);

                records.add(item);
            }
        }

        result.put("records", records);
        result.put("total", recordPage.getTotal());
        result.put("pages", recordPage.getPages());

        return result;
    }
}
