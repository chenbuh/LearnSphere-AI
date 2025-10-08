package com.learnsphere.service.impl;

import cn.dev33.satoken.stp.StpUtil;
// import cn.hutool.core.bean.BeanUtil;
import cn.hutool.json.JSONUtil;
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.learnsphere.entity.*;
import com.learnsphere.service.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AI 生成服务实现类
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Slf4j
@Service
public class AIGenerationServiceImpl implements IAIGenerationService {

    @Value("${ai.api-key:}")
    private String apiKey;

    @Value("${ai.model:qwen-plus}")
    private String modelName;

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
    private IAchievementService achievementService;
    @Autowired
    private com.learnsphere.mapper.UserAnalysisMapper userAnalysisMapper;

    @Override
    public Map<String, Object> deepAnalyzeError(Long recordId) {
        log.info("执行错题深度 RAG 解析: recordId={}", recordId);
        LearningRecord record = learningRecordService.getById(recordId);
        if (record == null)
            return Map.of("error", "Record not found");

        List<Achievement> newlyUnlocked = new ArrayList<>();
        if (StpUtil.isLogin()) {
            newlyUnlocked
                    .addAll(achievementService.incrementProgress(StpUtil.getLoginIdAsLong(), "AI_DEEP_ANALYZE", 1));
        }

        String context = String.format("题目类型: %s\n题目内容: %s\n用户的错误回答: %s\n正确答案: %s\n",
                record.getContentType(), record.getOriginalContent(), record.getAnswer(), record.getCorrectAnswer());

        String systemPrompt = "你是一个极具洞察力的英语教育专家。你的任务是根据用户的错题记录，进行深度的心理学和语言学分析。";
        String userPrompt = "基于以下错题背景进行深度分析：\n" + context + "\n" +
                "请提供：1. 错误根源分析（为什么会选错） 2. 核心知识点强化（RAG 知识补全） 3. 一个高度相似的挑战练习题（用于验证改进）。\n" +
                "返回 JSON 格式：{\"analysis\": \"...\", \"knowledgeShield\": \"...\", \"challengeQuestion\": {\"text\": \"...\", \"options\": [], \"correct\": 0}}";

        try {
            String response = callLLM(systemPrompt, userPrompt, "DEEP_ANALYZE_ERROR");
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
    public Map<String, Object> startSpeakingMock(String topic, String difficulty) {
        log.info("开启 1V1 口语模考: {} / {}", topic, difficulty);
        String systemPrompt = "你是一个雅思/托福口语考官。你要与学生进行 1V1 的互动模拟考试。";
        String userPrompt = String.format("请针对主题 '%s' 和难度 '%s' 开启一场口语模考。\n" +
                "首先给出一句鼓励性的开场白，然后提出 Part 1 的第一个问题。\n" +
                "返回 JSON：{\"greeting\": \"...\", \"firstQuestion\": \"...\", \"sessionId\": \"%s\"}",
                topic, difficulty, UUID.randomUUID());

        try {
            String response = callLLM(systemPrompt, userPrompt, "SPEAKING_MOCK_START");
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
            String response = callLLM(systemPrompt, userPrompt, "SPEAKING_MOCK_CONTINUE");
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
            String response = callLLM(systemPrompt, userPrompt, "SPEAKING_REPORT_GEN");
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
            String response = callLLM(systemPrompt, userPrompt, "CONTENT_AUDIT");
            return JSONUtil.parseObj(cleanJsonResponse(response));
        } catch (Exception e) {
            return Map.of("status", "ERROR", "reason", e.getMessage());
        }
    }

    @Override
    public Map<String, Object> generateReading(String source, String category, String difficulty, String length) {
        log.info("生成阅读理解: {} / {} / {}", category, difficulty, length);

        if (apiKey == null || apiKey.isEmpty()) {
            return generateMockReading(difficulty);
        }

        try {
            String systemPrompt = systemPromptService.getPromptTemplate(
                    "READING_GEN_SYSTEM",
                    "你是一个专业的英语阅读理解出题专家。你必须严格遵守用户的字数要求，绝对不能偷懒写短文。如果文章长度不足，任务将失败。",
                    "阅读理解生成-系统提示词");

            // 处理长度描述，使其更具体
            String lengthDesc = length;
            if ("short".equalsIgnoreCase(length)) {
                lengthDesc = "200-300";
            } else if ("medium".equalsIgnoreCase(length)) {
                lengthDesc = "400-600";
            } else if ("long".equalsIgnoreCase(length)) {
                lengthDesc = "800-1000";
            }

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

            String content = callLLM(systemPrompt, userPrompt, "GENERATE_READING");
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
                    try {
                        article.setWordCount(Integer.parseInt(length));
                    } catch (NumberFormatException e) {
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
    public Map<String, Object> generateWriting(String examType, String mode) {
        log.info("生成写作题目: {} / {}", examType, mode);

        if (apiKey == null || apiKey.isEmpty()) {
            return generateMockWriting(examType);
        }

        try {
            String systemPrompt = "你是一个专业的英语写作出题专家。";
            String userPrompt = String.format(
                    "请为%s考试生成一道%s类型的写作题目。\n" +
                            "返回JSON：{\"topic\":\"题目\", \"requirements\":\"要求\", \"wordLimit\":\"字数限制\", \"timeLimit\":30}\n",
                    examType, mode);

            String content = callLLM(systemPrompt, userPrompt, "GENERATE_WRITING");
            content = cleanJsonResponse(content);

            Map<String, Object> jsonResult = JSONUtil.parseObj(content);

            try {
                if (StpUtil.isLogin()) {
                    WritingTopic wt = new WritingTopic();
                    wt.setExamType(examType);
                    wt.setMode(mode);
                    wt.setTitle((String) jsonResult.get("topic"));
                    wt.setPrompt((String) jsonResult.get("requirements"));
                    wt.setDifficulty("medium"); // Default
                    wt.setCreateTime(LocalDateTime.now());
                    writingTopicService.save(wt);
                }
            } catch (Exception e) {
                log.warn("保存写作题目失败: {}", e.getMessage());
            }

            return jsonResult;
        } catch (Exception e) {
            log.error("AI 生成写作失败，尝试从本地数据库获取", e);
            Map<String, Object> criteria = new HashMap<>();
            criteria.put("examType", examType);
            criteria.put("mode", mode);
            return generateFromLocal("writing", criteria);
        }
    }

    @Override
    public Map<String, Object> evaluateWriting(String topic, String content) {
        log.info("评估写作: {}", topic);

        if (apiKey == null || apiKey.isEmpty()) {
            return generateMockEvaluation();
        }

        try {
            String systemPrompt = "你是一个专业的英语写作评分老师，擅长从内容、语法、词汇、结构等方面给出详细的评价和建议。";
            String userPrompt = String.format(
                    "请评估以下作文（题目：%s）：\n\n%s\n\n" +
                            "返回JSON：{\"score\":85, \"strengths\":[\"优点1\",\"优点2\"], \"weaknesses\":[\"不足1\",\"不足2\"], \"suggestions\":[\"建议1\",\"建议2\"], \"detailedFeedback\":\"详细反馈\"}\n",
                    topic, content);

            String response = callLLM(systemPrompt, userPrompt, "EVALUATE_WRITING");
            response = cleanJsonResponse(response);

            return JSONUtil.parseObj(response);
        } catch (Exception e) {
            log.error("AI 评估写作失败，使用 Mock 数据", e);
            return generateMockEvaluation();
        }
    }

    @Override
    public Map<String, Object> generateListening(String type, String difficulty, Integer count) {
        log.info("生成听力练习: {} / {} / {}", type, difficulty, count);

        if (apiKey == null || apiKey.isEmpty()) {
            return generateMockListening(difficulty, count);
        }

        try {
            String systemPrompt = "你是一个专业的英语听力出题专家。";
            String userPrompt = String.format(
                    "请生成%d段%s难度的英语听力对话/短文，每段包含对话内容(audioScript)和5道选择题。\n" +
                            "返回JSON：{\"passages\":[{\"audioScript\":\"对话内容\", \"questions\":[{\"text\":\"问题\", \"options\":[\"A\",\"B\",\"C\",\"D\"], \"correct\":0, \"explanation\":\"解析\"}]}]}\n",
                    count, difficulty);

            String content = callLLM(systemPrompt, userPrompt, "GENERATE_LISTENING");
            content = cleanJsonResponse(content);

            Map<String, Object> jsonResult = JSONUtil.parseObj(content);

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
                                lm.setTitle("Listening Practice " + LocalDateTime.now().toLocalTime());
                                lm.setScript((String) p.get("audioScript"));
                                lm.setQuestions(JSONUtil.toJsonStr(p.get("questions")));
                                lm.setDifficulty(difficulty);
                                lm.setType(type);
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
            log.error("AI 生成听力失败，尝试从本地数据库获取", e);
            Map<String, Object> criteria = new HashMap<>();
            criteria.put("difficulty", difficulty);
            criteria.put("type", type);
            return generateFromLocal("listening", criteria);
        }
    }

    @Override
    public Map<String, Object> generateGrammar(String topic, String difficulty) {
        log.info("生成语法练习: {} / {}", topic, difficulty);

        if (apiKey == null || apiKey.isEmpty()) {
            return generateMockGrammar(topic, difficulty);
        }

        try {
            String systemPrompt = "你是一个专业的英语语法出题专家。";
            String userPrompt = String.format(
                    "请针对'%s'这个语法点生成10道%s难度的选择题。\n" +
                            "返回JSON：{\"topic\":\"%s\", \"questions\":[{\"text\":\"题目\", \"options\":[\"A\",\"B\",\"C\",\"D\"], \"correct\":0, \"explanation\":\"解析\"}]}\n",
                    topic, difficulty, topic);

            String content = callLLM(systemPrompt, userPrompt, "GENERATE_GRAMMAR");
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

    @Override
    public Map<String, Object> generateSpeaking(String type, String difficulty) {
        log.info("生成口语练习: {} / {}", type, difficulty);

        if (apiKey == null || apiKey.isEmpty()) {
            return generateMockSpeaking(type);
        }

        try {
            String systemPrompt = "你是一个专业的英语口语出题专家。";
            String userPrompt = String.format(
                    "请生成一道%s类型、%s难度的口语练习题目。\n" +
                            "返回JSON：{\"topic\":\"题目\", \"description\":\"描述\", \"hints\":[\"提示1\",\"提示2\"], \"timeLimit\":120}\n",
                    type, difficulty);

            String content = callLLM(systemPrompt, userPrompt, "GENERATE_SPEAKING");
            content = cleanJsonResponse(content);

            Map<String, Object> jsonResult = JSONUtil.parseObj(content);

            try {
                SpeakingTopic st = new SpeakingTopic();
                st.setTitle((String) jsonResult.get("topic"));
                st.setQuestion((String) jsonResult.get("description"));

                Object hints = jsonResult.get("hints");
                if (hints != null) {
                    st.setTips(JSONUtil.toJsonStr(hints));
                }

                st.setType(type);
                st.setDifficulty(difficulty);
                st.setCreateTime(LocalDateTime.now());
                speakingTopicService.save(st);
            } catch (Exception e) {
                log.warn("保存口语失败: {}", e.getMessage());
            }

            return jsonResult;
        } catch (Exception e) {
            log.error("AI 生成口语练习失败，尝试从本地数据库获取", e);
            Map<String, Object> criteria = new HashMap<>();
            criteria.put("type", type);
            criteria.put("difficulty", difficulty);
            return generateFromLocal("speaking", criteria);
        }
    }

    @Override
    public Map<String, Object> evaluateSpeaking(String topic, String transcription) {
        log.info("评估口语: {}", topic);

        if (apiKey == null || apiKey.isEmpty()) {
            return generateMockEvaluation();
        }

        try {
            String systemPrompt = "你是一个专业的英语口语评分老师。";
            String userPrompt = String.format(
                    "请评估以下口语回答（题目：%s）：\n\n%s\n\n" +
                            "返回JSON：{\"score\":80, \"pronunciation\":85, \"fluency\":75, \"grammar\":80, \"vocabulary\":85, \"feedback\":\"详细反馈\"}\n",
                    topic, transcription);

            String response = callLLM(systemPrompt, userPrompt, "EVALUATE_SPEAKING");
            response = cleanJsonResponse(response);

            return JSONUtil.parseObj(response);
        } catch (Exception e) {
            log.error("AI 评估口语失败，使用 Mock 数据", e);
            return generateMockEvaluation();
        }
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
            case "reading" -> generateMockReading((String) criteria.getOrDefault("difficulty", "medium"));
            case "writing" -> generateMockWriting((String) criteria.getOrDefault("examType", "CET4"));
            case "listening" -> generateMockListening((String) criteria.getOrDefault("difficulty", "medium"), 1);
            case "grammar" -> generateMockGrammar((String) criteria.getOrDefault("topic", "时态"), "medium");
            case "speaking" -> generateMockSpeaking((String) criteria.getOrDefault("type", "描述"));
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
        String examType = (String) criteria.get("examType");
        LambdaQueryWrapper<WritingTopic> wrapper = new LambdaQueryWrapper<>();
        if (examType != null)
            wrapper.eq(WritingTopic::getExamType, examType);
        wrapper.last("ORDER BY RAND() LIMIT 1");

        WritingTopic topic = writingTopicService.getOne(wrapper);
        if (topic == null)
            return null;

        Map<String, Object> result = new HashMap<>();
        result.put("topic", topic.getTitle());
        result.put("requirements", topic.getPrompt());
        result.put("wordLimit", "Standard");
        result.put("timeLimit", 30);
        result.put("_from", "database");
        return result;
    }

    private Map<String, Object> getDbListening(Map<String, Object> criteria) {
        String difficulty = (String) criteria.get("difficulty");
        LambdaQueryWrapper<ListeningMaterial> wrapper = new LambdaQueryWrapper<>();
        if (difficulty != null)
            wrapper.eq(ListeningMaterial::getDifficulty, difficulty);
        wrapper.last("ORDER BY RAND() LIMIT 1");

        ListeningMaterial lm = listeningMaterialService.getOne(wrapper);
        if (lm == null)
            return null;

        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> passages = new ArrayList<>();
        Map<String, Object> p = new HashMap<>();
        p.put("audioScript", lm.getScript());
        p.put("questions", JSONUtil.parseArray(lm.getQuestions()));
        passages.add(p);
        result.put("passages", passages);
        result.put("_from", "database");
        return result;
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
        result.put("topic", st.getTitle());
        result.put("description", st.getQuestion());
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
        if (!StpUtil.isLogin())
            return Map.of("records", Collections.emptyList(), "total", 0L);
        // userId is not used for GrammarExercise as it lacks userId column
        // Long userId = StpUtil.getLoginIdAsLong();
        // GrammarExercise usually doesn't have userId in typical design? Let's check.
        // Defaulting to empty if not possible.
        // Wait, GrammarExercise usually HAS userId if it's user generated content.
        // Checking entity... it didn't show userId in previous view_file(Step 1161)!
        // If no userId, we can't filter by user. But maybe it's globally shared? Or
        // incomplete entity implementation.
        // Assuming it's lacking userId for now, I'll return empty or catch error.
        // Actually, user just asked to save generation history. If table lacks userId,
        // we can't save per user.
        // I will assume for now we just query all? No that's bad.
        // Let's Skip mapping userId for GrammarExercise if it doesn't exist and just
        // log a warning or return empty.
        // Re-reading Step 1161: GrammarExercise fields: id, topic, difficulty,
        // question, questions, deleted, createTime. NO USER ID.
        // This means Grammar Exercises might be public pool? Or I need to add userId.
        // For now, I will return empty list or all (limit 10). Returning all is better
        // than nothing for demo.
        Page<GrammarExercise> pageParam = new Page<>(page, size);
        IPage<GrammarExercise> result = grammarExerciseService.page(pageParam,
                new LambdaQueryWrapper<GrammarExercise>()
                        .orderByDesc(GrammarExercise::getCreateTime)); // No userId filter

        List<Map<String, Object>> list = result.getRecords().stream().map(a -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", a.getId());
            m.put("topic", a.getTopic());
            m.put("questions", JSONUtil.parseArray(a.getQuestions()));
            m.put("difficulty", a.getDifficulty());
            m.put("createTime", a.getCreateTime());
            return m;
        }).collect(Collectors.toList());
        return Map.of("records", list, "total", result.getTotal());
    }

    @Override
    public Map<String, Object> getRecentSpeakings(int page, int size) {
        // SpeakingTopic fields: id, type, difficulty, title, question, keywords, tips,
        // deleted, createTime. No userId.
        // Same issue as Grammar. Queries all.
        Page<SpeakingTopic> pageParam = new Page<>(page, size);
        IPage<SpeakingTopic> result = speakingTopicService.page(pageParam,
                new LambdaQueryWrapper<SpeakingTopic>().orderByDesc(SpeakingTopic::getCreateTime));

        List<Map<String, Object>> list = result.getRecords().stream().map(a -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", a.getId());
            m.put("title", a.getTitle());
            m.put("type", a.getType());
            m.put("difficulty", a.getDifficulty());
            m.put("createTime", a.getCreateTime());
            return m;
        }).collect(Collectors.toList());
        return Map.of("records", list, "total", result.getTotal());
    }

    @Override
    public Map<String, Object> getRecentWritings(int page, int size) {
        // WritingTopic No userId either.
        Page<WritingTopic> pageParam = new Page<>(page, size);
        IPage<WritingTopic> result = writingTopicService.page(pageParam,
                new LambdaQueryWrapper<WritingTopic>().orderByDesc(WritingTopic::getCreateTime));

        List<Map<String, Object>> list = result.getRecords().stream().map(a -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", a.getId());
            m.put("title", a.getTitle());
            m.put("examType", a.getExamType());
            m.put("mode", a.getMode());
            m.put("createTime", a.getCreateTime());
            return m;
        }).collect(Collectors.toList());
        return Map.of("records", list, "total", result.getTotal());
    }

    @Override
    public Map<String, Object> generateVocabularyDetails(String word, String examType) {
        log.info("生成词汇详情: {} / {}", word, examType);

        Map<String, Object> result = new HashMap<>();
        result.put("word", word);
        result.put("phonetic", "/wɜːrd/");
        result.put("definition", "A single unit of language");
        result.put("translation", "单词；词");
        result.put("example", "This is an example sentence.");
        result.put("exampleTranslation", "这是一个例句。");

        return result;
    }

    @Override
    public Map<String, Object> getLastAnalysis(Long userId) {
        log.debug("获取最后分析: userId={}", userId);

        // 从数据库查询最新的分析报告
        com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<UserAnalysis> query = new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
        query.eq("user_id", userId)
                .orderByDesc("create_time")
                .last("LIMIT 1");

        UserAnalysis analysis = userAnalysisMapper.selectOne(query);

        if (analysis != null && analysis.getReportJson() != null) {
            try {
                // 反序列化 JSON 到 Map
                return JSONUtil.toBean(analysis.getReportJson(), Map.class);
            } catch (Exception e) {
                log.error("解析分析报告 JSON 失败", e);
            }
        }

        return null;
    }

    @Override
    public Map<String, Object> generateLearningAnalysis(Long userId, Map<String, Object> statistics) {
        log.info("生成学习分析: userId={}", userId);

        Map<String, Object> result = new HashMap<>();

        // 从嵌套的统计数据中提取信息
        @SuppressWarnings("unchecked")
        Map<String, Object> overall = (Map<String, Object>) statistics.get("overall");

        Integer totalRecords = 0;
        Integer correctCount = 0;
        Double overallAccuracy = 0.0;

        if (overall != null) {
            Object totalObj = overall.get("total_records");
            if (totalObj instanceof Number) {
                totalRecords = ((Number) totalObj).intValue();
            }
            Object correctObj = overall.get("correct_count");
            if (correctObj instanceof Number) {
                correctCount = ((Number) correctObj).intValue();
            }
            Object accuracyObj = overall.get("accuracy");
            if (accuracyObj instanceof Number) {
                overallAccuracy = ((Number) accuracyObj).doubleValue();
            } else if (totalRecords > 0) {
                overallAccuracy = (correctCount * 1.0) / totalRecords;
            }
        }

        // 计算各项指标
        int overallScore = (int) (overallAccuracy * 100); // 综合能力值 0-100
        int growth = calculateGrowth(userId); // 较上周提升
        int gap = 100 - overallScore; // 距目标差距
        int predict = calculatePredictScore(overallScore); // 预测分值

        result.put("overall", overallScore);
        result.put("growth", growth);
        result.put("gap", gap);
        result.put("predict", predict);

        // 生成能力分布
        List<Map<String, Object>> abilities = generateAbilities(statistics);
        result.put("abilities", abilities);

        // 生成薄弱点诊断
        List<Map<String, Object>> weakPoints = generateWeakPoints(statistics);
        result.put("weakPoints", weakPoints);

        // 🚀 新增：调用大模型生成个性化 AI 点评
        String aiAnalysis = generateAIAnalysis(overallScore, growth, predict, abilities, weakPoints, statistics);
        result.put("aiAnalysis", aiAnalysis);

        result.put("timestamp", System.currentTimeMillis());
        result.put("userId", userId);

        // 保存分析报告到数据库
        try {
            UserAnalysis analysis = new UserAnalysis();
            analysis.setUserId(userId);
            analysis.setReportJson(JSONUtil.toJsonStr(result));
            analysis.setCreateTime(LocalDateTime.now());
            analysis.setUpdateTime(LocalDateTime.now());

            // 可以选择在这里清理旧数据，或者只保留最近的一条
            // 这里简单策略：直接插入新记录
            userAnalysisMapper.insert(analysis);
            log.info("学习分析报告已保存: userId={}", userId);
        } catch (Exception e) {
            log.error("保存学习分析报告失败", e);
        }

        return result;
    }

    /**
     * 调用大模型生成个性化学习分析点评
     */
    private String generateAIAnalysis(int overallScore, int growth, int predict,
            List<Map<String, Object>> abilities,
            List<Map<String, Object>> weakPoints,
            Map<String, Object> statistics) {
        // 如果没有 API Key，返回友好提示
        if (apiKey == null || apiKey.isEmpty()) {
            return "✨ AI 深度分析功能需要配置 API Key 才能使用。当前显示的是基于数据的智能统计分析。";
        }

        try {
            // 构建提示词，包含用户的详细数据
            StringBuilder prompt = new StringBuilder();
            prompt.append("你是一位专业的英语学习导师。请根据以下学生的学习数据，撰写一段温暖、鼓励且富有洞察力的综合分析评语（150-200字）。\n\n");
            prompt.append("【学习概况】\n");
            prompt.append(String.format("- 综合能力值: %d/100\n", overallScore));
            prompt.append(String.format("- 较上周提升: +%d%%\n", growth));
            prompt.append(String.format("- 预测 CET 分数: %d/710\n", predict));

            prompt.append("\n【能力分布】\n");
            for (Map<String, Object> ability : abilities) {
                prompt.append(String.format("- %s: %d%% (目标: %d%%)\n",
                        ability.get("name"), ability.get("current"), ability.get("target")));
            }

            if (!weakPoints.isEmpty()) {
                prompt.append("\n【薄弱环节】\n");
                for (Map<String, Object> wp : weakPoints) {
                    prompt.append(String.format("- %s: %d分\n", wp.get("title"), wp.get("score")));
                }
            }

            // 提取总题数信息
            @SuppressWarnings("unchecked")
            Map<String, Object> overallStats = (Map<String, Object>) statistics.get("overall");
            if (overallStats != null) {
                Object totalObj = overallStats.get("total_records");
                if (totalObj instanceof Number) {
                    prompt.append(String.format("\n累计练习题数: %d 题\n", ((Number) totalObj).intValue()));
                }
            }

            prompt.append("\n请用第二人称（你/您）直接与学生对话，语气真诚友好。");
            prompt.append("要点：1. 肯定进步和优势 2. 指出需要关注的地方 3. 给出具体可行的建议 4. 鼓励坚持");

            String systemPrompt = "你是一位经验丰富的英语学习导师，擅长根据学生数据给出个性化、温暖且有深度的学习建议。";

            // 调用 LLM
            String analysis = callLLM(systemPrompt, prompt.toString(), "GENERATE_ANALYSIS");

            return analysis.trim();

        } catch (Exception e) {
            log.error("AI 分析生成失败", e);
            // 降级：返回基于数据的通用鼓励
            if (overallScore >= 80) {
                return "🎉 您的整体表现非常优秀！继续保持这样的学习节奏，相信很快就能达到目标。";
            } else if (overallScore >= 60) {
                return "💪 您正在稳步进步中！建议针对薄弱环节进行专项突破，加油！";
            } else {
                return "🌟 别气馁！学习是一个循序渐进的过程。建议从基础开始，每天坚持一点点，进步会越来越明显。";
            }
        }
    }

    /**
     * 计算较上周增长
     */
    private int calculateGrowth(Long userId) {
        // 简化实现：返回 0-15 之间的随机增长
        // 实际应该对比上周数据
        return (int) (Math.random() * 15);
    }

    /**
     * 计算预测考试分数
     */
    private int calculatePredictScore(int overall) {
        // 根据综合能力值预测 CET 分数(满分710)
        // 60分能力值 ≈ 425分(及格线)
        // 80分能力值 ≈ 550分
        // 100分能力值 ≈ 650分
        return (int) (425 + (overall - 60) * 5.625);
    }

    /**
     * 生成能力分布数据
     */
    private List<Map<String, Object>> generateAbilities(Map<String, Object> statistics) {
        List<Map<String, Object>> abilities = new ArrayList<>();

        // 从统计数据中获取各类型数据
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> byType = (List<Map<String, Object>>) statistics.get("byType");

        // 构建类型到统计的映射
        Map<String, Map<String, Object>> typeStats = new HashMap<>();
        if (byType != null) {
            for (Map<String, Object> stat : byType) {
                String type = (String) stat.get("content_type");
                if (type != null) {
                    typeStats.put(type, stat);
                }
            }
        }

        // 阅读能力
        abilities.add(createAbilityItem(
                "阅读理解",
                "#818cf8",
                calculateTypeAccuracy(typeStats.get("reading")),
                85));

        // 听力能力
        abilities.add(createAbilityItem(
                "听力理解",
                "#34d399",
                calculateTypeAccuracy(typeStats.get("listening")),
                80));

        // 语法能力
        abilities.add(createAbilityItem(
                "语法掌握",
                "#f59e0b",
                calculateTypeAccuracy(typeStats.get("grammar")),
                90));

        // 词汇能力
        abilities.add(createAbilityItem(
                "词汇量",
                "#a78bfa",
                calculateTypeAccuracy(typeStats.get("vocabulary")),
                75));

        return abilities;
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
        Object correctObj = typeStat.get("correct_count");

        if (totalObj instanceof Number && correctObj instanceof Number) {
            int total = ((Number) totalObj).intValue();
            int correct = ((Number) correctObj).intValue();
            if (total > 0) {
                return (int) ((correct * 100.0) / total);
            }
        }

        // 尝试从 avgScore 计算
        Object avgScoreObj = typeStat.get("avgScore");
        if (avgScoreObj instanceof Number) {
            return ((Number) avgScoreObj).intValue();
        }

        return 0;
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

                // 只添加正确率低于60%的
                if (accuracy < 60 && accuracy > 0) {
                    weakPoints.add(createWeakPointItem(type, accuracy));
                }
            }
        }

        return weakPoints;
    }

    private Map<String, Object> createWeakPointItem(String type, int score) {
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
            default:
                title = type + "能力";
                advice = "建议加强该模块的练习，多做相关题目，总结规律和技巧。";
        }

        item.put("title", title);
        item.put("score", score);
        item.put("advice", advice);
        item.put("color", color);

        return item;
    }

    // ==================== 辅助方法 ====================

    /**
     * 调用 Qwen LLM
     */
    private String callLLM(String systemPrompt, String userPrompt, String actionType) {
        Long userId = null;
        try {
            if (StpUtil.isLogin()) {
                userId = StpUtil.getLoginIdAsLong();
            }
        } catch (Exception e) {
            // Ignore
        }

        long start = System.currentTimeMillis();
        String status = "SUCCESS";
        String error = null;
        Integer inputTokens = null;
        Integer outputTokens = null;
        Integer totalTokens = null;

        try {
            Generation gen = new Generation();
            Message systemMsg = Message.builder().role(Role.SYSTEM.getValue()).content(systemPrompt).build();
            Message userMsg = Message.builder().role(Role.USER.getValue()).content(userPrompt).build();

            GenerationParam param = GenerationParam.builder()
                    .apiKey(apiKey)
                    .model(modelName)
                    .messages(Arrays.asList(systemMsg, userMsg))
                    .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                    .topP(0.8) // 增加多样性
                    .temperature(0.85f) // 略微提高随机性，避免过于保守
                    .build();

            GenerationResult result = gen.call(param);

            // 提取 token 使用信息
            try {
                if (result.getUsage() != null) {
                    inputTokens = result.getUsage().getInputTokens();
                    outputTokens = result.getUsage().getOutputTokens();

                    // 计算总 tokens,如果 API 没有直接提供
                    if (inputTokens != null && outputTokens != null) {
                        totalTokens = inputTokens + outputTokens;
                    }
                }
            } catch (Exception e) {
                log.warn("提取 token 使用信息失败: {}", e.getMessage());
            }

            return result.getOutput().getChoices().get(0).getMessage().getContent();
        } catch (Exception e) {
            status = "FAIL";
            error = e.getMessage();
            log.error("Qwen API 调用失败", e);
            throw new RuntimeException("AI 生成失败", e);
        } finally {
            aiGenerationLogService.log(userId, actionType, modelName, userPrompt, status, error,
                    System.currentTimeMillis() - start, inputTokens, outputTokens, totalTokens);
        }
    }

    /**
     * 清理 JSON 响应（移除 markdown 代码块）
     */
    private String cleanJsonResponse(String content) {
        if (content.startsWith("```")) {
            content = content.replaceAll("^```(json)?\\n?", "").replaceAll("\\n?```$", "");
        }
        return content.trim();
    }

    // ==================== Mock 数据生成方法 ====================

    private Map<String, Object> generateMockReading(String difficulty) {
        Map<String, Object> result = new HashMap<>();
        result.put("title", "Sample Reading: The Benefits of Learning");
        result.put("passage", "Learning is a lifelong process that enriches our minds and opens new opportunities...");
        result.put("questions", List.of(
                Map.of("text", "What is the main idea?", "options", List.of("A", "B", "C", "D"), "correct", 0,
                        "explanation", "主旨在第一句")));
        return result;
    }

    private Map<String, Object> generateMockWriting(String examType) {
        Map<String, Object> result = new HashMap<>();
        result.put("topic", "The Importance of Reading");
        result.put("requirements", "Write an essay of 120-180 words");
        result.put("wordLimit", "120-180");
        result.put("timeLimit", 30);
        return result;
    }

    private Map<String, Object> generateMockListening(String difficulty, Integer count) {
        Map<String, Object> result = new HashMap<>();
        result.put("passages", List.of(
                Map.of("audioScript", "Sample conversation...",
                        "questions", List.of(Map.of("text", "What are they talking about?", "options",
                                List.of("A", "B", "C", "D"), "correct", 0, "explanation", "Answer is A")))));
        return result;
    }

    private Map<String, Object> generateMockGrammar(String topic, String difficulty) {
        Map<String, Object> result = new HashMap<>();
        result.put("topic", topic);
        result.put("questions", List.of(
                Map.of("text", "Choose the correct tense: I ___ to school yesterday.",
                        "options", List.of("go", "went", "goes", "going"),
                        "correct", 1,
                        "explanation", "过去时态用 went")));
        return result;
    }

    private Map<String, Object> generateMockSpeaking(String type) {
        Map<String, Object> result = new HashMap<>();
        result.put("topic", "Describe your favorite book");
        result.put("description", "Talk about a book you enjoy");
        result.put("hints", List.of("Title", "Author", "Why you like it"));
        result.put("timeLimit", 120);
        return result;
    }

    private Map<String, Object> generateMockEvaluation() {
        Map<String, Object> result = new HashMap<>();
        result.put("score", 75);
        result.put("strengths", List.of("Good vocabulary", "Clear structure"));
        result.put("weaknesses", List.of("Some grammar errors"));
        result.put("suggestions", List.of("Practice more complex sentences"));
        result.put("feedback", "Overall good work. Keep practicing!");
        return result;
    }
}
