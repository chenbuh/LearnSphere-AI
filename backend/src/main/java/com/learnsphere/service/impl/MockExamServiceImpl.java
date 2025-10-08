package com.learnsphere.service.impl;

import cn.hutool.json.JSONUtil;
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
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
public class MockExamServiceImpl implements IMockExamService {

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
            map.put("participants", exam.getParticipants());
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

        // 增加参与人数
        exam.setParticipants(exam.getParticipants() + 1);
        mockExamMapper.updateById(exam);

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
    public Map<String, Object> submitExam(Long userId, Long examId, List<Integer> answers, Integer timeSpent) {
        MockExam exam = mockExamMapper.selectById(examId);
        if (exam == null) {
            throw new RuntimeException("考试不存在");
        }

        // 解析题目并计算得分
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> questions = (List<Map<String, Object>>) (List<?>) JSONUtil.toList(exam.getQuestions(), Map.class);
        int correctCount = 0;
        int totalCount = questions.size();

        for (int i = 0; i < Math.min(answers.size(), totalCount); i++) {
            Object correctObj = questions.get(i).get("correct");
            int correct = correctObj instanceof Integer ? (Integer) correctObj : Integer.parseInt(correctObj.toString());
            if (answers.get(i) == correct) {
                correctCount++;
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

    /**
     * AI 生成考试题目
     */
    private Map<String, Object> callAIForExam(String examType, String difficulty) {
        String randomSeed = UUID.randomUUID().toString().substring(0, 8);
        long timestamp = System.currentTimeMillis();

        int questionCount = getQuestionCount(examType);
        String examName = getExamName(examType);

        String systemPrompt = "你是一个专业的英语考试出题专家，擅长出 CET-4、CET-6、IELTS、TOEFL、GRE 等考试题目。";
        String userPrompt = String.format(
                "[Session ID: %s-%d] 请为 %s 考试生成 %d 道选择题。难度: %s。\n" +
                        "要求：\n" +
                        "1. 题目类型包括：词汇、语法、阅读理解\n" +
                        "2. 每题4个选项\n" +
                        "3. 返回纯 JSON，格式如下：\n" +
                        "{\n" +
                        "  \"title\": \"考试标题\",\n" +
                        "  \"questions\": [\n" +
                        "    {\"id\": 1, \"type\": \"vocabulary\", \"text\": \"题目\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correct\": 0, \"explanation\": \"解析\"}\n" +
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
     * 生成 Mock 考试数据
     */
    private Map<String, Object> generateMockExam(String examType) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> questions = new ArrayList<>();

        String examName = getExamName(examType);
        result.put("title", examName + " 模拟考试 " + System.currentTimeMillis() % 1000);

        // 生成示例题目
        String[][] mockQuestions = {
                {"1", "vocabulary", "The company decided to _____ the project due to budget constraints.", "abandon,adopt,adapt,absorb", "0", "abandon 意为放弃，符合语境"},
                {"2", "vocabulary", "She has a _____ for learning new languages.", "talent,tale,tail,tall", "0", "talent 意为天赋"},
                {"3", "grammar", "If I _____ you, I would accept the offer.", "am,was,were,be", "2", "虚拟语气用 were"},
                {"4", "grammar", "The book _____ on the table belongs to Mary.", "lying,laying,lain,lay", "0", "lie 的现在分词是 lying"},
                {"5", "vocabulary", "The weather forecast _____ rain for tomorrow.", "predicts,prevents,pretends,prefers", "0", "predict 意为预测"},
                {"6", "grammar", "Neither the teacher nor the students _____ present.", "is,are,was,were", "3", "neither...nor 就近原则，students 是复数"},
                {"7", "vocabulary", "Please _____ your seatbelt during takeoff.", "fasten,fast,feast,fist", "0", "fasten 意为系紧"},
                {"8", "grammar", "I wish I _____ harder when I was young.", "study,studied,had studied,have studied", "2", "wish 后用过去完成时表示过去的虚拟"},
                {"9", "vocabulary", "The _____ of the meeting is to discuss the new policy.", "purpose,propose,purse,purchase", "0", "purpose 意为目的"},
                {"10", "grammar", "By next year, she _____ here for ten years.", "will work,will have worked,works,worked", "1", "将来完成时"}
        };

        for (String[] q : mockQuestions) {
            Map<String, Object> question = new HashMap<>();
            question.put("id", Integer.parseInt(q[0]));
            question.put("type", q[1]);
            question.put("text", q[2]);
            question.put("options", Arrays.asList(q[3].split(",")));
            question.put("correct", Integer.parseInt(q[4]));
            question.put("explanation", q[5]);
            questions.add(question);
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
