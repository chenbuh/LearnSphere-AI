package com.learnsphere.service.impl;

import cn.dev33.satoken.stp.StpUtil;
// import cn.hutool.core.bean.BeanUtil;
import cn.hutool.json.JSONUtil;
import com.learnsphere.common.annotation.RequireVip;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.learnsphere.entity.*;
import com.learnsphere.exception.BusinessException;
import com.learnsphere.mapper.LearningRecordMapper;
import com.learnsphere.service.*;
import com.learnsphere.util.ExamTypeSupport;
import com.learnsphere.utils.ExamTypeAliasUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDate;
import com.learnsphere.mapper.VipOrderMapper;
import org.springframework.context.annotation.Lazy;

/**
 * AI 生成服务实现类
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Slf4j
@Service
public class AIGenerationServiceImpl implements IAIGenerationService {
    private static final int LEARNING_ANALYSIS_REPORT_VERSION = 2;
    private static final String LEARNING_ANALYSIS_SOURCE = "real-learning-records";
    private static final int LEARNING_ANALYSIS_COMPARISON_DAYS = 7;
    private static final Set<String> SPEAKING_RELEVANCE_STOP_WORDS = Set.of(
            "a", "an", "the", "and", "or", "but", "if", "then", "else", "when", "while",
            "is", "am", "are", "was", "were", "be", "been", "being",
            "do", "does", "did", "have", "has", "had",
            "to", "of", "in", "on", "at", "for", "with", "from", "by", "about", "as",
            "you", "your", "yours", "i", "me", "my", "mine", "we", "our", "ours",
            "he", "she", "it", "they", "them", "their", "this", "that", "these", "those",
            "who", "what", "which", "where", "why", "how",
            "should", "would", "could", "can", "will", "just", "very", "more", "most",
            "say", "talk", "describe", "tell", "explain", "mention");

    /** 配额与预算职责已拆分至独立服务（原为本类私有方法与内部类） */
    @Autowired
    private AiQuotaAndBudgetService aiQuotaAndBudgetService;

    /** 学习分析职责已拆分至独立服务（原为本类 600 行的方法区块） */
    @Autowired
    private LearningAnalysisService learningAnalysisService;

    /** 模型调用职责已拆分至独立服务（模型路由、缓存、熔断重试、降级、指标） */
    @Autowired
    private AiModelInvocationService aiModelInvocationService;

    /** 本地降级兜底数据生成（原为本类 192 行的 Mock 方法区块） */
    @Autowired
    private AiFallbackContentGenerator aiFallbackContentGenerator;

    /**
     * 把本类的能力计算与 LLM 调用能力交给学习分析服务复用。
     *
     * <p>能力计算仍留在本类（依赖较深的方法链且被推荐模块复用），
     * LLM 调用则直接转发到已独立出来的 {@link AiModelInvocationService}。
     */
    @jakarta.annotation.PostConstruct
    void wireLearningAnalysisCollaborators() {
        learningAnalysisService.setCollaborators(
                new LearningAnalysisService.AbilityProvider() {
                    @Override
                    public List<Map<String, Object>> generateAbilities(Map<String, Object> statistics) {
                        return AIGenerationServiceImpl.this.generateAbilities(statistics);
                    }

                    @Override
                    public List<Map<String, Object>> generateWeakPoints(Map<String, Object> statistics) {
                        return AIGenerationServiceImpl.this.generateWeakPoints(statistics);
                    }
                },
                aiModelInvocationService::callLLM);
    }

    @Autowired
    private com.learnsphere.service.AIProviderConfigService providerConfig;

    @Autowired
    private IReadingArticleService readingArticleService;
    @Autowired
    private IListeningMaterialService listeningMaterialService;
    @Autowired
    private IGrammarExerciseService grammarExerciseService;
    @Autowired
    private ISpeakingTopicService speakingTopicService;
    @Autowired
    private IWritingTopicService writingTopicService;
    @Autowired
    private ISystemPromptService systemPromptService;
    @Autowired
    private IAIGenerationLogService aiGenerationLogService;
    @Autowired
    private ILearningRecordService learningRecordService;
    @Autowired
    private LearningRecordMapper learningRecordMapper;
    @Autowired
    private IAchievementService achievementService;




    @Autowired
    @Lazy
    private IUserService userService;

    @Autowired
    private VipOrderMapper vipOrderMapper;



    private String getStageAwareSystemPrompt(String baseKey, String defaultContent, String description, String examType) {
        String stage = ExamTypeAliasUtils.normalizeStage(examType);
        if (stage == null) {
            return systemPromptService.getPromptTemplate(baseKey, defaultContent, description);
        }

        String stageKey = baseKey + "_" + stage.toUpperCase(Locale.ROOT);
        String stageDescription = description + "（" + ExamTypeAliasUtils.getStageLabel(stage) + "）";
        return systemPromptService.getPromptTemplate(stageKey, defaultContent, stageDescription);
    }

    private String normalizeExamType(String examType) {
        String normalized = ExamTypeAliasUtils.normalize(examType);
        return normalized == null ? examType : normalized;
    }

    private void applyExamTypeFilter(LambdaQueryWrapper<WritingTopic> wrapper, String examType) {
        List<String> aliases = ExamTypeAliasUtils.expandAliases(examType);
        if (aliases.isEmpty()) {
            return;
        }
        if (aliases.size() == 1) {
            wrapper.eq(WritingTopic::getExamType, aliases.get(0));
            return;
        }
        wrapper.in(WritingTopic::getExamType, aliases);
    }

    /**
     * 深度分析用户的错题记录
     * 使用 RAG (检索增强生成) 模式，结合用户错误的上下文，提供针对性的解析。
     *
     * @param recordId 错题记录的 ID
     * @return 包含分析结果、知识点补全和相似挑战题的 Map
     */
    @Override
    @RequireVip(feature = "AI 错题深度分析", quotaCost = 2, minLevel = 0)
    public Map<String, Object> deepAnalyzeError(Long recordId) {
        log.info("执行错题深度 RAG 解析: recordId={}", recordId);
        LearningRecord record = learningRecordService.getById(recordId);
        if (record == null)
            return Map.of("error", "Record not found");
        if (!StpUtil.isLogin()) {
            throw new BusinessException(401, "请先登录");
        }
        Long userId = StpUtil.getLoginIdAsLong();
        if (record.getUserId() == null || !record.getUserId().equals(userId)) {
            throw new BusinessException(403, "无权访问该错题记录");
        }

        List<Achievement> newlyUnlocked = new ArrayList<>();
        newlyUnlocked.addAll(achievementService.incrementProgress(userId, "AI_DEEP_ANALYZE", 1));

        String context = String.format("题目类型: %s\n题目内容: %s\n用户的错误回答: %s\n正确答案: %s\n",
                record.getContentType(), record.getOriginalContent(), record.getAnswer(), record.getCorrectAnswer());

        String systemPrompt = systemPromptService.getPromptTemplate(
                "DEEP_ANALYZE_SYSTEM",
                "你是一个极具洞察力的英语教育专家。你的任务是根据用户的错题记录，进行深度的心理学和语言学分析。",
                "错题深度分析-系统提示词");

        String userPromptTemplate = systemPromptService.getPromptTemplate(
                "DEEP_ANALYZE_USER",
                "基于以下错题背景进行深度分析：\n%s\n请提供：1. 错误根源分析（为什么会选错） 2. 核心知识点强化（RAG 知识补全） 3. 一个高度相似的挑战练习题（用于验证改进）。\n返回 JSON 格式：{\"analysis\": \"...\", \"knowledgeShield\": \"...\", \"challengeQuestion\": {\"text\": \"...\", \"options\": [], \"correct\": 0}}",
                "错题深度分析-用户提示词");

        String userPrompt = String.format(userPromptTemplate, context);

        try {
            String response = aiModelInvocationService.callLLM(systemPrompt, userPrompt, "DEEP_ANALYZE_ERROR");
            Map<String, Object> result = JSONUtil.parseObj(cleanJsonResponse(response));
            if (!newlyUnlocked.isEmpty()) {
                result.put("newAchievements", newlyUnlocked);
            }
            return result;
        } catch (Exception e) {
            log.error("错题分析失败", e);
            return Map.of("analysis", "AI 分析暂时不可用，请稍后再试。", "knowledgeShield", "核心知识点：请查阅相关语法手册。");
        }
    }

    @Override
    @RequireVip(feature = "AI 口语1V1模考", quotaCost = 5, minLevel = 0)
    public Map<String, Object> startSpeakingMock(String topic, String difficulty) {
        log.info("开启 1V1 口语模考: {} / {}", topic, difficulty);
        String systemPrompt = systemPromptService.getPromptTemplate(
                "SPEAKING_MOCK_SYSTEM",
                "你是一个雅思/托福口语考官。你要与学生进行 1V1 的互动模拟考试。",
                "口语模考-系统提示词");

        String userPromptTemplate = systemPromptService.getPromptTemplate(
                "SPEAKING_MOCK_START_USER",
                "请针对主题 '%s' 和难度 '%s' 开启一场口语模考。\n首先给出一句鼓励性的开场白，然后提出 Part 1 的第一个问题。\n返回 JSON：{\"greeting\": \"...\", \"firstQuestion\": \"...\", \"sessionId\": \"%s\"}",
                "口语模考开始-用户提示词");

        String userPrompt = String.format(userPromptTemplate, topic, difficulty, UUID.randomUUID());

        try {
            String response = aiModelInvocationService.callLLM(systemPrompt, userPrompt, "SPEAKING_MOCK_START");
            return JSONUtil.parseObj(cleanJsonResponse(response));
        } catch (Exception e) {
            return Map.of("greeting", "Hello! Let's start our speaking practice.", "firstQuestion",
                    "Can you tell me something about yourself?");
        }
    }

    @Override
    public Map<String, Object> continueSpeakingMock(String sessionId, String userTranscription) {
        log.info("继续口语模考: {} -> {}", sessionId, userTranscription);
        String systemPrompt = "你是一个雅思/托福口语考官。你正在与学生进行 1V1 模考。";
        String userPrompt = String.format("学生刚才回答了：\"%s\"\n" +
                "请你：1. 对之前的回答做简要反馈 2. 问下一个深度追踪问题。\n" +
                "返回 JSON：{\"feedback\": \"...\", \"nextQuestion\": \"...\", \"finish\": false}", userTranscription);

        try {
            String response = aiModelInvocationService.callLLM(systemPrompt, userPrompt, "SPEAKING_MOCK_CONTINUE");
            return JSONUtil.parseObj(cleanJsonResponse(response));
        } catch (Exception e) {
            return Map.of("feedback", "Good answer.", "nextQuestion", "Can you elaborate on that?", "finish", false);
        }
    }

    @Override
    public Map<String, Object> generateSpeakingReport(List<Map<String, String>> conversation) {
        log.info("生成口语模考报告，对话轮数: {}", conversation.size());

        StringBuilder historyBuilder = new StringBuilder();
        for (Map<String, String> msg : conversation) {
            historyBuilder.append(msg.get("role")).append(": ").append(msg.get("content")).append("\n");
        }

        String systemPrompt = "你是一个顶级的雅思/托福口语评分专家。你需要根据对话历史，为学生生成一份极其专业、详尽的分析报告。";
        String userPrompt = "这是刚才的口语对话历史：\n" + historyBuilder.toString() + "\n" +
                "请提供：\n" +
                "1. 综合评分（0-100）\n" +
                "2. 维度评分：发音、流利度、语法、词汇（各100分制）\n" +
                "3. 核心亮点（Strengths）\n" +
                "4. 改进建议（Recommendations）及具体的语法/表达纠错\n" +
                "5. 一个针对本轮话题的'高分范例/模范回答'（Model Answer）\n" +
                "返回 JSON：{\"score\": 85, \"dimensions\": {\"pronunciation\": 80, \"fluency\": 85, \"grammar\": 78, \"vocabulary\": 84}, \"strengths\": [], \"weaknesses\": [], \"tips\": [], \"modelAnswer\": \"...\"}";

        try {
            String response = aiModelInvocationService.callLLM(systemPrompt, userPrompt, "SPEAKING_REPORT_GEN");
            Map<String, Object> result = JSONUtil.parseObj(cleanJsonResponse(response));

            // 保存到学习记录（用于排行榜）
            try {
                if (StpUtil.isLogin()) {
                    Long userId = StpUtil.getLoginIdAsLong();
                    LearningRecord record = new LearningRecord();
                    record.setUserId(userId);
                    record.setContentType("speaking");
                    record.setScore((Integer) result.get("score"));
                    record.setCreateTime(LocalDateTime.now());
                    learningRecordService.save(record);

                    // 同步勋章进度
                    int score = (Integer) result.get("score");
                    List<Achievement> unlocked = new ArrayList<>();
                    unlocked.addAll(achievementService.incrementProgress(userId, "AI_SPEAKING_SESSION", 1));
                    unlocked.addAll(achievementService.updateProgress(userId, "AI_SPEAKING_SCORE", score));

                    if (!unlocked.isEmpty()) {
                        result.put("newAchievements", unlocked);
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to save speaking record: {}", e.getMessage());
            }

            return result;
        } catch (Exception e) {
            return Map.of("error", "Failed to generate report");
        }
    }

    @Override
    public Map<String, Object> auditContent(String contentType, Long contentId) {
        log.info("AI 审查机器人启动: {} / {}", contentType, contentId);
        String content = "";

        if ("reading".equalsIgnoreCase(contentType)) {
            ReadingArticle article = readingArticleService.getById(contentId);
            if (article != null)
                content = article.getContent();
        } else if ("listening".equalsIgnoreCase(contentType)) {
            ListeningMaterial lm = listeningMaterialService.getById(contentId);
            if (lm != null)
                content = lm.getScript();
        }

        if (content == null || content.isEmpty())
            return Map.of("status", "FAIL", "reason", "Content not found");

        String systemPrompt = "你是一个专业的内容质量审核专家。你需要审核 AI 生成的学习素材是否存在逻辑错误、语法不通点或格式异常。";
        String userPrompt = "请审查以下内容并给出 0-100 的质量分：\n\n" + content + "\n\n" +
                "返回 JSON：{\"qualityScore\": 90, \"isPassed\": true, \"issues\": [\"错误1\", \"错误2\"], \"suggestion\": \"改进建议\"}";

        try {
            String response = aiModelInvocationService.callLLM(systemPrompt, userPrompt, "CONTENT_AUDIT");
            return JSONUtil.parseObj(cleanJsonResponse(response));
        } catch (Exception e) {
            return Map.of("status", "ERROR", "reason", e.getMessage());
        }
    }

    @Override
    @RequireVip(feature = "AI 阅读理解生成", quotaCost = 2, minLevel = 0)
    public Map<String, Object> generateReading(String source, String category, String difficulty, String length) {
        log.info("生成阅读理解: {} / {} / {}", category, difficulty, length);

        if (!providerConfig.hasApiKey()) {
            Map<String, Object> criteria = new HashMap<>();
            criteria.put("difficulty", difficulty);
            criteria.put("category", category);
            return generateFromLocal("reading", criteria);
        }

        try {
            // 1. 构建系统提示词 (System Prompt) - 设定 AI 角色
            String systemPrompt = systemPromptService.getPromptTemplate(
                    "READING_GEN_SYSTEM",
                    "你是一个专业的英语阅读理解出题专家。你必须严格遵守用户的字数要求，绝对不能偷懒写短文。如果文章长度不足，任务将失败。",
                    "阅读理解生成-系统提示词");

            // 处理长度描述，将 vague 的 "short/medium/long" 转换为具体的词数范围
            String lengthDesc = length;
            if ("short".equalsIgnoreCase(length)) {
                lengthDesc = "200-300";
            } else if ("medium".equalsIgnoreCase(length)) {
                lengthDesc = "400-600";
            } else if ("long".equalsIgnoreCase(length)) {
                lengthDesc = "800-1000";
            }

            // 2. 构建用户提示词 (User Prompt) - 填充具体的生成要求：难度、主题、长度、JSON 格式约束
            String userPromptTemplate = systemPromptService.getPromptTemplate(
                    "READING_GEN_USER",
                    "请生成一篇%s难度的英语阅读理解，主题：%s。\n" +
                            "【重要】文章长度要求：%s词左右。请务必写够字数，内容要丰富充实！\n" +
                            "要求：\n" +
                            "1. 文章要地道、有趣、贴近生活，段落结构清晰。\n" +
                            "2. 包含5道选择题，每题4个选项。\n" +
                            "3. 必须返回标准的JSON格式，不要包含任何Markdown格式（如 ```json ... ```），直接返回JSON字符串。\n" +
                            "JSON结构：{\"title\":\"文章标题\", \"passage\":\"这里放完整的长篇文章内容\", \"questions\":[{\"text\":\"问题\", \"options\":[\"A\",\"B\",\"C\",\"D\"], \"correct\":0, \"explanation\":\"解析\"}]}\n",
                    "阅读理解生成-用户提示词");

            String userPrompt = String.format(userPromptTemplate, difficulty, category, lengthDesc);

            // 3. 调用大模型接口
            String content = aiModelInvocationService.callLLM(systemPrompt, userPrompt, "GENERATE_READING");
            content = cleanJsonResponse(content);

            Map<String, Object> jsonResult = JSONUtil.parseObj(content);

            // 尝试保存到数据库
            try {
                if (StpUtil.isLogin()) {
                    Long userId = StpUtil.getLoginIdAsLong();
                    ReadingArticle article = new ReadingArticle();
                    article.setUserId(userId);
                    article.setTitle((String) jsonResult.get("title"));
                    // 兼容 passage 和 content 字段
                    String passage = (String) jsonResult.getOrDefault("passage", jsonResult.get("content"));
                    article.setContent(passage);
                    article.setCategory(category);
                    article.setDifficulty(difficulty);

                    // 修复词数统计：根据实际正文内容计算（西文按空格分词）
                    if (passage != null) {
                        article.setWordCount(passage.trim().split("\\s+").length);
                    } else {
                        article.setWordCount(0);
                    }
                    article.setQuestions(JSONUtil.toJsonStr(jsonResult.get("questions")));
                    article.setCreateTime(LocalDateTime.now());

                    readingArticleService.save(article);
                }
            } catch (Exception e) {
                log.warn("保存阅读文章失败: {}", e.getMessage());
            }

            return jsonResult;
        } catch (Exception e) {
            log.error("AI 生成阅读失败，尝试从本地数据库获取", e);
            Map<String, Object> criteria = new HashMap<>();
            criteria.put("difficulty", difficulty);
            criteria.put("category", category);
            return generateFromLocal("reading", criteria);
        }
    }

    @Override
    @RequireVip(feature = "AI 写作题目生成", quotaCost = 1, minLevel = 0)
    public Map<String, Object> generateWriting(String examType, String mode, String difficulty) {
        String effectiveExamType = ExamTypeSupport.normalizeOrDefault(examType, "cet4");
        String effectiveMode = (mode == null || mode.isBlank()) ? "essay" : mode;
        String effectiveDifficulty = (difficulty == null || difficulty.isBlank()) ? "medium" : difficulty;
        String examLabel = ExamTypeSupport.getDisplayLabel(effectiveExamType);
        log.info("生成写作题目: {} / {} / {}", effectiveExamType, effectiveMode, effectiveDifficulty);

        if (!providerConfig.hasApiKey()) {
            Map<String, Object> criteria = new HashMap<>();
            criteria.put("examType", effectiveExamType);
            criteria.put("mode", effectiveMode);
            criteria.put("difficulty", effectiveDifficulty);
            return generateFromLocal("writing", criteria);
        }

        try {
            String systemPrompt = systemPromptService.getPromptTemplate(
                    "WRITING_GEN_SYSTEM",
                    "你是一个专业的英语写作出题专家。",
                    "写作题目生成-系统提示词");
            String userPromptTemplate = systemPromptService.getPromptTemplate(
                    ExamTypeSupport.resolvePromptKey("WRITING_GEN_USER", effectiveExamType),
                    "请为%s考试/学习阶段生成一道%s类型、%s难度的英语写作题目。\n" +
                            "命题说明：" + ExamTypeSupport.getWritingGuidance(effectiveExamType) + "\n" +
                            "要求：\n" +
                            "1. 题目要有针对性，符合该考试或学习阶段和当前难度的常见话题。\n" +
                            "2. 提供详细的写作要求(prompt)。\n" +
                            "3. 提供3-5个写作提示(tips)，例如可以使用的句式、思路或信息点。\n" +
                            "4. 提供建议的最低字数限制(minWords)和合理的 timeLimit。\n" +
                            "5. difficulty 字段原样返回 easy、medium 或 hard。\n" +
                            "返回JSON格式：{\"title\":\"题目\", \"prompt\":\"详细要求\", \"tips\":[\"提示1\", \"提示2\"], \"minWords\":150, \"timeLimit\":30, \"difficulty\":\"medium\"}\n",
                    "写作题目生成-" + ExamTypeSupport.getPromptDescriptionSuffix(effectiveExamType) + "用户提示词");
            String userPrompt = String.format(userPromptTemplate, examLabel, effectiveMode, effectiveDifficulty);

            String content = aiModelInvocationService.callLLM(systemPrompt, userPrompt, "GENERATE_WRITING");
            content = cleanJsonResponse(content);

            Map<String, Object> jsonResult = JSONUtil.parseObj(content);

            // 确保返回字段齐全且类型正确
            jsonResult.put("title", jsonResult.getOrDefault("title", jsonResult.get("topic")));
            jsonResult.put("prompt", jsonResult.getOrDefault("prompt", jsonResult.get("requirements")));
            if (jsonResult.get("tips") == null)
                jsonResult.put("tips", new ArrayList<>());
            if (jsonResult.get("minWords") == null)
                jsonResult.put("minWords", 150);
            jsonResult.put("difficulty", jsonResult.getOrDefault("difficulty", effectiveDifficulty));

            try {
                if (StpUtil.isLogin()) {
                    WritingTopic wt = new WritingTopic();
                    wt.setExamType(effectiveExamType);
                    wt.setMode(effectiveMode);
                    wt.setTitle((String) jsonResult.get("title"));
                    wt.setPrompt((String) jsonResult.get("prompt"));

                    Object minWordsObj = jsonResult.get("minWords");
                    if (minWordsObj instanceof Number) {
                        wt.setMinWords(((Number) minWordsObj).intValue());
                    } else if (minWordsObj instanceof String) {
                        try {
                            wt.setMinWords(Integer.parseInt((String) minWordsObj));
                        } catch (NumberFormatException e) {
                            wt.setMinWords(120);
                        }
                    } else {
                        wt.setMinWords(120);
                    }

                    wt.setTips(JSONUtil.toJsonStr(jsonResult.get("tips")));
                    wt.setDifficulty(String.valueOf(jsonResult.getOrDefault("difficulty", effectiveDifficulty)));
                    wt.setCreateTime(LocalDateTime.now());
                    writingTopicService.save(wt);

                    // 把 ID 也传回去
                    jsonResult.put("id", wt.getId());
                }
            } catch (Exception e) {
                log.warn("保存写作题目失败: {}", e.getMessage());
            }

            return jsonResult;
        } catch (Exception e) {
            log.error("AI 生成写作失败，尝试从本地数据库获取", e);
            Map<String, Object> criteria = new HashMap<>();
            criteria.put("examType", effectiveExamType);
            criteria.put("mode", effectiveMode);
            criteria.put("difficulty", effectiveDifficulty);
            return generateFromLocal("writing", criteria);
        }
    }

    @Override
    @RequireVip(feature = "AI 写作批改", quotaCost = 3, minLevel = 0)
    public Map<String, Object> evaluateWriting(String topic, String content) {
        log.info("评估写作: {}", topic);

        if (!providerConfig.hasApiKey()) {
            return aiFallbackContentGenerator.generateMockEvaluation();
        }
        try {
            String systemPrompt = systemPromptService.getPromptTemplate(
                    "EVALUATE_WRITING_SYSTEM",
                    "你是一个专业的英语写作评分老师，擅长从内容、语法、词汇、结构等方面给出详细的评价和建议。",
                    "写作批改-系统提示词");

            String userPromptTemplate = systemPromptService.getPromptTemplate(
                    "EVALUATE_WRITING_USER",
                    "请评估以下作文（题目：%s）：\n\n%s\n\n要求返回的 JSON 格式中，feedback 必须是一个数组，每个元素包含 type (grammar/vocab/logic/general) 和 text (反馈内容)。\n返回JSON：{\"score\":85, \"feedback\":[{\"type\":\"grammar\", \"text\":\"...\"}, {\"type\":\"vocab\", \"text\":\"...\"}], \"suggestions\":[\"建议1\",\"建议2\"]}\n",
                    "写作批改-用户提示词");

            String userPrompt = String.format(userPromptTemplate, topic, content);

            String response = aiModelInvocationService.callLLM(systemPrompt, userPrompt, "EVALUATE_WRITING");
            response = cleanJsonResponse(response);

            return JSONUtil.parseObj(response);
        } catch (Exception e) {
            log.error("AI 评估写作失败，使用 Mock 数据", e);
            return aiFallbackContentGenerator.generateMockEvaluation();
        }
    }

    /**
     * 生成英语听力练习材料
     * 根据指定的类型和难度，生成包含对话脚本和题目的听力材料。
     * 由于目前无法直接生成音频文件，此步骤生成的是"听力脚本" (Audio Script)。
     * 前端会使用 TTS (Text-to-Speech) 引擎将脚本朗读出来。
     *
     * @param type       听力类型 (e.g., "conversation", "lecture")
     * @param difficulty 难度等级
     * @param count      需要生成的篇章数量
     * @return 包含生成的听力材料列表的 Map
     */
    @Override
    @RequireVip(feature = "AI 听力生成", quotaCost = 2, minLevel = 0, checkQuota = false)
    public Map<String, Object> generateListening(String type, String difficulty, Integer count) {
        String effectiveType = ExamTypeSupport.normalizeOrDefault(type, "cet4");
        String effectiveDifficulty = (difficulty == null || difficulty.isBlank()) ? "medium" : difficulty;
        String examLabel = ExamTypeSupport.getDisplayLabel(effectiveType);
        log.info("生成听力练习: {} / {} / {}", effectiveType, effectiveDifficulty, count);
        int requestedCount = (count == null || count <= 0) ? 1 : count;

        if (!providerConfig.hasApiKey()) {
            Map<String, Object> criteria = new HashMap<>();
            criteria.put("difficulty", effectiveDifficulty);
            criteria.put("type", effectiveType);
            criteria.put("count", requestedCount);
            Map<String, Object> res = generateFromLocal("listening", criteria);
            res.put("_from", "local");
            res.put("_fallbackReason", "api_unavailable");
            return res;
        }

        AiQuotaAndBudgetService.AiQuotaReservation quotaReservation = aiQuotaAndBudgetService.reserveAiQuota("AI 听力生成", 2);
        try {
            String systemPrompt = systemPromptService.getPromptTemplate(
                    "LISTENING_GEN_SYSTEM",
                    "你是一个专业的英语听力出题专家。",
                    "听力生成-系统提示词");
            String userPromptTemplate = systemPromptService.getPromptTemplate(
                    ExamTypeSupport.resolvePromptKey("LISTENING_GEN_USER", effectiveType),
                    "请为%s考试/学习阶段生成%d段%s难度的英语听力素材。\n" +
                            "命题说明：" + ExamTypeSupport.getListeningGuidance(effectiveType) + "\n" +
                            "要求：\n" +
                            "1. **创意标题**(title)：起一个贴合语境的标题。\n" +
                            "2. **生动脚本**(audioScript)：包含地道对话或独白，长度和语速要与目标阶段匹配。\n" +
                            "3. **专业考题**(questions)：每段出5道选择题，必须完成 %d 段。\n" +
                            "4. 每道题必须包含：text(题干), options(4个选项), correct(正确选项索引0-3), explanation(解析)。\n" +
                            "返回纯JSON：{\"passages\":[{\"title\":\"...\", \"audioScript\":\"...\", \"questions\":[{\"text\":\"...\", \"options\":[\"...\"], \"correct\":0, \"explanation\":\"...\"}]}]}\n",
                    "听力生成-" + ExamTypeSupport.getPromptDescriptionSuffix(effectiveType) + "用户提示词");
            String userPrompt = String.format(userPromptTemplate, examLabel, requestedCount, effectiveDifficulty,
                    requestedCount);

            String content = aiModelInvocationService.callLLM(systemPrompt, userPrompt, "GENERATE_LISTENING");
            content = cleanJsonResponse(content);

            Map<String, Object> jsonResult = JSONUtil.parseObj(content);
            aiQuotaAndBudgetService.commitAiQuota(quotaReservation, "AI 听力生成");

            try {
                if (StpUtil.isLogin()) {
                    Long userId = StpUtil.getLoginIdAsLong();
                    Object passagesObj = jsonResult.get("passages");
                    if (passagesObj instanceof Iterable) {
                        for (Object pObj : (Iterable<?>) passagesObj) {
                            if (pObj instanceof Map) {
                                Map<?, ?> p = (Map<?, ?>) pObj;
                                ListeningMaterial lm = new ListeningMaterial();
                                lm.setUserId(userId);
                                String aiTitle = (String) p.get("title");
                                if (aiTitle != null && !aiTitle.isEmpty() && !aiTitle.contains("null")
                                        && !aiTitle.contains("Practice")) {
                                    lm.setTitle(aiTitle);
                                } else {
                                    lm.setTitle(effectiveType.toUpperCase() + " Listening Comprehension - Passage "
                                            + (passagesObj instanceof List ? ((List<?>) passagesObj).indexOf(pObj) + 1
                                                    : ""));
                                }
                                lm.setScript((String) p.get("audioScript"));

                                Object q = p.get("questions");
                                if (q != null) {
                                    lm.setQuestions(JSONUtil.toJsonStr(q));
                                } else {
                                    lm.setQuestions("[]");
                                }

                                lm.setDifficulty(effectiveDifficulty);
                                lm.setType(effectiveType);
                                lm.setCreateTime(LocalDateTime.now());
                                listeningMaterialService.save(lm);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("保存听力失败: {}", e.getMessage());
            }

            return jsonResult;
        } catch (Exception e) {
            aiQuotaAndBudgetService.rollbackAiQuota(quotaReservation, "AI 听力生成");
            log.error("AI 生成听力失败，尝试从本地数据库获取", e);
            Map<String, Object> criteria = new HashMap<>();
            criteria.put("difficulty", effectiveDifficulty);
            criteria.put("type", effectiveType);
            criteria.put("count", requestedCount);
            Map<String, Object> res = generateFromLocal("listening", criteria);
            res.put("_from", "local");
            res.put("_fallbackReason", "api_error");
            return res;
        }
    }

    private List<ListeningMaterial> getTodayListeningMaterialsForUser(Long userId, String type, String difficulty) {
        if (userId == null) {
            return Collections.emptyList();
        }

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LambdaQueryWrapper<ListeningMaterial> wrapper = new LambdaQueryWrapper<ListeningMaterial>()
                .eq(ListeningMaterial::getUserId, userId)
                .ge(ListeningMaterial::getCreateTime, startOfDay)
                .orderByDesc(ListeningMaterial::getCreateTime);

        if (type != null && !type.isBlank()) {
            wrapper.eq(ListeningMaterial::getType, type);
        }
        if (difficulty != null && !difficulty.isBlank()) {
            wrapper.eq(ListeningMaterial::getDifficulty, difficulty);
        }

        List<ListeningMaterial> records = listeningMaterialService.list(wrapper);
        return records == null ? Collections.emptyList() : records;
    }

    private Map<String, Object> buildEmptyListeningResult(String type, String difficulty) {
        Map<String, Object> result = new HashMap<>();
        result.put("passages", new ArrayList<>());
        result.put("type", type);
        result.put("difficulty", difficulty);
        result.put("_from", "database");
        result.put("exhausted", true);
        result.put("message", "今日可用的未重复听力素材已取完");
        return result;
    }

    private List<Map<String, Object>> normalizeListeningPassages(Object passagesObj) {
        List<Map<String, Object>> normalized = new ArrayList<>();
        if (!(passagesObj instanceof Iterable<?>)) {
            return normalized;
        }

        for (Object passageObj : (Iterable<?>) passagesObj) {
            if (!(passageObj instanceof Map<?, ?>)) {
                continue;
            }
            Map<String, Object> passage = new HashMap<>();
            for (Map.Entry<?, ?> entry : ((Map<?, ?>) passageObj).entrySet()) {
                passage.put(Objects.toString(entry.getKey(), ""), entry.getValue());
            }
            if (!passage.containsKey("audioScript") && passage.containsKey("script")) {
                passage.put("audioScript", passage.get("script"));
            }
            normalized.add(passage);
        }

        return normalized;
    }

    @Override
    public Map<String, Object> getDailyListeningLesson() {
        Long userId = StpUtil.isLogin() ? StpUtil.getLoginIdAsLong() : null;
        String dailyType = "hub_daily";

        if (userId != null) {
            ListeningMaterial existingDaily = listeningMaterialService.getOne(new LambdaQueryWrapper<ListeningMaterial>()
                    .eq(ListeningMaterial::getUserId, userId)
                    .eq(ListeningMaterial::getType, dailyType)
                    .ge(ListeningMaterial::getCreateTime, LocalDate.now().atStartOfDay())
                    .orderByDesc(ListeningMaterial::getCreateTime)
                    .last("LIMIT 1"));
            if (existingDaily != null) {
                return buildListeningLessonResponse(existingDaily, false);
            }
        }

        Set<String> usedFingerprints = buildListeningFingerprints(getTodayListeningMaterialsForUser(userId, null, null));
        Map<String, Object> criteria = new HashMap<>();
        criteria.put("count", 1);
        criteria.put("excludeFingerprints", usedFingerprints);

        Map<String, Object> result = getDbListening(criteria);
        Map<String, Object> passage = extractFirstListeningPassage(result);
        if (passage == null) {
            Map<String, Object> relaxedCriteria = new HashMap<>(criteria);
            relaxedCriteria.remove("excludeFingerprints");
            result = getDbListening(relaxedCriteria);
            passage = extractFirstListeningPassage(result);
        }
        if (passage == null) {
            Map<String, Object> fallbackCriteria = new HashMap<>();
            fallbackCriteria.put("count", 1);
            fallbackCriteria.put("type", dailyType);
            fallbackCriteria.put("difficulty", "mixed");
            result = generateFromLocal("listening", fallbackCriteria);
            passage = extractFirstListeningPassage(result);
        }
        if (passage == null) {
            return buildEmptyListeningResult(dailyType, "mixed");
        }

        if (userId != null) {
            ListeningMaterial saved = saveDailyListeningLesson(userId, passage, dailyType);
            if (saved != null) {
                return buildListeningLessonResponse(saved, true);
            }
        }

        Map<String, Object> fallback = new HashMap<>();
        fallback.put("lesson", passage);
        fallback.put("_from", result != null ? result.getOrDefault("_from", "database") : "database");
        fallback.put("isDaily", true);
        return fallback;
    }

    private ListeningMaterial saveDailyListeningLesson(Long userId, Map<String, Object> passage, String type) {
        try {
            ListeningMaterial material = new ListeningMaterial();
            material.setUserId(userId);
            material.setType(type);
            material.setDifficulty(Objects.toString(passage.get("difficulty"), "mixed"));
            material.setTitle(Objects.toString(passage.get("title"), "每日听力练习"));
            material.setScript(Objects.toString(passage.get("audioScript"), Objects.toString(passage.get("script"), "")));
            material.setQuestions(JSONUtil.toJsonStr(passage.get("questions")));
            material.setCreateTime(LocalDateTime.now());
            listeningMaterialService.save(material);
            return material;
        } catch (Exception e) {
            log.warn("保存学习中心每日听力失败: {}", e.getMessage());
            return null;
        }
    }

    private Map<String, Object> buildListeningLessonResponse(ListeningMaterial material, boolean newlyAssigned) {
        Map<String, Object> lesson = new HashMap<>();
        lesson.put("id", material.getId());
        lesson.put("title", material.getTitle());
        lesson.put("script", material.getScript());
        lesson.put("audioScript", material.getScript());
        lesson.put("difficulty", material.getDifficulty());
        lesson.put("type", material.getType());
        try {
            lesson.put("questions", JSONUtil.parseArray(material.getQuestions()));
        } catch (Exception e) {
            lesson.put("questions", new ArrayList<>());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("lesson", lesson);
        result.put("_from", "database");
        result.put("isDaily", true);
        result.put("newlyAssigned", newlyAssigned);
        return result;
    }

    private Set<String> buildListeningFingerprints(List<ListeningMaterial> materials) {
        Set<String> fingerprints = new HashSet<>();
        if (materials == null) {
            return fingerprints;
        }

        for (ListeningMaterial material : materials) {
            String fingerprint = buildListeningFingerprint(material.getTitle(), material.getScript());
            if (!fingerprint.isEmpty()) {
                fingerprints.add(fingerprint);
            }
        }
        return fingerprints;
    }

    private String buildListeningFingerprint(String title, String script) {
        String normalizedTitle = normalizeListeningText(title);
        String normalizedScript = normalizeListeningText(script);
        if (normalizedTitle.isEmpty() && normalizedScript.isEmpty()) {
            return "";
        }

        if (normalizedScript.length() > 240) {
            normalizedScript = normalizedScript.substring(0, 240);
        }

        return normalizedTitle + "|" + normalizedScript;
    }

    private String normalizeListeningText(String text) {
        if (text == null) {
            return "";
        }
        return text.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\u4e00-\\u9fa5\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    @Override
    @RequireVip(feature = "AI 语法生成", quotaCost = 1, minLevel = 0)
    public Map<String, Object> generateGrammar(String topic, String difficulty) {
        log.info("生成语法练习: {} / {}", topic, difficulty);

        if (!providerConfig.hasApiKey()) {
            Map<String, Object> criteria = new HashMap<>();
            criteria.put("topic", topic);
            criteria.put("difficulty", difficulty);
            return generateFromLocal("grammar", criteria);
        }

        try {
            String systemPrompt = "你是一个专业的英语语法出题专家。";
            String userPrompt = String.format(
                    "请针对'%s'这个语法点生成10道%s难度的选择题。\n" +
                            "返回JSON：{\"topic\":\"%s\", \"questions\":[{\"text\":\"题目\", \"options\":[\"A\",\"B\",\"C\",\"D\"], \"correct\":0, \"explanation\":\"解析\"}]}\n",
                    topic, difficulty, topic);

            String content = aiModelInvocationService.callLLM(systemPrompt, userPrompt, "GENERATE_GRAMMAR");
            content = cleanJsonResponse(content);

            Map<String, Object> jsonResult = JSONUtil.parseObj(content);

            try {
                // GrammarExercise usually shared or user based? Assuming public/shared for now
                // as it lacks userId
                // If it needs userId, we can't save it effectively per user without schema
                // change.
                // But let's try to save it anyway.
                GrammarExercise ge = new GrammarExercise();
                ge.setTopic((String) jsonResult.get("topic"));
                ge.setQuestions(JSONUtil.toJsonStr(jsonResult.get("questions")));
                ge.setDifficulty(difficulty);
                ge.setCreateTime(LocalDateTime.now());
                grammarExerciseService.save(ge);
            } catch (Exception e) {
                log.warn("保存语法失败: {}", e.getMessage());
            }

            return jsonResult;
        } catch (Exception e) {
            log.error("AI 生成语法练习失败，尝试从本地数据库获取", e);
            Map<String, Object> criteria = new HashMap<>();
            criteria.put("topic", topic);
            criteria.put("difficulty", difficulty);
            return generateFromLocal("grammar", criteria);
        }
    }

    /**
     * 生成口语练习题目
     * 策略：
     * 1. 优先尝试调用 AI 生成全新的题目。
     * 2. 构造 Prompt 时加入随机的“场景”和“随机因子”，确保每次题目都不一样。
     * 3. 如果 AI 调用失败或未配置 Key，则降级从本地数据库读取历史题目。
     *
     * @param type       口语类型 (e.g., "part1", "part2", "discussion")
     * @param difficulty 难度等级
     * @return 包含题目、关键词、提示的 Map
     */
    @Override
    @RequireVip(feature = "AI 口语生成", quotaCost = 1, minLevel = 0)
    public Map<String, Object> generateSpeaking(String type, String difficulty) {
        log.info("生成口语练习: {} / {}", type, difficulty);

        // 1. 优先尝试 AI 生成
        if (providerConfig.hasApiKey()) {
            try {
                String[] scenarios = {
                        "生活伙伴", "职场办公", "校园学术", "旅行发现", "科技未来", "文化传统",
                        "环境自然", "情感人际", "兴趣爱好", "健康运动", "艺术设计", "经济金融",
                        "法律道德", "媒体社交", "历史考古", "宇宙探索"
                };
                String scenario = scenarios[new Random().nextInt(scenarios.length)];
                long seed = System.currentTimeMillis();

                String systemPrompt = systemPromptService.getPromptTemplate(
                        "SPEAKING_GEN_SYSTEM_V3",
                        "你是一个富有想象力且极具专业度的英语口语题目策划专家。你的任务是根据给定的场景，生成一段新颖、有趣且符合考试要求的口语练习题。避免生成诸如 'A place you would like to visit' 或 'Favorite book' 等过于经典且重复率极高的老旧题目。",
                        "口语练习生成-系统提示词V3");

                String userPromptTemplate = systemPromptService.getPromptTemplate(
                        "SPEAKING_GEN_USER_V3",
                        "请生成一道%s类型、%s难度的口语练习题目。\n" +
                                "【切入场景】：%s (请务必深度挖掘此场景，生成一个具有独特背景或特定挑战的题目)\n" +
                                "【随机因子】：%d (请确保本次生成的结果与以往完全不同)\n" +
                                "【要求】：题目描述要丰富，能够引导用户进行多维度的表达。返回内容必须是纯正地道的英语。\n" +
                                "返回JSON格式：{\"topic\":\"题目\", \"description\":\"描述\", \"keywords\":[\"关键词1\",\"关键词2\",\"关键词3\"], \"hints\":[\"提示1\",\"提示2\"], \"timeLimit\":120}\n",
                        "口语练习生成-用户提示词V3");

                String userPrompt = String.format(userPromptTemplate, type, difficulty, scenario, seed);

                String content = aiModelInvocationService.callLLM(systemPrompt, userPrompt, "GENERATE_SPEAKING");
                content = cleanJsonResponse(content);

                Map<String, Object> jsonResult = JSONUtil.parseObj(content);

                try {
                    SpeakingTopic st = new SpeakingTopic();
                    // 如果 SpeakingTopic 后续增加了 userId 字段，请在此设置
                    // st.setUserId(StpUtil.getLoginIdAsLong());
                    st.setTitle((String) jsonResult.get("topic"));
                    st.setQuestion((String) jsonResult.get("description"));

                    // 保存 keywords
                    Object keywords = jsonResult.get("keywords");
                    if (keywords != null) {
                        st.setKeywords(JSONUtil.toJsonStr(keywords));
                    }

                    // 保存 hints 为 tips（兼容 tips 字段）
                    Object hints = jsonResult.get("hints");
                    if (hints == null) {
                        hints = jsonResult.get("tips"); // fallback to tips if hints not present
                    }
                    if (hints != null) {
                        st.setTips(JSONUtil.toJsonStr(hints));
                    }

                    st.setType(type);
                    st.setDifficulty(difficulty);
                    st.setCreateTime(LocalDateTime.now());
                    speakingTopicService.save(st);

                    // 将保存后的ID设置到返回结果中
                    jsonResult.put("id", st.getId());
                } catch (Exception e) {
                    log.warn("保存口语失败: {}", e.getMessage());
                }

                return jsonResult;
            } catch (Exception e) {
                log.error("AI 生成口语练习失败，尝试从数据库获取", e);
            }
        } else {
            log.info("未配置 AI API Key，从数据库获取题目");
        }

        // 2. AI 失败或未配置，从数据库随机选择
        Map<String, Object> criteria = new HashMap<>();
        criteria.put("type", type);
        criteria.put("difficulty", difficulty);
        return generateFromLocal("speaking", criteria);
    }

    /**
     * AI 口语评测
     * 对用户的口语转录文本进行多维度评分（发音、流利度、语法、词汇）。
     *
     * @param topic         原始题目
     * @param transcription 用户录音转录的文本
     * @return 评分结果和反馈建议
     */
    @Override
    @RequireVip(feature = "AI 口语评测", quotaCost = 3, minLevel = 0)
    public Map<String, Object> evaluateSpeaking(String topic, String transcription) {
        log.info("评估口语: {}", topic);

        if (!providerConfig.hasApiKey()) {
            return aiFallbackContentGenerator.generateMockSpeakingEvaluation();
        }

        try {
            String systemPrompt = "你是一个专业的英语口语评分老师。";
            String userPrompt = String.format(
                    "请评估以下口语回答（题目：%s）：\n\n%s\n\n" +
                            "请重点判断回答是否围绕题目、表达是否自然、语法和词汇是否得当，并给出具体改进建议。" +
                            "返回JSON：{\"score\":80, \"pronunciation\":85, \"fluency\":75, \"grammar\":80, \"vocabulary\":85, \"relevance\":82, \"feedback\":\"详细反馈\", \"suggestions\":[\"建议1\",\"建议2\",\"建议3\"]}\n",
                    topic, transcription);

            String response = aiModelInvocationService.callLLM(systemPrompt, userPrompt, "EVALUATE_SPEAKING");
            response = cleanJsonResponse(response);
            Map<String, Object> rawResult = JSONUtil.parseObj(response);
            return normalizeSpeakingEvaluation(rawResult, topic, transcription);
        } catch (Exception e) {
            log.error("AI 评估口语失败，使用 Mock 数据", e);
            return aiFallbackContentGenerator.generateMockSpeakingEvaluation();
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> normalizeSpeakingEvaluation(Map<String, Object> rawResult, String topic,
            String transcription) {
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> dimensions = rawResult.get("dimensions") instanceof Map<?, ?> dims
                ? (Map<String, Object>) dims
                : Collections.emptyMap();

        int pronunciation = pickScore(rawResult.get("pronunciation"), dimensions.get("pronunciation"), 78);
        int fluency = pickScore(rawResult.get("fluency"), dimensions.get("fluency"), 76);
        int grammar = pickScore(rawResult.get("grammar"), dimensions.get("grammar"), 75);
        int vocabulary = pickScore(rawResult.get("vocabulary"), rawResult.get("lexicalResource"),
                dimensions.get("vocabulary"), dimensions.get("lexicalResource"), 77);
        int relevance = pickScore(rawResult.get("relevance"), dimensions.get("relevance"), 80);
        int heuristicRelevance = computeSpeakingRelevance(topic, transcription);
        relevance = Math.min(relevance, heuristicRelevance);

        int averagedScore = Math.round((pronunciation + fluency + grammar + vocabulary + relevance) / 5.0f);
        int score = pickScore(rawResult.get("score"), averagedScore);
        if (relevance <= 0) {
            score = 0;
        } else if (relevance <= 25) {
            score = Math.min(score, 45);
        } else if (relevance <= 40) {
            score = Math.min(score, 60);
        } else if (relevance <= 55) {
            score = Math.min(score, 75);
        }

        String feedback = extractSpeakingFeedback(rawResult);
        if (feedback.isBlank()) {
            feedback = String.format("你的回答与题目“%s”基本相关，整体表达完成度较好。建议继续围绕题干补充细节，并提升语法准确性与表达连贯性。", topic);
        }

        List<String> suggestions = extractSpeakingSuggestions(rawResult);
        if (suggestions.isEmpty()) {
            suggestions = List.of(
                    "先用 2-3 句明确回应题目核心要求，再补充具体细节。",
                    "尽量减少停顿，使用 because, for example, however 等连接表达增强连贯性。",
                    "复述答案后检查时态、主谓一致和常见搭配，提升语法与词汇准确度。");
        }

        if (relevance <= 0) {
            feedback = "你的回答与题目要求完全不相干，本次作答按 0 分处理。当前最核心的问题不是语言形式，而是没有回应题目本身。请先围绕题干直接作答，再补充细节。";
            suggestions = List.of(
                    "先用一句话直接回答题目问的对象、事件或场景，不要先讲无关内容。",
                    "重新作答前，先划出题干里的 3 个关键词，并确保答案中明确覆盖它们。",
                    "如果不确定是否切题，先用中文确认题意，再用英文围绕题干组织回答。");
        } else if (relevance <= 25) {
            feedback = "你的回答与题目要求明显不相关，当前主要问题不是语言形式，而是没有围绕题干作答。请先准确回应题目核心，再展开细节。";
            suggestions = List.of(
                    "先复述题目关键词，确保回答对象、事件或场景与题干一致。",
                    "开头第一句直接回应题目要求，不要先讲无关经历。",
                    "重新作答前，先用 3 个要点列出你必须覆盖的题干信息。");
        } else if (relevance <= 40) {
            feedback = "你的回答只有部分内容贴合题目，存在明显跑题。建议先紧扣题目核心要求，再补充例子和细节。";
            suggestions = List.of(
                    "先回答题目最核心的问题，再补充 supporting details。",
                    "多使用题干中的人物、地点、时间或事件关键词，减少无关展开。",
                    "结尾回扣题目，说明你的回答为什么符合题干要求。");
        }

        result.put("score", score);
        result.put("pronunciation", pronunciation);
        result.put("fluency", fluency);
        result.put("grammar", grammar);
        result.put("vocabulary", vocabulary);
        result.put("relevance", relevance);
        result.put("feedback", feedback);
        result.put("suggestions", suggestions);
        return result;
    }

    private int computeSpeakingRelevance(String topic, String transcription) {
        Set<String> promptTokens = extractSpeakingTopicTokens(topic);
        Set<String> answerTokens = extractMeaningfulEnglishTokens(transcription);

        if (answerTokens.isEmpty()) {
            return 0;
        }
        if (promptTokens.isEmpty()) {
            return 75;
        }

        Set<String> overlap = new HashSet<>(promptTokens);
        overlap.retainAll(answerTokens);

        double promptCoverage = (double) overlap.size() / promptTokens.size();
        double answerCoverage = (double) overlap.size() / answerTokens.size();
        double score = promptCoverage * 70.0 + answerCoverage * 30.0;

        if (overlap.isEmpty()) {
            return 0;
        }
        if (overlap.size() == 1 && promptTokens.size() >= 4) {
            score = Math.min(score, 20);
        }
        if (promptCoverage < 0.15 && answerCoverage < 0.15) {
            score = Math.min(score, 20);
        }

        return clampScore(score);
    }

    private Set<String> extractSpeakingTopicTokens(String topicContext) {
        if (topicContext == null || topicContext.isBlank()) {
            return Collections.emptySet();
        }

        String normalized = topicContext
                .replace("题目:", " ")
                .replace("题干:", " ")
                .replace("关键词:", " ")
                .replace("提示:", " ")
                .replace("Topic:", " ")
                .replace("Prompt:", " ")
                .replace("Keywords:", " ")
                .replace("Hints:", " ");
        return extractMeaningfulEnglishTokens(normalized);
    }

    private Set<String> extractMeaningfulEnglishTokens(String text) {
        if (text == null || text.isBlank()) {
            return Collections.emptySet();
        }

        return Arrays.stream(text.toLowerCase(Locale.ROOT).split("[^a-z]+"))
                .map(String::trim)
                .filter(token -> token.length() >= 3)
                .filter(token -> !SPEAKING_RELEVANCE_STOP_WORDS.contains(token))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private int pickScore(Object primary, Object... fallbacks) {
        double score = getScoreOrDefault(primary);
        if (score > 0) {
            return clampScore(score);
        }

        for (Object fallback : fallbacks) {
            score = getScoreOrDefault(fallback);
            if (score > 0) {
                return clampScore(score);
            }
        }

        return 75;
    }

    private int clampScore(double score) {
        return Math.max(0, Math.min(100, (int) Math.round(score)));
    }

    private String extractSpeakingFeedback(Map<String, Object> rawResult) {
        String directFeedback = stringifyFeedbackContent(rawResult.get("feedback"));
        if (!directFeedback.isBlank()) {
            return directFeedback;
        }

        for (String key : List.of("comment", "comments", "overallFeedback", "summary", "evaluation")) {
            String value = stringifyFeedbackContent(rawResult.get(key));
            if (!value.isBlank()) {
                return value;
            }
        }

        List<String> strengths = extractSpeakingSuggestions(Collections.singletonMap("suggestions", rawResult.get("strengths")));
        List<String> weaknesses = extractSpeakingSuggestions(Collections.singletonMap("suggestions", rawResult.get("weaknesses")));
        if (!strengths.isEmpty() || !weaknesses.isEmpty()) {
            StringBuilder builder = new StringBuilder();
            if (!strengths.isEmpty()) {
                builder.append("优点：").append(String.join("；", strengths)).append("。");
            }
            if (!weaknesses.isEmpty()) {
                builder.append("可提升点：").append(String.join("；", weaknesses)).append("。");
            }
            return builder.toString().trim();
        }

        return "";
    }

    @SuppressWarnings("unchecked")
    private String stringifyFeedbackContent(Object feedback) {
        if (feedback == null) {
            return "";
        }
        if (feedback instanceof CharSequence sequence) {
            return sequence.toString().trim();
        }
        if (feedback instanceof Collection<?> collection) {
            return collection.stream()
                    .map(item -> {
                        if (item instanceof Map<?, ?> map) {
                            Object text = map.get("text");
                            return text == null ? "" : text.toString().trim();
                        }
                        return item == null ? "" : item.toString().trim();
                    })
                    .filter(value -> value != null && !value.isBlank())
                    .collect(Collectors.joining(" "));
        }
        return feedback.toString().trim();
    }

    @SuppressWarnings("unchecked")
    private List<String> extractSpeakingSuggestions(Map<String, Object> rawResult) {
        for (String key : List.of("suggestions", "tips", "advice", "recommendations")) {
            Object value = rawResult.get(key);
            if (value instanceof Collection<?> collection) {
                List<String> result = collection.stream()
                        .map(item -> {
                            if (item instanceof Map<?, ?> map) {
                                Object text = map.get("text");
                                return text == null ? "" : text.toString().trim();
                            }
                            return item == null ? "" : item.toString().trim();
                        })
                        .filter(item -> item != null && !item.isBlank())
                        .collect(Collectors.toList());
                if (!result.isEmpty()) {
                    return result;
                }
            }
            if (value instanceof CharSequence sequence && !sequence.toString().isBlank()) {
                return Arrays.stream(sequence.toString().split("[\\r\\n;；]+"))
                        .map(String::trim)
                        .filter(item -> !item.isBlank())
                        .collect(Collectors.toList());
            }
        }
        return new ArrayList<>();
    }

    @Override
    public Map<String, Object> generateFromLocal(String type, Map<String, Object> criteria) {
        log.info("从本地数据库获取降级内容: {} / {}", type, criteria);

        try {
            Map<String, Object> result = switch (type.toLowerCase()) {
                case "reading" -> getDbReading(criteria);
                case "writing" -> getDbWriting(criteria);
                case "listening" -> getDbListening(criteria);
                case "grammar" -> getDbGrammar(criteria);
                case "speaking" -> getDbSpeaking(criteria);
                default -> null;
            };
            if (result != null)
                return result;
        } catch (Exception e) {
            log.warn("从数据库获取降级内容失败: {}, 将使用内置模拟数据", e.getMessage());
        }

        // Final fallback to mock data if DB query fails or is empty
        Map<String, Object> mockResult = switch (type.toLowerCase()) {
            case "reading" -> aiFallbackContentGenerator.generateMockReading((String) criteria.getOrDefault("difficulty", "medium"));
            case "writing" -> aiFallbackContentGenerator.generateMockWriting(
                    (String) criteria.getOrDefault("examType", "CET4"),
                    (String) criteria.getOrDefault("difficulty", "medium"));
            case "listening" -> {
                Object cObj = criteria.get("count");
                int c = 1;
                if (cObj instanceof Integer)
                    c = (Integer) cObj;
                else if (cObj != null)
                    c = Integer.parseInt(cObj.toString());
                yield aiFallbackContentGenerator.generateMockListening((String) criteria.getOrDefault("difficulty", "medium"), c);
            }
            case "grammar" -> aiFallbackContentGenerator.generateMockGrammar((String) criteria.getOrDefault("topic", "时态"), "medium");
            case "speaking" -> aiFallbackContentGenerator.generateMockSpeaking((String) criteria.getOrDefault("type", "描述"));
            default -> new HashMap<>();
        };
        mockResult.put("_from", "mock");
        mockResult.put("message", "AI quota exceeded, using local mock data");
        return mockResult;
    }

    private Map<String, Object> getDbReading(Map<String, Object> criteria) {
        String difficulty = (String) criteria.get("difficulty");
        String category = (String) criteria.get("category");
        LambdaQueryWrapper<ReadingArticle> wrapper = new LambdaQueryWrapper<>();
        if (difficulty != null)
            wrapper.eq(ReadingArticle::getDifficulty, difficulty);
        if (category != null)
            wrapper.eq(ReadingArticle::getCategory, category);
        wrapper.last("ORDER BY RAND() LIMIT 1");

        ReadingArticle article = readingArticleService.getOne(wrapper);
        if (article == null)
            return null;

        Map<String, Object> result = new HashMap<>();
        result.put("title", article.getTitle());
        result.put("passage", article.getContent());
        result.put("questions", JSONUtil.parseArray(article.getQuestions()));
        result.put("difficulty", article.getDifficulty());
        result.put("category", article.getCategory());
        result.put("_from", "database");
        return result;
    }

    private Map<String, Object> getDbWriting(Map<String, Object> criteria) {
        String examType = normalizeExamType((String) criteria.get("examType"));
        String mode = (String) criteria.get("mode");
        String difficulty = (String) criteria.get("difficulty");
        LambdaQueryWrapper<WritingTopic> wrapper = new LambdaQueryWrapper<>();
        applyExamTypeFilter(wrapper, examType);
        if (mode != null)
            wrapper.eq(WritingTopic::getMode, mode);
        if (difficulty != null)
            wrapper.eq(WritingTopic::getDifficulty, difficulty);
        wrapper.last("ORDER BY RAND() LIMIT 1");

        WritingTopic topic = writingTopicService.getOne(wrapper);
        if (topic == null)
            return null;

        Map<String, Object> result = new HashMap<>();
        result.put("id", topic.getId());
        result.put("title", topic.getTitle());
        result.put("prompt", topic.getPrompt());
        result.put("minWords", topic.getMinWords());
        try {
            result.put("tips", JSONUtil.parseArray(topic.getTips()));
        } catch (Exception e) {
            result.put("tips", new ArrayList<>());
        }
        result.put("timeLimit", 30);
        result.put("difficulty", topic.getDifficulty());
        result.put("_from", "database");
        return result;
    }

    private Map<String, Object> getDbListening(Map<String, Object> criteria) {
        String difficulty = (String) criteria.get("difficulty");
        String type = (String) criteria.get("type");
        Set<String> excludeFingerprints = new HashSet<>();
        Object rawExcludeFingerprints = criteria.get("excludeFingerprints");
        if (rawExcludeFingerprints instanceof Iterable<?>) {
            for (Object fingerprint : (Iterable<?>) rawExcludeFingerprints) {
                if (fingerprint != null) {
                    excludeFingerprints.add(String.valueOf(fingerprint));
                }
            }
        }

        Object countObj = criteria.get("count");
        int count = 1;
        if (countObj instanceof Integer)
            count = (Integer) countObj;
        else if (countObj != null)
            count = Integer.parseInt(countObj.toString());

        List<ListeningMaterial> list = new ArrayList<>();
        Set<Long> selectedIds = new HashSet<>();
        list.addAll(fetchDbListeningCandidates(difficulty, type, count, excludeFingerprints, selectedIds));
        if (list.size() < count && type != null && !type.isBlank()) {
            list.addAll(fetchDbListeningCandidates(difficulty, null, count - list.size(), excludeFingerprints, selectedIds));
        }
        if (list.size() < count && difficulty != null && !difficulty.isBlank()) {
            list.addAll(fetchDbListeningCandidates(null, null, count - list.size(), excludeFingerprints, selectedIds));
        }
        if (list.isEmpty()) {
            return null;
        }

        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> passages = new ArrayList<>();

        for (ListeningMaterial lm : list) {
            String fingerprint = buildListeningFingerprint(lm.getTitle(), lm.getScript());
            if (!fingerprint.isEmpty() && excludeFingerprints.contains(fingerprint)) {
                continue;
            }
            Map<String, Object> p = new HashMap<>();
            p.put("audioScript", lm.getScript());
            p.put("title", lm.getTitle());
            try {
                p.put("questions", JSONUtil.parseArray(lm.getQuestions()));
            } catch (Exception e) {
                p.put("questions", new ArrayList<>());
            }
            passages.add(p);
            if (passages.size() >= count) {
                break;
            }
        }

        if (passages.isEmpty())
            return null;

        result.put("passages", passages);
        result.put("_from", "database");
        return result;
    }

    private Map<String, Object> extractFirstListeningPassage(Map<String, Object> result) {
        if (result == null) {
            return null;
        }
        return normalizeListeningPassages(result.get("passages")).stream().findFirst().orElse(null);
    }

    private List<ListeningMaterial> fetchDbListeningCandidates(String difficulty, String type, int expectedCount,
            Set<String> excludeFingerprints, Set<Long> selectedIds) {
        if (expectedCount <= 0) {
            return Collections.emptyList();
        }

        LambdaQueryWrapper<ListeningMaterial> wrapper = new LambdaQueryWrapper<>();
        if (difficulty != null && !difficulty.isBlank()) {
            wrapper.eq(ListeningMaterial::getDifficulty, difficulty);
        }
        if (type != null && !type.isBlank()) {
            wrapper.eq(ListeningMaterial::getType, type);
        }

        // 过滤掉明显脏数据；Practice 标题仍然保留，避免把可用题目误筛掉。
        wrapper.notLike(ListeningMaterial::getTitle, "%:%:%")
                .notLike(ListeningMaterial::getTitle, "%null%");
        wrapper.last("ORDER BY RAND() LIMIT " + Math.max(expectedCount * 6, 8));

        List<ListeningMaterial> candidates = listeningMaterialService.list(wrapper);
        if (candidates == null || candidates.isEmpty()) {
            return Collections.emptyList();
        }

        List<ListeningMaterial> selected = new ArrayList<>();
        for (ListeningMaterial material : candidates) {
            if (material == null) {
                continue;
            }
            Long materialId = material.getId();
            if (materialId != null && !selectedIds.add(materialId)) {
                continue;
            }

            String fingerprint = buildListeningFingerprint(material.getTitle(), material.getScript());
            if (!fingerprint.isEmpty() && excludeFingerprints.contains(fingerprint)) {
                continue;
            }

            selected.add(material);
            if (selected.size() >= expectedCount) {
                break;
            }
        }
        return selected;
    }

    private Map<String, Object> getDbGrammar(Map<String, Object> criteria) {
        String topic = (String) criteria.get("topic");
        LambdaQueryWrapper<GrammarExercise> wrapper = new LambdaQueryWrapper<>();
        if (topic != null)
            wrapper.eq(GrammarExercise::getTopic, topic);
        wrapper.last("ORDER BY RAND() LIMIT 1");

        GrammarExercise ge = grammarExerciseService.getOne(wrapper);
        if (ge == null)
            return null;

        Map<String, Object> result = new HashMap<>();
        result.put("topic", ge.getTopic());
        result.put("questions", JSONUtil.parseArray(ge.getQuestions()));
        result.put("_from", "database");
        return result;
    }

    private Map<String, Object> getDbSpeaking(Map<String, Object> criteria) {
        String type = (String) criteria.get("type");
        LambdaQueryWrapper<SpeakingTopic> wrapper = new LambdaQueryWrapper<>();
        if (type != null)
            wrapper.eq(SpeakingTopic::getType, type);
        wrapper.last("ORDER BY RAND() LIMIT 1");

        SpeakingTopic st = speakingTopicService.getOne(wrapper);
        if (st == null)
            return null;

        Map<String, Object> result = new HashMap<>();
        result.put("id", st.getId());
        result.put("topic", st.getTitle());
        result.put("description", st.getQuestion());
        result.put("keywords", JSONUtil.parseArray(st.getKeywords()));
        result.put("hints", JSONUtil.parseArray(st.getTips()));
        result.put("timeLimit", 120);
        result.put("_from", "database");
        return result;
    }

    @Override
    public Map<String, Object> getRecentReadings(int page, int size) {
        try {
            if (!StpUtil.isLogin())
                return Map.of("records", Collections.emptyList(), "total", 0L);
            Long userId = StpUtil.getLoginIdAsLong();
            Page<ReadingArticle> pageParam = new Page<>(page, size);
            IPage<ReadingArticle> result = readingArticleService.page(pageParam,
                    new LambdaQueryWrapper<ReadingArticle>()
                            .eq(ReadingArticle::getUserId, userId)
                            .orderByDesc(ReadingArticle::getCreateTime));

            List<Map<String, Object>> list = result.getRecords().stream().map(a -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", a.getId());
                m.put("title", a.getTitle());
                m.put("content", a.getContent());
                m.put("passage", a.getContent());
                m.put("questions", JSONUtil.parseArray(a.getQuestions()));
                m.put("difficulty", a.getDifficulty());
                m.put("category", a.getCategory());
                m.put("source", "AI 生成");
                m.put("createTime", a.getCreateTime());
                return m;
            }).collect(Collectors.toList());
            return Map.of("records", list, "total", result.getTotal());
        } catch (Exception e) {
            log.error("获取阅读历史失败", e);
            return Map.of("records", Collections.emptyList(), "total", 0L);
        }
    }

    @Override
    public Map<String, Object> getRecentListenings(int page, int size) {
        if (!StpUtil.isLogin())
            return Map.of("records", Collections.emptyList(), "total", 0L);
        Long userId = StpUtil.getLoginIdAsLong();
        Page<ListeningMaterial> pageParam = new Page<>(page, size);
        IPage<ListeningMaterial> result = listeningMaterialService.page(pageParam,
                new LambdaQueryWrapper<ListeningMaterial>()
                        .eq(ListeningMaterial::getUserId, userId)
                        .orderByDesc(ListeningMaterial::getCreateTime));

        List<Map<String, Object>> list = result.getRecords().stream().map(a -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", a.getId());
            m.put("title", a.getTitle());
            m.put("script", a.getScript());
            m.put("questions", JSONUtil.parseArray(a.getQuestions()));
            m.put("difficulty", a.getDifficulty());
            m.put("type", a.getType());
            m.put("createTime", a.getCreateTime());
            return m;
        }).collect(Collectors.toList());
        return Map.of("records", list, "total", result.getTotal());
    }

    @Override
    public Map<String, Object> getRecentGrammars(int page, int size) {
        return learningRecordService.getAnswerHistory("grammar", page, size);
    }

    @Override
    public Map<String, Object> getRecentSpeakings(int page, int size) {
        return learningRecordService.getAnswerHistory("speaking", page, size);
    }

    @Override
    public Map<String, Object> getRecentWritings(int page, int size) {
        return learningRecordService.getAnswerHistory("writing", page, size);
    }

    @Override
    @RequireVip(feature = "AI 词汇深度解析", quotaCost = 1, minLevel = 0)
    public Map<String, Object> generateVocabularyDetails(String word, String examType) {
        String effectiveExamType = ExamTypeSupport.normalizeOrDefault(examType, "cet4");
        String examLabel = ExamTypeSupport.getDisplayLabel(effectiveExamType);
        log.info("生成 AI 词汇深度解析: {} / {}", word, effectiveExamType);

        String systemPrompt = systemPromptService.getPromptTemplate(
                "VOCAB_DETAIL_SYSTEM",
                "你是一个博古通今的词源学家和记忆大师。你需要为学生提供深度、有趣的单词解析。",
                "词汇详情-系统提示词");

        String userPromptTemplate = systemPromptService.getPromptTemplate(
                ExamTypeSupport.resolvePromptKey("VOCAB_DETAIL_USER", effectiveExamType),
                "请解析单词：'%s' (目标等级：%s)。\n" +
                        "阶段说明：" + ExamTypeSupport.getVocabularyGuidance(effectiveExamType) + "\n" +
                        "要求返回 JSON 格式，包含：\n" +
                        "- word: 单词\n" +
                        "- phonetic: 音标\n" +
                        "- definition: 英文定义\n" +
                        "- translation: 中文翻译\n" +
                        "- etymology: 词源故事\n" +
                        "- mnemonics: 趣味助记法\n" +
                        "- example: 例句\n" +
                        "- exampleTranslation: 例句翻译\n" +
                        "- collocations: [常用搭配数组]\n",
                "词汇详情-" + ExamTypeSupport.getPromptDescriptionSuffix(effectiveExamType) + "用户提示词");

        String userPrompt = String.format(userPromptTemplate, word, examLabel);

        try {
            String response = aiModelInvocationService.callLLM(systemPrompt, userPrompt, "GENERATE_VOCAB_DETAIL");
            return JSONUtil.parseObj(cleanJsonResponse(response));
        } catch (Exception e) {
            log.error("AI 词汇解析失败", e);
            // Never turn a provider/network/JSON failure into vocabulary content.
            // Callers must be able to distinguish a real AI response from a failed request.
            throw new IllegalStateException("AI 词汇解析失败，请稍后重试", e);
        }
    }

    @Override
    public Map<String, Object> getLastAnalysis(Long userId) {
        return learningAnalysisService.getLastAnalysis(userId);
    }

    @Override
    public Map<String, Object> generateLearningAnalysis(Long userId, Map<String, Object> statistics) {
        return learningAnalysisService.generateLearningAnalysis(userId, statistics);
    }

    private int safeInt(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value == null) {
            return 0;
        }
        try {
            return Integer.parseInt(String.valueOf(value));
        } catch (Exception ignored) {
            return 0;
        }
    }

    private long safeLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value == null) {
            return 0L;
        }
        try {
            return Long.parseLong(String.valueOf(value));
        } catch (Exception ignored) {
            return 0L;
        }
    }

    private double safeDouble(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        if (value == null) {
            return 0.0;
        }
        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (Exception ignored) {
            return 0.0;
        }
    }

    /**
     * 计算预测考试分数
     */
    private int calculatePredictScore(int overall) {
        return AnalysisMathUtils.calculatePredictScore(overall);
    }

    /**
     * 生成能力分布数据
     */
    private List<Map<String, Object>> generateAbilities(Map<String, Object> statistics) {
        List<Map<String, Object>> abilities = new ArrayList<>();

        // 优先从预计算好的 abilityStats 中获取数据（包含推理数据）
        @SuppressWarnings("unchecked")
        Map<String, Map<String, Object>> abilityStats = (Map<String, Map<String, Object>>) statistics
                .get("abilityStats");

        // 如果没有预计算数据，降级使用 raw byType 数据
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> byType = (List<Map<String, Object>>) statistics.get("byType");
        Map<String, Map<String, Object>> typeStats = new HashMap<>();
        if (byType != null) {
            for (Map<String, Object> stat : byType) {
                String type = (String) stat.get("content_type");
                if (type != null)
                    typeStats.put(type, stat);
            }
        }

        // 1. 阅读
        abilities.add(createAbilityItem("阅读理解", "#818cf8", getAbilityValue(abilityStats, typeStats, "reading"), 85));

        // 2. 听力
        abilities.add(createAbilityItem("听力理解", "#34d399", getAbilityValue(abilityStats, typeStats, "listening"), 80));

        // 3. 语法
        abilities.add(createAbilityItem("语法掌握", "#f59e0b", getAbilityValue(abilityStats, typeStats, "grammar"), 90));

        // 4. 词汇
        abilities.add(createAbilityItem("词汇掌握", "#a78bfa", getAbilityValue(abilityStats, typeStats, "vocabulary"), 80));

        // 5. 写作
        abilities.add(createAbilityItem("写作表达", "#f43f5e", getAbilityValue(abilityStats, typeStats, "writing"), 70));

        // 6. 口语
        abilities.add(createAbilityItem("口语流利", "#06b6d4", getAbilityValue(abilityStats, typeStats, "speaking"), 65));

        return abilities;
    }

    private int getAbilityValue(Map<String, Map<String, Object>> abilityStats,
            Map<String, Map<String, Object>> typeStats, String key) {
        if (typeStats != null && typeStats.containsKey(key)) {
            return calculateTypeAccuracy(typeStats.get(key));
        }
        if (abilityStats != null && abilityStats.containsKey(key)) {
            Object score = abilityStats.get(key).get("avgScore");
            if (score instanceof Number)
                return Math.max(0, Math.min(100, ((Number) score).intValue()));
        }
        return 0;
    }

    private int calculateVocabSizeScore(Map<String, Object> vocabStat) {
        if (vocabStat == null)
            return 0;
        Object correctObj = vocabStat.get("correctCount");
        int masteredCount = (correctObj instanceof Number) ? ((Number) correctObj).intValue() : 0;

        // 设定目标：2000 词为阶段性满分（雷达图进度）
        int sizeScore = (int) ((masteredCount * 100.0) / 2000);
        int accuracy = calculateTypeAccuracy(vocabStat);

        // 综合得分：80% 看数量，20% 看正确率
        return Math.min(100, (int) (sizeScore * 0.8 + accuracy * 0.2));
    }

    private Map<String, Object> createAbilityItem(String name, String color, int current, int target) {
        Map<String, Object> item = new HashMap<>();
        item.put("name", name);
        item.put("color", color);
        item.put("current", current);
        item.put("target", target);
        return item;
    }

    private int calculateTypeAccuracy(Map<String, Object> typeStat) {
        if (typeStat == null)
            return 0;

        Object totalObj = typeStat.get("count");
        Object correctObj = typeStat.get("correctCount");

        if (totalObj instanceof Number && correctObj instanceof Number) {
            int total = ((Number) totalObj).intValue();
            int correct = ((Number) correctObj).intValue();
            if (total > 0) {
                return (int) ((correct * 100.0) / total);
            }
        }
        return (int) getScoreOrDefault(typeStat.get("avgScore"));
    }

    private double getScoreOrDefault(Object scoreObj) {
        if (scoreObj instanceof Number)
            return ((Number) scoreObj).doubleValue();
        return 0.0;
    }

    /**
     * 生成薄弱点诊断和建议
     */
    private List<Map<String, Object>> generateWeakPoints(Map<String, Object> statistics) {
        List<Map<String, Object>> weakPoints = new ArrayList<>();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> byType = (List<Map<String, Object>>) statistics.get("byType");

        if (byType != null) {
            for (Map<String, Object> stat : byType) {
                String type = (String) stat.get("content_type");
                int accuracy = calculateTypeAccuracy(stat);

                // 获取练习次数
                int count = 0;
                Object countObj = stat.get("count");
                if (countObj instanceof Number) {
                    count = ((Number) countObj).intValue();
                }

                // 添加正确率低于60%的（包括0分但已练习过的）
                if (count > 0 && accuracy < 60) {
                    weakPoints.add(createWeakPointItem(type, accuracy, count));
                }
            }
        }

        weakPoints.sort(Comparator
                .comparingInt((Map<String, Object> item) -> safeInt(item.get("score")))
                .thenComparing((Map<String, Object> item) -> -safeInt(item.get("practiceCount"))));
        return weakPoints;
    }

    private Map<String, Object> createWeakPointItem(String type, int score, int practiceCount) {
        Map<String, Object> item = new HashMap<>();

        String title;
        String advice;
        String color = "#ef4444";

        switch (type) {
            case "reading":
                title = "阅读理解能力";
                advice = "建议每天坚持阅读英文文章，重点提升快速定位关键信息的能力。可以从简单的新闻类文章开始，逐步过渡到学术性文章。";
                break;
            case "listening":
                title = "听力理解能力";
                advice = "建议每天进行30分钟听力练习，可以从慢速英语开始，逐步提高到正常语速。重点训练抓取关键词和理解大意的能力。";
                break;
            case "grammar":
                title = "语法运用能力";
                advice = "建议系统复习语法知识点，特别是时态、语态和从句。可以通过大量练习题来巩固，并注意总结易错点。";
                break;
            case "vocabulary":
                title = "词汇掌握能力";
                advice = "建议制定每日背词计划，使用间隔重复记忆法。重点记忆高频词汇，并通过阅读和写作来实际运用，加深记忆。";
                break;
            case "writing":
                title = "书面表达能力";
                advice = "建议多读多写，积累高级句型和连接词。可以从模仿范文开始，注意逻辑连贯性和用词准确性。";
                break;
            case "speaking":
                title = "口语表达能力";
                advice = "建议多听多模仿，提高发音准确度和流利度。尝试用英语描述日常生活，或者找语伴进行对话练习。";
                break;
            default:
                title = type + "能力";
                advice = "建议加强该模块的练习，多做相关题目，总结规律和技巧。";
        }

        item.put("title", title);
        item.put("score", score);
        item.put("practiceCount", practiceCount);
        item.put("advice", String.format(Locale.ROOT, "最近该模块已记录 %d 次练习，当前正确率 %d%%。%s", practiceCount, score, advice));
        item.put("color", color);

        return item;
    }

    // ==================== 辅助方法 ====================

    /**
     * 返回当前线程最近一次 AI 调用的日志 ID。
     *
     * <p>实际状态由 {@link AiModelInvocationService} 维护，本方法仅作委托，
     * 以保持 {@code IAIGenerationService} 接口不变。
     */
    @Override
    public Long getLastLogId() {
        return aiModelInvocationService.getLastLogId();
    }

    /**
     * 清理 JSON 响应（移除 markdown 代码块和非 JSON 内容）
     */
    private String cleanJsonResponse(String content) {
        if (content == null)
            return "{}";

        String normalized = content.trim();
        if (normalized.startsWith("```")) {
            normalized = normalized
                    .replaceFirst("^```(?:json)?\\s*", "")
                    .replaceFirst("\\s*```$", "")
                    .trim();
        }

        int arrayStart = normalized.indexOf('[');
        int objectStart = normalized.indexOf('{');
        int startIndex;
        char openingChar;
        char closingChar;

        if (arrayStart == -1 && objectStart == -1) {
            return normalized;
        }

        if (arrayStart != -1 && (objectStart == -1 || arrayStart < objectStart)) {
            startIndex = arrayStart;
            openingChar = '[';
            closingChar = ']';
        } else {
            startIndex = objectStart;
            openingChar = '{';
            closingChar = '}';
        }

        boolean inString = false;
        boolean escaped = false;
        int depth = 0;
        for (int index = startIndex; index < normalized.length(); index++) {
            char current = normalized.charAt(index);

            if (escaped) {
                escaped = false;
                continue;
            }

            if (current == '\\') {
                escaped = true;
                continue;
            }

            if (current == '"') {
                inString = !inString;
                continue;
            }

            if (inString) {
                continue;
            }

            if (current == openingChar) {
                depth++;
            } else if (current == closingChar) {
                depth--;
                if (depth == 0) {
                    return normalized.substring(startIndex, index + 1).trim();
                }
            }
        }

        return normalized.substring(startIndex).trim();
    }


    @Override
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> generateAIRecommendations(Long userId, Map<String, Object> statistics) {
        log.info("实时生成用户 {} 的 AI 学习建议", userId);

        if (!providerConfig.hasApiKey()) {
            return Collections.emptyList();
        }

        try {
            // 构建精简的统计数据用于 Prompt
            StringBuilder statsSummary = new StringBuilder();
            Map<String, Object> overall = (Map<String, Object>) statistics.get("overall");
            if (overall != null) {
                statsSummary.append(String.format("总练习数: %s, 正确率: %s%%. ",
                        overall.get("totalCount"),
                        (int) (getScoreOrDefault(overall.get("avgScore")))));
            }

            Map<String, Map<String, Object>> abilities = (Map<String, Map<String, Object>>) statistics
                    .get("abilityStats");
            if (abilities != null) {
                statsSummary.append("能力明细: ");
                abilities.forEach((type, stat) -> {
                    statsSummary
                            .append(String.format("[%s: 正确率%d%%] ", type,
                                    (int) getScoreOrDefault(stat.get("avgScore"))));
                });
            }

            String systemPrompt = systemPromptService.getPromptTemplate(
                    "REC_ENGINE_SYSTEM",
                    "你是一个智能英语学习推荐引擎。你需要根据用户的学习数据，生成2条最紧迫、最具体的学习建议。",
                    "推荐引擎-系统提示词");

            String userPromptTemplate = systemPromptService.getPromptTemplate(
                    "REC_ENGINE_USER",
                    "这是用户的最新学习统计数据：%s\n\n请生成2条学习建议，格式必须是 JSON 数组，每个对象包含：\n1. title: 建议标题（简短有力）\n2. content: 建议原因和具体操作内容（1-2句话）\n3. action: 按钮文案（如：开始练习、前往复习）\n4. path: 跳转路径（仅限：/vocabulary, /grammar, /reading, /listening, /writing, /speaking, /mock-exam）\n\n确保 JSON 格式合法，不要有 Markdown 标记。直接返回 [{}, {}]",
                    "推荐引擎-用户提示词");

            String userPrompt = String.format(userPromptTemplate, statsSummary.toString());

            String response = aiModelInvocationService.callLLM(systemPrompt, userPrompt, "GENERATE_REC_LIVE");
            return (List<Map<String, Object>>) (List<?>) JSONUtil.parseArray(cleanJsonResponse(response))
                    .toList(Map.class);
        } catch (Exception e) {
            log.error("实时生成 AI 建议失败", e);
            return Collections.emptyList();
        }
    }

    @Override
    public String testPrompt(String systemPrompt, String userPrompt) {
        log.info("执行 AI 沙箱测试");
        try {
            return aiModelInvocationService.callLLM(systemPrompt, userPrompt, "SANDBOX_TEST");
        } catch (Exception e) {
            log.error("沙箱测试失败", e);
            return "Error: " + e.getMessage();
        }
    }

    @Override
    public String analyzeFeedback(String systemPrompt, String userPrompt, String reaction, String response) {
        String analysisSystemPrompt = "你是一个专业的 AI 质量保证（QA）专家。你的任务是分析为什么用户会对 AI 生成的内容给出负面反馈。请根据【系统提示词】、【用户输入】、【AI 输出】分析可能的问题（如：幻觉、未遵循指令、格式错误、语气不当等），并提供简短的改进建议。";
        String analysisUserPrompt = String.format("""
                【系统提示词】：%s
                【用户输入】：%s
                【AI 输出】：%s
                【用户反馈/反应】：%s

                请分析问题原因：
                """, systemPrompt, userPrompt, response, reaction);

        try {
            return aiModelInvocationService.callLLM(analysisSystemPrompt, analysisUserPrompt, "FEEDBACK_ANALYSIS");
        } catch (Exception e) {
            return "分析失败: " + e.getMessage();
        }
    }

    @Override
    public Map<String, Object> generateAIBriefing() {
        log.info("生成 AI 每日简报");

        // 1. 收集昨日数据 (Yesterday)
        LocalDateTime start = LocalDate.now().minusDays(1).atStartOfDay();
        LocalDateTime end = LocalDate.now().atStartOfDay();

        // 1.1 用户增长
        long newUsers = 0;
        try {
            newUsers = userService.count(new LambdaQueryWrapper<User>()
                    .ge(User::getCreateTime, start)
                    .lt(User::getCreateTime, end));
        } catch (Exception e) {
            log.warn("获取用户统计失败: {}", e.getMessage());
        }

        // 1.2 AI 服务健康度
        long totalCalls = aiGenerationLogService.count(new LambdaQueryWrapper<AIGenerationLog>()
                .ge(AIGenerationLog::getCreateTime, start)
                .lt(AIGenerationLog::getCreateTime, end));

        long failedCalls = aiGenerationLogService.count(new LambdaQueryWrapper<AIGenerationLog>()
                .eq(AIGenerationLog::getStatus, 0)
                .ge(AIGenerationLog::getCreateTime, start)
                .lt(AIGenerationLog::getCreateTime, end));

        double failureRate = totalCalls > 0 ? (double) failedCalls / totalCalls * 100.0 : 0.0;

        // 1.3 收入情况
        Double revenue = 0.0;
        try {
            com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<VipOrder> orderQuery = new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
            orderQuery.select("IFNULL(SUM(amount), 0) as total")
                    .eq("status", "PAID")
                    .ge("create_time", start)
                    .lt("create_time", end);
            Map<String, Object> map = vipOrderMapper.selectMaps(orderQuery).stream().findFirst().orElse(null);
            if (map != null && map.get("total") != null) {
                revenue = Double.valueOf(map.get("total").toString());
            }
        } catch (Exception e) {
            log.warn("获取收入统计失败: {}", e.getMessage());
        }

        // 2. 构建 Prompt
        String systemPrompt = "你是一个专业的运营数据分析师。根据提供的数据生成一份简报。";
        String userPrompt = String.format(
                "请根据昨日 (%s) 的运营数据生成一份简报：\n" +
                        "- 新增用户: %d 人\n" +
                        "- AI服务调用: %d 次 (失败率: %.2f%%)\n" +
                        "- 营收: ¥%.2f\n\n" +
                        "要求：\n" +
                        "1. 标题生动（如'昨日运营速览'）。\n" +
                        "2. 使用 emoji 增加可读性。\n" +
                        "3. 针对异常数据（如失败率>5%%或营收为0）给出分析或预警。\n" +
                        "4. 语气专业但轻松。\n" +
                        "返回JSON: {\"title\": \"...\", \"summary\": \"...\", \"alert\": \"...\" (可选, 仅当有风险时)}",
                start.toLocalDate(), newUsers, totalCalls, failureRate, revenue);

        // 3. 调用 LLM
        try {
            String response = aiModelInvocationService.callLLM(systemPrompt, userPrompt, "AI_BRIEFING");
            return JSONUtil.parseObj(cleanJsonResponse(response));
        } catch (Exception e) {
            log.error("生成简报失败", e);
            // Fallback
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("title", "系统运行日报");
            fallback.put("summary",
                    String.format("昨日新增用户 %d 人，AI服务平稳运行，失败率 %.1f%%。营收 ¥%.2f。", newUsers, failureRate, revenue));
            return fallback;
        }
    }
}
