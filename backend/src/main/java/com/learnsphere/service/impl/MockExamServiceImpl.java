package com.learnsphere.service.impl;

import cn.hutool.json.JSONUtil;
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnsphere.entity.ExamRecord;
import com.learnsphere.entity.MockExam;
import com.learnsphere.mapper.ExamRecordMapper;
import com.learnsphere.mapper.MockExamMapper;
import com.learnsphere.service.IMockExamService;
import com.learnsphere.service.ISystemPromptService;
import com.learnsphere.util.ExamTypeSupport;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
public class MockExamServiceImpl
        extends com.baomidou.mybatisplus.extension.service.impl.ServiceImpl<MockExamMapper, MockExam>
        implements IMockExamService {

    @Value("${ai.api-key:}")
    private String apiKey;

    @Value("${ai.model:qwen-plus}")
    private String modelName;

    @Autowired
    private MockExamMapper mockExamMapper;

    @Autowired
    private ExamRecordMapper examRecordMapper;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private ISystemPromptService systemPromptService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String getEffectiveModel() {
        try {
            String tutorOverride = redisTemplate.opsForValue().get("config:ai:tutor:model_override");
            if (tutorOverride != null && !tutorOverride.isBlank()) {
                return tutorOverride;
            }

            String globalOverride = redisTemplate.opsForValue().get("config:ai:model_override");
            if (globalOverride != null && !globalOverride.isBlank()) {
                return globalOverride;
            }
        } catch (Exception e) {
            log.warn("Failed to fetch model override, fallback to default: {}", e.getMessage());
        }
        return modelName;
    }

    @Override
    public List<Map<String, Object>> getExamList(String examType) {
        QueryWrapper<MockExam> wrapper = new QueryWrapper<>();
        String normalizedExamType = ExamTypeSupport.normalize(examType);
        if (normalizedExamType != null && !normalizedExamType.isEmpty()) {
            wrapper.eq("exam_type", normalizedExamType);
        }
        wrapper.orderByDesc("create_time");

        List<MockExam> exams = mockExamMapper.selectList(wrapper);
        List<Map<String, Object>> result = new ArrayList<>();

        for (MockExam exam : exams) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", exam.getId());
            map.put("title", exam.getTitle());
            map.put("examType", exam.getExamType());
            map.put("duration", exam.getDuration());
            map.put("totalQuestions", exam.getTotalQuestions());
            map.put("difficulty", exam.getDifficulty());
            long actualCount = examRecordMapper.selectCount(
                    new QueryWrapper<ExamRecord>().eq("exam_id", exam.getId()));
            map.put("participants", (int) actualCount);
            result.add(map);
        }
        return result;
    }

    @Override
    public Map<String, Object> generateExam(String examType, String difficulty) {
        String normalizedExamType = ExamTypeSupport.normalizeOrDefault(examType, "cet4");
        log.info("生成模拟考试: {} / {}", normalizedExamType, difficulty);

        Map<String, Object> result = null;

        // 优先尝试 AI 生成
        if (apiKey != null && !apiKey.isEmpty()) {
            try {
                result = callAIForExam(normalizedExamType, difficulty);
                // 保存到数据库
                saveExamToDb(result, normalizedExamType, difficulty);
                return result;
            } catch (Exception e) {
                log.error("AI 生成考试失败，从数据库获取", e);
            }
        }

        // AI 不可用，从数据库随机获取
        result = getRandomExamFromDb(normalizedExamType);
        if (result != null) {
            log.info("从数据库获取考试");
            return result;
        }

        // 数据库也没有，使用 Mock 数据
        log.warn("数据库无数据，使用 Mock");
        result = generateMockExam(normalizedExamType);
        saveExamToDb(result, normalizedExamType, difficulty);
        return result;
    }

    @Override
    public Map<String, Object> getExamDetail(Long examId) {
        MockExam exam = mockExamMapper.selectById(examId);
        if (exam == null) {
            return null;
        }

        // 不再在获取详情时增加人数，改为在提交试卷时增加
        // exam.setParticipants(exam.getParticipants() + 1);
        // mockExamMapper.updateById(exam);

        Map<String, Object> result = new HashMap<>();
        result.put("id", exam.getId());
        result.put("title", exam.getTitle());
        result.put("examType", exam.getExamType());
        result.put("duration", exam.getDuration());
        result.put("difficulty", exam.getDifficulty());
        result.put("questions", JSONUtil.parseArray(exam.getQuestions()));
        return result;
    }

    @Override
    public Map<String, Object> submitExam(Long userId, Long examId, List<Object> answers, Integer timeSpent) {
        MockExam exam = mockExamMapper.selectById(examId);
        if (exam == null) {
            throw new RuntimeException("考试不存在");
        }

        // 解析题目并计算得分
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> questions = (List<Map<String, Object>>) (List<?>) JSONUtil.toList(exam.getQuestions(),
                Map.class);
        int correctCount = 0;
        int totalCount = questions.size();

        for (int i = 0; i < Math.min(answers.size(), totalCount); i++) {
            Map<String, Object> q = questions.get(i);
            Object userAnswer = answers.get(i);
            Object correctObj = q.get("correct");

            // 仅对有'correct'标记且答案为数值类型（或可转为数值的字符串）的选择题进行自动判分
            if (correctObj != null && userAnswer != null) {
                try {
                    int correct = correctObj instanceof Integer ? (Integer) correctObj
                            : Integer.parseInt(correctObj.toString());

                    int userAnsInt;
                    if (userAnswer instanceof Integer) {
                        userAnsInt = (Integer) userAnswer;
                    } else {
                        // 尝试将字符串转为数字（针对单选题被前端以字符串形式传回的情况）
                        userAnsInt = Integer.parseInt(userAnswer.toString());
                    }

                    if (userAnsInt == correct) {
                        correctCount++;
                    }
                } catch (NumberFormatException e) {
                    // 用户提交的是非数字内容（如富文本作文），跳过自动比对
                    log.debug("题 index {} 为非选择题或答案格式不匹配，跳过自动判分", i);
                }
            }
        }

        int score = (int) Math.round((double) correctCount / totalCount * 100);

        // 保存考试记录
        ExamRecord record = new ExamRecord();
        record.setUserId(userId);
        record.setExamId(examId);
        record.setScore(score);
        record.setCorrectCount(correctCount);
        record.setTotalCount(totalCount);
        record.setTimeSpent(timeSpent);
        record.setAnswers(JSONUtil.toJsonStr(answers));
        record.setStatus("completed");
        examRecordMapper.insert(record);

        // 提交成功后，增加该试卷的参与次数
        exam.setParticipants(exam.getParticipants() + 1);
        mockExamMapper.updateById(exam);

        Map<String, Object> result = new HashMap<>();
        result.put("score", score);
        result.put("correctCount", correctCount);
        result.put("totalCount", totalCount);
        result.put("timeSpent", timeSpent);
        result.put("recordId", record.getId());
        return result;
    }

    @Override
    public List<Map<String, Object>> getUserExamRecords(Long userId) {
        List<ExamRecord> records = examRecordMapper.selectList(
                new QueryWrapper<ExamRecord>()
                        .eq("user_id", userId)
                        .orderByDesc("create_time"));

        List<Map<String, Object>> result = new ArrayList<>();
        for (ExamRecord record : records) {
            MockExam exam = mockExamMapper.selectById(record.getExamId());
            Map<String, Object> map = new HashMap<>();
            map.put("id", record.getId());
            map.put("examTitle", exam != null ? exam.getTitle() : "未知考试");
            map.put("score", record.getScore());
            map.put("correctCount", record.getCorrectCount());
            map.put("totalCount", record.getTotalCount());
            map.put("timeSpent", record.getTimeSpent());
            map.put("createTime", record.getCreateTime());
            result.add(map);
        }
        return result;
    }

    @Override
    public Map<String, Object> getExamDetailOnly(Long examId) {
        MockExam exam = mockExamMapper.selectById(examId);
        if (exam == null) {
            return null;
        }
        Map<String, Object> result = new HashMap<>();
        result.put("id", exam.getId());
        result.put("title", exam.getTitle());
        result.put("examType", exam.getExamType());
        result.put("duration", exam.getDuration());
        result.put("difficulty", exam.getDifficulty());
        long actualCount = examRecordMapper.selectCount(
                new QueryWrapper<ExamRecord>().eq("exam_id", exam.getId()));
        result.put("participants", (int) actualCount);
        result.put("createTime", exam.getCreateTime());
        result.put("questions", JSONUtil.parseArray(exam.getQuestions()));
        return result;
    }

    /**
     * AI 生成考试题目
     */
    private Map<String, Object> callAIForExam(String examType, String difficulty) {
        String normalizedExamType = ExamTypeSupport.normalizeOrDefault(examType, "cet4");
        String effectiveDifficulty = (difficulty == null || difficulty.isBlank()) ? "medium" : difficulty;
        String randomSeed = UUID.randomUUID().toString().substring(0, 8);
        long timestamp = System.currentTimeMillis();

        int questionCount = getQuestionCount(normalizedExamType);
        String examName = getExamName(normalizedExamType);

        String systemPrompt = systemPromptService.getPromptTemplate(
                "MOCK_EXAM_GEN_SYSTEM",
                "你是一个专业的英语考试命题专家，擅长根据目标考试风格生成结构完整、可直接作答的英语模拟试卷。",
                "模拟考试生成-系统提示词");
        String userPromptTemplate = systemPromptService.getPromptTemplate(
                ExamTypeSupport.resolvePromptKey("MOCK_EXAM_GEN_USER", normalizedExamType),
                "[Session ID: %s-%d] 请为%s生成一份%s难度的迷你版全真模拟试卷，总题量控制在约%d题，并且必须覆盖 Writing、Listening、Reading、Translation 四个部分。\n"
                        +
                        "命题说明：" + ExamTypeSupport.getMockExamGuidance(normalizedExamType) + "\n" +
                        "要求：\n" +
                        "1. Part I Writing：1道作文题，type='essay'，section='Part I Writing'，text 中直接给出写作任务，options 为空数组。\n"
                        +
                        "2. Part II Listening：1-2段听力材料，合计不少于5道选择题；同一段材料的题目 audioScript 必须完全相同。\n"
                        +
                        "3. Part III Reading：2-3篇阅读材料，合计不少于8道选择题；同一篇文章的题目 passage 必须完全相同。\n"
                        +
                        "4. Part IV Translation：1道翻译或表达题，type='translation'，section='Part IV Translation'，text 中给出待完成的中文或英文内容，options 为空数组。\n"
                        +
                        "5. 所有选择题必须有4个选项、correct 字段和 explanation 字段。\n" +
                        "6. 返回纯 JSON，questions 数组扁平化存储，题号连续，总题量尽量接近 %d 题。\n" +
                        "示例：{\"title\":\"%s 全真模拟\",\"questions\":[{\"id\":1,\"section\":\"Part I Writing\",\"type\":\"essay\",\"text\":\"Directions: ...\",\"options\":[]}]}\n",
                "模拟考试生成-" + ExamTypeSupport.getPromptDescriptionSuffix(normalizedExamType) + "用户提示词");
        String userPrompt = String.format(userPromptTemplate, randomSeed, timestamp, examName, effectiveDifficulty,
                questionCount, questionCount, examName);

        String content = callLLM(systemPrompt, userPrompt);

        // 清理格式
        if (content.startsWith("```")) {
            content = content.replaceAll("^```(json)?\\n?", "").replaceAll("\\n?```$", "");
        }

        return JSONUtil.parseObj(content);
    }

    /**
     * 保存考试到数据库
     */
    private void saveExamToDb(Map<String, Object> result, String examType, String difficulty) {
        try {
            String normalizedExamType = ExamTypeSupport.normalizeOrDefault(examType, "cet4");
            MockExam exam = new MockExam();
            exam.setTitle((String) result.getOrDefault("title", getExamName(normalizedExamType) + " 模拟考试"));
            exam.setExamType(normalizedExamType);
            exam.setDuration(getDuration(normalizedExamType));
            exam.setDifficulty(getDifficultyLevel(difficulty));

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> questions = (List<Map<String, Object>>) result.get("questions");
            exam.setTotalQuestions(questions != null ? questions.size() : 0);
            exam.setQuestions(objectMapper.writeValueAsString(questions));
            exam.setParticipants(0);

            mockExamMapper.insert(exam);
            result.put("id", exam.getId());
            log.info("保存考试到数据库: {}", exam.getId());
        } catch (Exception e) {
            log.error("保存考试失败", e);
        }
    }

    /**
     * 从数据库随机获取考试
     */
    private Map<String, Object> getRandomExamFromDb(String examType) {
        try {
            List<MockExam> exams = mockExamMapper.selectList(
                    new QueryWrapper<MockExam>()
                            .eq(examType != null, "exam_type", examType)
                            .like("questions", "listening") // 确保只获取包含听力的新版试卷
                            .orderByAsc("RAND()")
                            .last("LIMIT 1"));

            if (exams != null && !exams.isEmpty()) {
                MockExam exam = exams.get(0);
                Map<String, Object> result = new HashMap<>();
                result.put("id", exam.getId());
                result.put("title", exam.getTitle());
                result.put("examType", exam.getExamType());
                result.put("duration", exam.getDuration());
                result.put("difficulty", exam.getDifficulty());
                result.put("questions", JSONUtil.parseArray(exam.getQuestions()));
                return result;
            }
        } catch (Exception e) {
            log.error("从数据库获取考试失败", e);
        }
        return null;
    }

    /**
     * 生成 Mock 考试数据 (兜底方案) - 完整27题结构
     */
    /**
     * 生成 Mock 考试数据 (兜底方案) - 完整27题结构
     */
    private Map<String, Object> generateMockExam(String examType) {
        Map<String, Object> template = MockExamTemplates.getRandomTemplate();
        Map<String, Object> result = new HashMap<>();

        String examName = getExamName(examType);
        String templateName = (String) template.getOrDefault("templateName", "");

        // 生成唯一标题，例如 "CET-4 全真模拟 (文化与历史) - 20231027"
        String title = String.format("%s 全真模拟 (%s) - %s",
                examName,
                templateName,
                new java.text.SimpleDateFormat("MMddHHmmss").format(new Date()));

        result.put("title", title);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> templateQuestions = (List<Map<String, Object>>) template.get("questions");

        // 深拷贝问题列表以防修改静态模板
        List<Map<String, Object>> questions = new ArrayList<>();
        if (templateQuestions != null) {
            for (Map<String, Object> q : templateQuestions) {
                questions.add(new HashMap<>(q));
            }
        }

        result.put("questions", questions);
        return result;
    }

    private String callLLM(String systemPrompt, String userPrompt) {
        try {
            String effectiveModel = getEffectiveModel();
            Generation gen = new Generation();
            Message systemMsg = Message.builder().role(Role.SYSTEM.getValue()).content(systemPrompt).build();
            Message userMsg = Message.builder().role(Role.USER.getValue()).content(userPrompt).build();

            GenerationParam param = GenerationParam.builder()
                    .apiKey(apiKey)
                    .model(effectiveModel)
                    .messages(Arrays.asList(systemMsg, userMsg))
                    .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                    .build();

            GenerationResult result = gen.call(param);
            return result.getOutput().getChoices().get(0).getMessage().getContent();
        } catch (Exception e) {
            log.error("AI 调用失败", e);
            throw new RuntimeException("AI 生成失败", e);
        }
    }

    private int getQuestionCount(String examType) {
        return switch (ExamTypeSupport.normalizeOrDefault(examType, "cet4")) {
            case "primary" -> 12;
            case "middle" -> 18;
            case "high", "cet4", "cet6" -> 27;
            case "ielts", "toefl" -> 18;
            case "gre", "postgraduate" -> 16;
            default -> 18;
        };
    }

    private String getExamName(String examType) {
        return ExamTypeSupport.getMockExamName(examType);
    }

    private int getDuration(String examType) {
        return ExamTypeSupport.getMockExamDuration(examType);
    }

    private int getDifficultyLevel(String difficulty) {
        String normalizedDifficulty = difficulty == null ? "medium" : difficulty.toLowerCase(Locale.ROOT);
        return switch (normalizedDifficulty) {
            case "easy" -> 2;
            case "medium" -> 3;
            case "hard" -> 4;
            default -> 3;
        };
    }
}
