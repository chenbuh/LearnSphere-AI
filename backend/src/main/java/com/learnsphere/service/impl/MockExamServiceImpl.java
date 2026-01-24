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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public List<Map<String, Object>> getExamList(String examType) {
        QueryWrapper<MockExam> wrapper = new QueryWrapper<>();
        if (examType != null && !examType.isEmpty()) {
            wrapper.eq("exam_type", examType);
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
        log.info("生成模拟考试: {} / {}", examType, difficulty);

        Map<String, Object> result = null;

        // 优先尝试 AI 生成
        if (apiKey != null && !apiKey.isEmpty()) {
            try {
                result = callAIForExam(examType, difficulty);
                // 保存到数据库
                saveExamToDb(result, examType, difficulty);
                return result;
            } catch (Exception e) {
                log.error("AI 生成考试失败，从数据库获取", e);
            }
        }

        // AI 不可用，从数据库随机获取
        result = getRandomExamFromDb(examType);
        if (result != null) {
            log.info("从数据库获取考试");
            return result;
        }

        // 数据库也没有，使用 Mock 数据
        log.warn("数据库无数据，使用 Mock");
        result = generateMockExam(examType);
        saveExamToDb(result, examType, difficulty);
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
        String randomSeed = UUID.randomUUID().toString().substring(0, 8);
        long timestamp = System.currentTimeMillis();

        int questionCount = getQuestionCount(examType);
        String examName = getExamName(examType);

        String systemPrompt = "你是一个专业的英语考试出题专家，擅长出 CET-4、CET-6、IELTS、TOEFL、GRE 等考试题目。务必按要求生成完整结构的试卷。";
        String userPrompt = String.format(
                "[Session ID: %s-%d] 请为 %s 考试生成一份迷你版全真模拟试卷，必须包含 Writing、Listening、Reading、Translation 四个部分。\n" +
                        "要求：\n" +
                        "1. 试卷结构（共约27题：1写作+10听力+15阅读+1翻译）：\n" +
                        "   - Part I Writing: 1道作文题 (type='essay', section='Part I Writing'，text包含题目要求，options为空数组)\n" +
                        "   - Part II Listening: 2段对话/短文，共10道选择题（每段5题，id分别为2-6和7-11，audioScript字段存放完整对话，同一段对话的5道题audioScript必须完全相同）\n"
                        +
                        "   - Part III Reading: 3篇短文，共15道选择题（每篇5题，id分别为12-16、17-21、22-26，passage字段存放完整文章，同一篇文章的5道题passage必须完全相同）\n"
                        +
                        "   - Part IV Translation: 1道翻译题（id为27，type='translation', section='Part IV Translation'，text包含中文待译段落约100字，options为空数组）\n"
                        +
                        "2. 所有选择题必须有4个选项、correct字段和explanation字段\n" +
                        "3. 返回纯JSON，questions数组扁平化存储。示例：\n" +
                        "{\n" +
                        "  \"title\": \"CET-4 全真模拟\",\n" +
                        "  \"questions\": [\n" +
                        "    {\"id\":1, \"section\":\"Part I Writing\", \"type\":\"essay\", \"text\":\"Directions: Write an essay...\", \"options\":[]},\n"
                        +
                        "    {\"id\":2, \"section\":\"Part II Listening\", \"type\":\"listening\", \"audioScript\":\"M: Hi... W: Hello...\", \"text\":\"Q1: What...\", \"options\":[\"A.\",\"B.\",\"C.\",\"D.\"], \"correct\":0, \"explanation\":\"...\"},\n"
                        +
                        "    {\"id\":3, \"section\":\"Part II Listening\", \"type\":\"listening\", \"audioScript\":\"(同上)\", \"text\":\"Q2: ...\", \"options\":[...], \"correct\":1, \"explanation\":\"...\"},\n"
                        +
                        "    {\"id\":4, \"section\":\"Part III Reading\", \"type\":\"reading\", \"passage\":\"Full passage text...\", \"text\":\"Q1: ...\", \"options\":[...], \"correct\":0, \"explanation\":\"...\"},\n"
                        +
                        "    {\"id\":7, \"section\":\"Part IV Translation\", \"type\":\"translation\", \"text\":\"Directions: Translate...中文段落\", \"options\":[], \"explanation\":\"参考译文...\"}\n"
                        +
                        "  ]\n" +
                        "}",
                randomSeed, timestamp, examName, questionCount, difficulty);

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
            MockExam exam = new MockExam();
            exam.setTitle((String) result.getOrDefault("title", getExamName(examType) + " 模拟考试"));
            exam.setExamType(examType);
            exam.setDuration(getDuration(examType));
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
            Generation gen = new Generation();
            Message systemMsg = Message.builder().role(Role.SYSTEM.getValue()).content(systemPrompt).build();
            Message userMsg = Message.builder().role(Role.USER.getValue()).content(userPrompt).build();

            GenerationParam param = GenerationParam.builder()
                    .apiKey(apiKey)
                    .model(modelName)
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
        return switch (examType.toLowerCase()) {
            case "cet4", "cet6" -> 20;
            case "ielts" -> 15;
            case "toefl" -> 15;
            case "gre" -> 10;
            default -> 10;
        };
    }

    private String getExamName(String examType) {
        return switch (examType.toLowerCase()) {
            case "cet4" -> "CET-4 大学英语四级";
            case "cet6" -> "CET-6 大学英语六级";
            case "ielts" -> "IELTS 雅思";
            case "toefl" -> "TOEFL 托福";
            case "gre" -> "GRE";
            default -> "英语";
        };
    }

    private int getDuration(String examType) {
        return switch (examType.toLowerCase()) {
            case "cet4", "cet6" -> 130;
            case "ielts" -> 60;
            case "toefl" -> 45;
            case "gre" -> 30;
            default -> 30;
        };
    }

    private int getDifficultyLevel(String difficulty) {
        return switch (difficulty.toLowerCase()) {
            case "easy" -> 2;
            case "medium" -> 3;
            case "hard" -> 4;
            default -> 3;
        };
    }
}
