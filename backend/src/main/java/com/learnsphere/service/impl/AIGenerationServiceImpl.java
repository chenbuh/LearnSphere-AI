package com.learnsphere.service.impl;

import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnsphere.entity.GrammarExercise;
import com.learnsphere.entity.ListeningMaterial;
import com.learnsphere.entity.ReadingArticle;
import com.learnsphere.entity.WritingTopic;
import com.learnsphere.mapper.GrammarExerciseMapper;
import com.learnsphere.mapper.ListeningMaterialMapper;
import com.learnsphere.mapper.ReadingArticleMapper;
import com.learnsphere.mapper.WritingTopicMapper;
import com.learnsphere.service.IAIGenerationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
public class AIGenerationServiceImpl implements IAIGenerationService {

    @Value("${ai.api-key:}")
    private String apiKey;

    @Value("${ai.model:qwen-plus}")
    private String modelName;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private ReadingArticleMapper readingArticleMapper;

    @Autowired
    private ListeningMaterialMapper listeningMaterialMapper;

    @Autowired
    private WritingTopicMapper writingTopicMapper;

    @Autowired
    private GrammarExerciseMapper grammarExerciseMapper;

    @Autowired
    private com.learnsphere.mapper.UserAnalysisMapper userAnalysisMapper;
    // Assuming GrammarExerciseMapper exists or I should create it?
    // I haven't created GrammarExerciseMapper yet. I'll stick to Reading/Listening
    // for now and add Grammar later if I find it.

    @Autowired
    private com.learnsphere.mapper.SpeakingTopicMapper speakingTopicMapper;

    @Override
    public Map<String, Object> generateSpeaking(String type, String difficulty) {
        log.info("Generating speaking topic for: {} / {}", type, difficulty);

        // Try AI generation first
        if (apiKey != null && !apiKey.isEmpty()) {
            try {
                String currentDate = java.time.LocalDate.now().toString();
                String prompt = String.format(
                        "Generate a speaking practice topic. Type: %s. Difficulty: %s. \n" +
                                "Relevance: Must be based on potential REAL-WORLD scenarios or current trends relative to today (%s).\n"
                                +
                                "Output JSON format: { \"title\": \"...\", \"question\": \"...\", \"keywords\": [\"word1\", \"word2\"], \"tips\": [\"tip1\", \"tip2\"] }",
                        type, difficulty, currentDate);
                String content = callLLM("You are an ESL teacher.", prompt);

                if (content.contains("{") && content.contains("}")) {
                    content = content.substring(content.indexOf("{"), content.lastIndexOf("}") + 1);
                }

                // Save to DB asynchronously or synchronously
                JSONObject json = JSONUtil.parseObj(content);
                com.learnsphere.entity.SpeakingTopic topic = new com.learnsphere.entity.SpeakingTopic();
                topic.setType(type);
                topic.setDifficulty(difficulty);
                topic.setTitle(json.getStr("title"));
                topic.setQuestion(json.getStr("question"));
                topic.setKeywords(json.getJSONArray("keywords").toString());
                topic.setTips(json.getJSONArray("tips").toString());
                speakingTopicMapper.insert(topic);

                return json;
            } catch (Exception e) {
                log.error("AI Speaking Gen failed, falling back to DB", e);
            }
        }

        // Fallback to DB
        com.learnsphere.entity.SpeakingTopic dbTopic = speakingTopicMapper.getRandomTopic(type, difficulty);
        if (dbTopic != null) {
            Map<String, Object> map = new HashMap<>();
            map.put("title", dbTopic.getTitle());
            map.put("question", dbTopic.getQuestion());
            map.put("keywords", JSONUtil.parseArray(dbTopic.getKeywords()));
            map.put("tips", JSONUtil.parseArray(dbTopic.getTips()));
            return map;
        }

        return generateMockSpeaking(type);
    }

    @Override
    public Map<String, Object> evaluateSpeaking(String topic, String transcription) {
        log.info("Evaluating speaking: {}", topic);
        if (apiKey == null || apiKey.isEmpty()) {
            return generateMockSpeakingEvaluation();
        }

        try {
            String prompt = String.format(
                    "Evaluate the following spoken response (transcribed to text) for the topic '%s'.\n" +
                            "Response: \"%s\"\n" +
                            "Score based on Fluency, Vocabulary, Grammar, and Relevance (0-100 scale).\n" +
                            "Output JSON: { \"score\": 85, \"fluency\": 80, \"vocabulary\": 90, \"grammar\": 85, \"relevance\": 85, \"feedback\": \"...\", \"suggestions\": [\"...\"] }",
                    topic, transcription);

            String content = callLLM("You are an IELTS examiner.", prompt);
            if (content.contains("{") && content.contains("}")) {
                content = content.substring(content.indexOf("{"), content.lastIndexOf("}") + 1);
            }
            return JSONUtil.parseObj(content);
        } catch (Exception e) {
            log.error("AI Speaking Eval failed", e);
            return generateMockSpeakingEvaluation();
        }
    }

    private Map<String, Object> generateMockSpeaking(String type) {
        Map<String, Object> map = new HashMap<>();
        map.put("title", "Describe a memorable journey");
        map.put("question",
                "Describe a journey that you remember well. You should say: where you went, how you traveled, why you went there, and explain why you remember this journey so well.");
        map.put("keywords", Arrays.asList("destination", "scenery", "unforgettable", "experience"));
        map.put("tips", Arrays.asList("Use past tense", "Include sensory details", "Structure your answer"));
        return map;
    }

    private Map<String, Object> generateMockSpeakingEvaluation() {
        Map<String, Object> map = new HashMap<>();
        map.put("score", 78);
        map.put("fluency", 75);
        map.put("vocabulary", 80);
        map.put("grammar", 70);
        map.put("relevance", 85);
        map.put("feedback",
                "Good effort! You covered the main points. However, there were some pauses and grammatical errors.");
        map.put("suggestions", Arrays.asList("Practice using connecting words", "Review past tense verbs"));
        return map;
    }

    @Override
    public Map<String, Object> generateReading(String source, String category, String difficulty, String length) {
        log.info("Generating reading content for: {} / {} / {}", source, category, difficulty);

        Map<String, Object> result = null;

        // 优先尝试 AI 生成
        if (apiKey != null && !apiKey.isEmpty()) {
            try {
                result = callDashScopeForReading(source, category, difficulty, length);
                // AI 生成成功，保存到数据库
                saveReadingToDb(result, source, category, difficulty);
                return result;
            } catch (Exception e) {
                log.error("AI generation failed, falling back to database", e);
            }
        }

        // AI 不可用时，从数据库随机获取
        result = getRandomReadingFromDb(category, difficulty);
        if (result != null) {
            log.info("Retrieved reading from database");
            return result;
        }

        // 数据库也没有，使用 mock 数据
        log.warn("No data in database, using mock data");
        result = generateMockReading(category, difficulty);
        return result;
    }

    /**
     * 保存阅读文章到数据库
     */
    private void saveReadingToDb(Map<String, Object> result, String source, String category, String difficulty) {
        try {
            ReadingArticle article = new ReadingArticle();
            article.setTitle((String) result.getOrDefault("title", "Untitled"));
            article.setContent((String) result.getOrDefault("content", ""));
            article.setSource(source);
            article.setCategory(category);
            article.setDifficulty(difficulty);
            article.setWordCount(
                    result.get("content") != null ? ((String) result.get("content")).split("\\s+").length : 0);

            Object questions = result.get("questions");
            if (questions != null) {
                article.setQuestions(objectMapper.writeValueAsString(questions));
            }

            readingArticleMapper.insert(article);
            log.info("Saved reading article to DB: {}", article.getId());
        } catch (Exception e) {
            log.error("Failed to save reading article", e);
        }
    }

    /**
     * 从数据库随机获取阅读文章
     */
    private Map<String, Object> getRandomReadingFromDb(String category, String difficulty) {
        try {
            List<ReadingArticle> articles = readingArticleMapper.selectList(
                    new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<ReadingArticle>()
                            .eq(category != null, "category", category)
                            .eq(difficulty != null, "difficulty", difficulty)
                            .orderByAsc("RAND()")
                            .last("LIMIT 1"));

            if (articles != null && !articles.isEmpty()) {
                ReadingArticle article = articles.get(0);
                Map<String, Object> result = new HashMap<>();
                result.put("id", article.getId());
                result.put("title", article.getTitle());
                result.put("content", article.getContent());
                result.put("source", article.getSource());
                result.put("questions", JSONUtil.parseArray(article.getQuestions()));
                return result;
            }
        } catch (Exception e) {
            log.error("Failed to get reading from database", e);
        }
        return null;
    }

    private Map<String, Object> callDashScopeForReading(String source, String category, String difficulty,
            String length)
            throws Exception {
        String currentDate = java.time.LocalDate.now().toString();
        String systemPrompt = "You are an expert English Education content creator AND a journalist.";
        String userPrompt = String.format(
                "Generate a reading comprehension article based on the LATEST news or current events relative to today's date (%s).\n"
                        +
                        "Topic area: %s. Difficulty: %s. Length: %s.\n" +
                        "Requirements:\n" +
                        "1. Content must be fresh, engaging, and factual (or based on real trends).\n" +
                        "2. Generate %s questions (multiple choice) with answers.\n" +
                        "3. JSON format: { \"title\": \"...\", \"content\": \"...\", \"questions\": [ { \"id\": 1, \"text\": \"...\", \"options\": [\"A..\", \"B..\"], \"answer\": \"A\", \"explanation\": \"...\" } ] }",
                currentDate, category, difficulty, length, length.equals("long") ? "5" : "3");

        return JSONUtil.parseObj(callLLM(systemPrompt, userPrompt));
    }

    @Override
    public Map<String, Object> generateWriting(String examType, String mode) {
        log.info("Generating writing topic for: {} / {}", examType, mode);

        Map<String, Object> result = null;

        // 优先尝试 AI 生成
        if (apiKey != null && !apiKey.isEmpty()) {
            try {
                result = callDashScopeForWriting(examType, mode);
                // AI 生成成功，保存到数据库
                saveWritingToDb(result, examType, mode);
                return result;
            } catch (Exception e) {
                log.error("AI writing generation failed, falling back to database", e);
            }
        }

        // AI 不可用时，从数据库随机获取
        result = getRandomWritingFromDb(examType, mode);
        if (result != null) {
            log.info("Retrieved writing topic from database");
            return result;
        }

        // 数据库也没有，使用 mock 数据
        log.warn("No data in database, using mock data");
        return generateMockWriting(examType, mode);
    }

    /**
     * 保存写作题目到数据库
     */
    private void saveWritingToDb(Map<String, Object> result, String examType, String mode) {
        try {
            WritingTopic topic = new WritingTopic();
            topic.setExamType(examType);
            topic.setMode(mode);
            topic.setTitle((String) result.getOrDefault("title", "Untitled"));
            topic.setPrompt((String) result.getOrDefault("prompt", ""));
            topic.setMinWords((Integer) result.getOrDefault("minWords", 250));

            Object tips = result.get("tips");
            if (tips != null) {
                topic.setTips(objectMapper.writeValueAsString(tips));
            }

            topic.setDifficulty("medium");

            writingTopicMapper.insert(topic);
            log.info("Saved writing topic to DB: {}", topic.getId());
        } catch (Exception e) {
            log.error("Failed to save writing topic", e);
        }
    }

    /**
     * 从数据库随机获取写作题目
     */
    private Map<String, Object> getRandomWritingFromDb(String examType, String mode) {
        try {
            List<WritingTopic> topics = writingTopicMapper.selectList(
                    new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<WritingTopic>()
                            .eq(examType != null, "exam_type", examType)
                            .eq(mode != null, "mode", mode)
                            .orderByAsc("RAND()")
                            .last("LIMIT 1"));

            if (topics != null && !topics.isEmpty()) {
                WritingTopic topic = topics.get(0);
                Map<String, Object> result = new HashMap<>();
                result.put("id", topic.getId());
                result.put("title", topic.getTitle());
                result.put("prompt", topic.getPrompt());
                result.put("minWords", topic.getMinWords());
                if (topic.getTips() != null) {
                    result.put("tips", JSONUtil.parseArray(topic.getTips()));
                }
                return result;
            }
        } catch (Exception e) {
            log.error("Failed to get writing from database", e);
        }
        return null;
    }

    @Override
    public Map<String, Object> evaluateWriting(String topic, String content) {
        log.info("Evaluating writing: {}", topic);

        if (apiKey != null && !apiKey.isEmpty()) {
            try {
                return callDashScopeForEvaluation(topic, content);
            } catch (Exception e) {
                log.error("AI evaluations failed", e);
            }
        }
        return generateMockEvaluation(content);
    }

    @Override
    public Map<String, Object> generateListening(String type, String difficulty) {
        log.info("Generating listening for: {} / {}", type, difficulty);

        Map<String, Object> result = null;

        // 优先尝试 AI 生成
        if (apiKey != null && !apiKey.isEmpty()) {
            try {
                result = callDashScopeForListening(type, difficulty);
                saveListeningToDb(result, type, difficulty);
                return result;
            } catch (Exception e) {
                log.error("AI listening generation failed, falling back to database", e);
            }
        }

        // AI 不可用时，从数据库随机获取
        result = getRandomListeningFromDb(type, difficulty);
        if (result != null) {
            log.info("Retrieved listening from database");
            return result;
        }

        // 数据库也没有，使用 mock 数据
        log.warn("No data in database, using mock data");
        return generateMockListening(type, difficulty);
    }

    /**
     * AI 生成听力材料
     */
    private Map<String, Object> callDashScopeForListening(String type, String difficulty) {
        String randomSeed = UUID.randomUUID().toString().substring(0, 8);
        long timestamp = System.currentTimeMillis();

        String systemPrompt = "You are an English listening comprehension expert. Create realistic listening scripts and questions.";
        String userPrompt = String.format(
                "[Session ID: %s-%d] Generate a UNIQUE English listening comprehension exercise. " +
                        "Type: %s. Difficulty: %s. " +
                        "Return ONLY a raw JSON object with: " +
                        "{ \"title\": \"...\", \"script\": \"The listening script...\", \"questions\": [{ \"id\": 1, \"question\": \"...\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correct\": 0 }] }",
                randomSeed, timestamp, type, difficulty);

        String content = callLLM(systemPrompt, userPrompt);
        if (content.startsWith("```json")) {
            content = content.substring(7);
            if (content.endsWith("```")) {
                content = content.substring(0, content.length() - 3);
            }
        }
        return JSONUtil.parseObj(content);
    }

    /**
     * 保存听力材料到数据库
     */
    private void saveListeningToDb(Map<String, Object> result, String type, String difficulty) {
        try {
            ListeningMaterial material = new ListeningMaterial();
            material.setTitle((String) result.getOrDefault("title", "AI Generated Listening - " + type));
            material.setScript((String) result.getOrDefault("script", ""));
            material.setType(type);
            material.setDifficulty(difficulty);

            Object questions = result.get("questions");
            if (questions != null) {
                material.setQuestions(objectMapper.writeValueAsString(questions));
            }

            listeningMaterialMapper.insert(material);
            log.info("Saved listening material to DB: {}", material.getId());
        } catch (Exception e) {
            log.error("Failed to save listening material", e);
        }
    }

    /**
     * 从数据库随机获取听力材料
     */
    private Map<String, Object> getRandomListeningFromDb(String type, String difficulty) {
        try {
            List<ListeningMaterial> materials = listeningMaterialMapper.selectList(
                    new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<ListeningMaterial>()
                            .eq(type != null, "type", type)
                            .eq(difficulty != null, "difficulty", difficulty)
                            .orderByAsc("RAND()")
                            .last("LIMIT 1"));

            if (materials != null && !materials.isEmpty()) {
                ListeningMaterial material = materials.get(0);
                Map<String, Object> result = new HashMap<>();
                result.put("id", material.getId());
                result.put("title", material.getTitle());
                result.put("script", material.getScript());
                result.put("questions", JSONUtil.parseArray(material.getQuestions()));
                return result;
            }
        } catch (Exception e) {
            log.error("Failed to get listening from database", e);
        }
        return null;
    }

    /**
     * Mock 听力数据
     */
    private Map<String, Object> generateMockListening(String type, String difficulty) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> questions = new ArrayList<>();

        String script;
        if ("ted".equalsIgnoreCase(type)) {
            script = "Today, I want to talk about the power of vulnerability. We often think of vulnerability as weakness, but I argue that it is our greatest measure of courage.";
        } else {
            script = "Speaker A: Have you considered the impact of renewable energy on the local economy? \n" +
                    "Speaker B: Yes, absolutely. While the initial investment is high, the long-term benefits in terms of job creation and energy independence are undeniable.";
        }

        Map<String, Object> q1 = new HashMap<>();
        q1.put("id", 1);
        q1.put("question", "What is the main topic discussing?");
        q1.put("options",
                Arrays.asList("Renewable Energy", "Traditional Farming", "Space Exploration", "History of Art"));
        q1.put("correct", 0);
        questions.add(q1);

        result.put("title", "Listening - " + type);
        result.put("script", script);
        result.put("questions", questions);
        return result;
    }

    @Override
    public Map<String, Object> generateGrammar(String topic, String difficulty) {
        log.info("Generating grammar for: {} / {}", topic, difficulty);

        Map<String, Object> result = null;

        // 优先尝试 AI 生成
        if (apiKey != null && !apiKey.isEmpty()) {
            try {
                // 生成随机种子，确保每次生成不同的内容
                String randomSeed = UUID.randomUUID().toString().substring(0, 8);
                long timestamp = System.currentTimeMillis();

                String systemPrompt = "You are an English grammar expert. You generate high-quality, varied grammar exercises for exams like IELTS, TOEFL, and CET. Always create fresh, unique questions.";
                String userPrompt = String.format(
                        "[Session ID: %s-%d] Generate 10 COMPLETELY NEW and UNIQUE English grammar fill-in-the-blank questions about '%s' (difficulty level: %s).\n"
                                +
                                "Requirements:\n" +
                                "1. Create BRAND NEW questions different from any previous generations.\n" +
                                "2. Cover various aspects of the topic with diverse sentence structures.\n" +
                                "3. Each question must have one blank marked with '_____'.\n" +
                                "4. Provide exactly 4 distinct options.\n" +
                                "5. Include a clear explanation for the correct answer.\n" +
                                "6. Use varied vocabulary and contexts (daily life, work, study, travel, etc.).\n" +
                                "7. Return ONLY a valid JSON object. Do not include any conversational text or markdown blocks.\n\n"
                                +
                                "JSON Structure:\n" +
                                "{\n" +
                                "  \"questions\": [\n" +
                                "    { \"id\": 1, \"text\": \"...\", \"options\": [\"...\", \"...\", \"...\", \"...\"], \"correct\": 0, \"explanation\": \"...\" }\n"
                                +
                                "  ]\n" +
                                "}",
                        randomSeed, timestamp, topic, difficulty);

                String aiResponse = callLLM(systemPrompt, userPrompt);

                // 清理 AI 返回的格式
                String cleanedResponse = aiResponse.trim();
                if (cleanedResponse.startsWith("```")) {
                    cleanedResponse = cleanedResponse.replaceAll("^```(json)?\\n?", "").replaceAll("\\n?```$", "");
                }

                result = objectMapper.readValue(cleanedResponse,
                        new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {
                        });
                log.info("AI grammar generated successfully for topic: {}", topic);

                // AI 生成成功，保存到数据库
                saveGrammarToDb(result, topic, difficulty);
                return result;
            } catch (Exception e) {
                log.error("AI grammar generation failed, falling back to database", e);
            }
        }

        // AI 不可用时，从数据库随机获取
        result = getRandomGrammarFromDb(topic, difficulty);
        if (result != null) {
            log.info("Retrieved grammar from database");
            return result;
        }

        // 数据库也没有，使用 mock 数据
        log.warn("No data in database, using mock data");
        return generateMockGrammarQuestions();
    }

    /**
     * 保存语法练习到数据库
     */
    private void saveGrammarToDb(Map<String, Object> result, String topic, String difficulty) {
        try {
            GrammarExercise exercise = new GrammarExercise();
            exercise.setTopic(topic != null ? topic : "General Grammar");
            exercise.setDifficulty(difficulty != null ? difficulty : "medium");

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> questions = (List<Map<String, Object>>) result.get("questions");
            String questionsJson = objectMapper.writeValueAsString(questions);
            exercise.setQuestions(questionsJson);
            exercise.setQuestion(topic != null ? topic : "Grammar Exercise");

            grammarExerciseMapper.insert(exercise);
            log.info("Saved grammar exercise to DB: {}", exercise.getId());
        } catch (Exception e) {
            log.error("Failed to save grammar exercise", e);
        }
    }

    /**
     * 从数据库随机获取语法练习
     */
    private Map<String, Object> getRandomGrammarFromDb(String topic, String difficulty) {
        try {
            List<GrammarExercise> exercises = grammarExerciseMapper.selectList(
                    new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<GrammarExercise>()
                            .eq(topic != null, "topic", topic)
                            .eq(difficulty != null, "difficulty", difficulty)
                            .orderByAsc("RAND()")
                            .last("LIMIT 1"));

            if (exercises != null && !exercises.isEmpty()) {
                GrammarExercise exercise = exercises.get(0);
                Map<String, Object> result = new HashMap<>();
                result.put("id", exercise.getId());
                result.put("topic", exercise.getTopic());
                result.put("questions", JSONUtil.parseArray(exercise.getQuestions()));
                return result;
            }
        } catch (Exception e) {
            log.error("Failed to get grammar from database", e);
        }
        return null;
    }

    private Map<String, Object> generateMockGrammarQuestions() {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> questions = new ArrayList<>();

        // Generate dynamic mock data based on general variety
        String[][] mockData;

        // This is just a fallback, but let's make it look slightly better
        mockData = new String[][] {
                { "1", "She _____ to the gym every morning.", "go,goes,going,gone", "1", "Present Simple for habits." },
                { "2", "We _____ English for three years now.", "study,are studying,have been studying,had studied",
                        "2", "Present Perfect Continuous for duration." },
                { "3", "If it _____ tomorrow, we will stay home.", "rain,rains,will rain,rained", "1",
                        "First conditional: 'if' clause uses present simple." },
                { "4", "The window _____ by the boy yesterday.", "broke,was broken,has broken,is broken", "1",
                        "Past Simple Passive." },
                { "5", "I am looking forward to _____ you.", "see,saw,seeing,seen", "2",
                        "'Look forward to' is followed by a gerund (-ing)." },
                { "6", "You _____ touch that; it's dangerous.", "mustn't,don't have to,needn't,can't", "0",
                        "Prohibition." },
                { "7", "This is the car _____ I bought last week.", "who,whom,whose,which", "3",
                        "Relative pronoun for objects." },
                { "8", "He is _____ than his brother.", "tall,taller,tallest,more tall", "1", "Comparative degree." },
                { "9", "I don't know _____ she is crying.", "what,why,which,who", "1", "Conjunction for reasons." },
                { "10", "They _____ their homework yet.", "didn't finish,haven't finished,don't finish,hadn't finished",
                        "1", "Present Perfect with 'yet'." }
        };

        for (String[] q : mockData) {
            Map<String, Object> question = new HashMap<>();
            question.put("id", Integer.parseInt(q[0]));
            question.put("text", q[1]);
            question.put("options", Arrays.asList(q[2].split(",")));
            question.put("correct", Integer.parseInt(q[3]));
            question.put("explanation", q[4]);
            questions.add(question);
        }

        result.put("questions", questions);
        return result;
    }

    @Override
    public List<Map<String, Object>> getRecentReadings() {
        try {
            List<ReadingArticle> articles = readingArticleMapper.selectList(
                    new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<ReadingArticle>()
                            .orderByDesc("id")
                            .last("LIMIT 10"));

            List<Map<String, Object>> result = new ArrayList<>();
            for (ReadingArticle article : articles) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", article.getId());
                map.put("title", article.getTitle());
                map.put("content", article.getContent());
                map.put("source", article.getSource());
                map.put("category", article.getCategory());
                map.put("difficulty", article.getDifficulty());
                // 安全处理 questions 字段
                String questionsStr = article.getQuestions();
                if (questionsStr != null && !questionsStr.isEmpty()) {
                    map.put("questions", JSONUtil.parseArray(questionsStr));
                } else {
                    map.put("questions", new ArrayList<>());
                }
                result.add(map);
            }
            return result;
        } catch (Exception e) {
            log.error("获取阅读历史失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Map<String, Object>> getRecentListenings() {
        try {
            List<ListeningMaterial> materials = listeningMaterialMapper.selectList(
                    new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<ListeningMaterial>()
                            .orderByDesc("id")
                            .last("LIMIT 10"));

            List<Map<String, Object>> result = new ArrayList<>();
            for (ListeningMaterial material : materials) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", material.getId());
                map.put("title", material.getTitle());
                map.put("script", material.getScript());
                map.put("type", material.getType());
                map.put("difficulty", material.getDifficulty());
                // 安全处理 questions 字段
                String questionsStr = material.getQuestions();
                if (questionsStr != null && !questionsStr.isEmpty()) {
                    map.put("questions", JSONUtil.parseArray(questionsStr));
                } else {
                    map.put("questions", new ArrayList<>());
                }
                result.add(map);
            }
            return result;
        } catch (Exception e) {
            log.error("获取听力历史失败", e);
            return new ArrayList<>();
        }
    }

    // Fields moved to top class level

    /**
     * 通用 LLM 调用方法
     */
    /**
     * 通用 LLM 调用方法 (使用 DashScope SDK - 官方示例)
     */
    private String callLLM(String systemPrompt, String userPrompt) {
        log.info("========== 调用 Qwen API ==========");
        log.info("Model: {}", modelName);
        log.info("System Prompt: {}", systemPrompt.substring(0, Math.min(100, systemPrompt.length())));
        log.info("User Prompt: {}", userPrompt.substring(0, Math.min(150, userPrompt.length())));

        try {
            Generation gen = new Generation();

            Message systemMsg = Message.builder()
                    .role(Role.SYSTEM.getValue())
                    .content(systemPrompt)
                    .build();

            Message userMsg = Message.builder()
                    .role(Role.USER.getValue())
                    .content(userPrompt)
                    .build();

            GenerationParam param = GenerationParam.builder()
                    .apiKey(apiKey)
                    .model(modelName) // qwen-plus
                    .messages(Arrays.asList(systemMsg, userMsg))
                    .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                    .build();

            log.info("正在发送请求到 Qwen API...");
            GenerationResult result = gen.call(param);
            String response = result.getOutput().getChoices().get(0).getMessage().getContent();
            log.info("✅ Qwen API 响应成功 (长度: {} 字符)", response.length());
            log.info("Response preview: {}", response.substring(0, Math.min(200, response.length())));
            return response;

        } catch (Exception e) {
            log.error("❌ Qwen API 调用失败: {}", e.getMessage(), e);
            throw new RuntimeException("AI 生成失败: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> callDashScopeForWriting(String examType, String mode) {
        // 生成随机种子，确保每次生成不同的内容
        String randomSeed = UUID.randomUUID().toString().substring(0, 8);
        long timestamp = System.currentTimeMillis();

        String systemPrompt = "You are an expert English exam content generator. You specialize in creating realistic, unique writing prompts for exams like IELTS, TOEFL, CET-4/6, and GRE. Always create fresh, original content.";
        String userPrompt = String.format(
                "[Session ID: %s-%d] Generate a BRAND NEW and UNIQUE writing prompt for %s exam, type: %s. " +
                        "Create an original topic that hasn't been used before. " +
                        "Return ONLY a raw JSON object (no markdown formatting) with the following structure: " +
                        "{ \"title\": \"Task Title\", \"prompt\": \"The detailed writing prompt text...\", \"minWords\": 150, \"tips\": [\"Tip 1\", \"Tip 2\"] }",
                randomSeed, timestamp, examType, mode);

        try {
            String content = callLLM(systemPrompt, userPrompt);
            if (content.startsWith("```json")) {
                content = content.substring(7);
                if (content.endsWith("```"))
                    content = content.substring(0, content.length() - 3);
            }
            return JSONUtil.parseObj(content);
        } catch (Exception e) {
            log.error("Generate Writing Failed", e);
            return generateMockWriting(examType, mode);
        }
    }

    private Map<String, Object> callDashScopeForEvaluation(String topic, String essayContent) {
        String systemPrompt = "You are an expert English writing examiner. You evaluate essays based on coherence, vocabulary, grammar, and task achievement.";
        String userPrompt = String.format(
                "Evaluate the following English essay.\nTopic: %s\nContent: %s\n\n" +
                        "Return ONLY a raw JSON object (no markdown) with: " +
                        "{ \"score\": 6.5, \"feedback\": [ { \"type\": \"grammar(or vocab/general)\", \"text\": \"Specific advice...\", \"severity\": \"error(or warning/success)\" } ] }",
                topic, essayContent);

        try {
            String content = callLLM(systemPrompt, userPrompt);
            if (content.startsWith("```json")) {
                content = content.substring(7);
                if (content.endsWith("```"))
                    content = content.substring(0, content.length() - 3);
            }
            Map<String, Object> result = JSONUtil.parseObj(content);
            // Ensure score is present
            if (!result.containsKey("score"))
                result.put("score", 6.0);
            return result;
        } catch (Exception e) {
            log.error("Evaluate Writing Failed", e);
            return generateMockEvaluation(essayContent);
        }
    }

    // === Mock/Fallback Methods ===

    private Map<String, Object> generateMockWriting(String examType, String mode) {
        Map<String, Object> result = new HashMap<>();
        String title = "Technology and Education";
        String prompt = "Some people think that technology is increasing the gap between the rich and the poor. Others think it is narrowing the gap. Discuss both views and give your opinion.";
        int minWords = 250;
        List<String> tips = Arrays.asList("Define the gap clearly.",
                "Use examples from developed vs developing countries.");

        if ("ielts".equalsIgnoreCase(examType)) {
            title = "Urbanization";
            prompt = "More and more people are moving from rural areas to cities. What are the causes? what are the effects? Discuss.";
            tips = Arrays.asList("Focus on push and pull factors.", "Discuss infrastructure challenges.");
        }

        result.put("title", title);
        result.put("prompt", prompt);
        result.put("minWords", minWords);
        result.put("tips", tips);
        return result;
    }

    private Map<String, Object> generateMockEvaluation(String content) {
        Map<String, Object> result = new HashMap<>();
        int wordCount = content.split("\\s+").length;
        double score = 6.0;
        if (wordCount > 250)
            score += 0.5;
        if (wordCount > 300)
            score += 0.5;

        List<Map<String, String>> feedback = new ArrayList<>();
        Map<String, String> fb1 = new HashMap<>();
        fb1.put("type", "grammar");
        fb1.put("text", "Check subject-verb agreement in the second paragraph.");
        fb1.put("severity", "warning");
        feedback.add(fb1);

        Map<String, String> fb2 = new HashMap<>();
        fb2.put("type", "vocab");
        fb2.put("text", "Good use of transitional phrases.");
        fb2.put("severity", "success");
        feedback.add(fb2);

        result.put("score", score);
        result.put("wordCount", wordCount);
        result.put("feedback", feedback);
        return result;
    }

    private Map<String, Object> generateMockReading(String category, String difficulty) {
        Map<String, Object> result = new HashMap<>();

        String title = "";
        String content = "";
        String source = "Generated by AI • " + java.time.LocalDate.now();
        List<Map<String, Object>> questions = new ArrayList<>();

        if ("tech".equals(category)) {
            title = "The Evolution of Quantum Computing";
            content = "Quantum computing represents a paradigm shift in data processing. Unlike classical computers which use bits, quantum computers use qubits. This allows them to perform complex calculations at speeds unimaginable with today's technology. However, maintaining the stability of qubits remains a significant challenge for researchers.";

            questions.add(createQuestion(1, "What is the fundamental unit of quantum computing?",
                    Arrays.asList("Bit", "Byte", "Qubit", "Pixel"), 2));
            questions.add(createQuestion(2, "What is a main challenge mentioned?",
                    Arrays.asList("Cost", "Speed", "Stability", "Size"), 2));
        } else if ("environment".equals(category)) {
            title = "Climate Change and Ocean Currents";
            content = "The warming of global oceans is disrupting major currents that regulate the Earth's climate. The Atlantic Meridional Overturning Circulation (AMOC) is showing signs of slowing down. If this trend continues, it could lead to drastic weather changes across Europe and North America.";

            questions.add(createQuestion(1, "What is AMOC?",
                    Arrays.asList("A wind pattern", "An ocean current system", "A climate treaty", "A research vessel"),
                    1));
            questions.add(createQuestion(2, "What are the potential consequences mentioned?",
                    Arrays.asList("More rain", "Drastic weather changes", "Higher sea levels", "Less pollution"), 1));
        } else {
            title = "Understanding " + category;
            content = "This is a generated article about " + category
                    + ". It is designed to test your reading comprehension skills at the " + difficulty
                    + " level. Please read carefully and answer the questions below.";
            questions.add(createQuestion(1, "What is the main topic?",
                    Arrays.asList(category, "Science", "History", "Arts"), 0));
        }

        result.put("title", title);
        result.put("content", content);
        result.put("source", source);
        result.put("questions", questions);

        return result;
    }

    private Map<String, Object> createQuestion(int id, String text, List<String> options, int correct) {
        Map<String, Object> q = new HashMap<>();
        q.put("id", id);
        q.put("text", text);
        q.put("options", options);
        q.put("correct", correct);
        return q;
    }

    @Override
    public Map<String, Object> generateLearningAnalysis(Long userId, Map<String, Object> stats) {
        log.info("Generating learning analysis for user: {}", userId);

        if (apiKey == null || apiKey.isEmpty()) {
            return generateMockAnalysis();
        }

        try {
            String systemPrompt = "You are an English education expert and AI data analyst. Your task is to provide a comprehensive, personalized English learning analysis report and specific actionable recommendations based on user statistics.";
            String userPrompt = String.format(
                    "Analyze the following student's learning data and generate a detailed report in JSON format.\n" +
                            "Data: %s\n\n" +
                            "Requirements:\n" +
                            "1. Provide an 'overall' score (0-100).\n" +
                            "2. Analyze 6 abilities: vocabulary, grammar, listening, reading, writing, speaking. For each, provide current score and a recommended target score.\n"
                            +
                            "3. Identify 3 'weakPoints'. For each, provide a title, score, and specific 'advice'.\n" +
                            "4. Predict an exam score (scale 0-710, like CET-4/6).\n" +
                            "5. Provide 2-3 specific 'recommendations' for immediate practice. Each recommendation needs: 'title' (e.g., 发现薄弱点), 'content' (e.g., 词汇 · accomplish), 'action' (e.g., 专项强化), and 'path' (one of: /vocabulary, /grammar, /reading, /listening, /writing).\n"
                            +
                            "6. Return ONLY a valid JSON object with the following structure:\n" +
                            "{\n" +
                            "  \"overall\": 68.5,\n" +
                            "  \"growth\": 2.4,\n" +
                            "  \"gap\": -12,\n" +
                            "  \"predict\": 520,\n" +
                            "  \"abilities\": [\n" +
                            "    { \"name\": \"Vocabulary\", \"current\": 65, \"target\": 85, \"color\": \"#6366f1\" }\n"
                            +
                            "  ],\n" +
                            "  \"weakPoints\": [\n" +
                            "    { \"title\": \"Topic\", \"score\": 55, \"advice\": \"Advice...\", \"color\": \"#ef4444\" }\n"
                            +
                            "  ],\n" +
                            "  \"recommendations\": [\n" +
                            "    { \"title\": \"发现薄弱点\", \"content\": \"词汇 · accomplish\", \"action\": \"专项强化\", \"path\": \"/vocabulary\" }\n"
                            +
                            "  ]\n" +
                            "}",
                    JSONUtil.toJsonStr(stats));

            String content = callLLM(systemPrompt, userPrompt);

            // Cleanup JSON
            if (content.contains("{") && content.contains("}")) {
                content = content.substring(content.indexOf("{"), content.lastIndexOf("}") + 1);
            }

            Map<String, Object> report = JSONUtil.parseObj(content);
            saveAnalysisReport(userId, report);
            return report;
        } catch (Exception e) {
            log.error("AI Analysis failed", e);
            return generateMockAnalysis();
        }
    }

    private void saveAnalysisReport(Long userId, Map<String, Object> report) {
        try {
            com.learnsphere.entity.UserAnalysis analysis = new com.learnsphere.entity.UserAnalysis();
            analysis.setUserId(userId);
            analysis.setReportJson(JSONUtil.toJsonStr(report));

            // 检查是否已有，有则更新，无则插入
            com.learnsphere.entity.UserAnalysis existing = userAnalysisMapper.selectOne(
                    new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.learnsphere.entity.UserAnalysis>()
                            .eq(com.learnsphere.entity.UserAnalysis::getUserId, userId)
                            .orderByDesc(com.learnsphere.entity.UserAnalysis::getId)
                            .last("LIMIT 1"));

            if (existing != null) {
                analysis.setId(existing.getId());
                userAnalysisMapper.updateById(analysis);
            } else {
                userAnalysisMapper.insert(analysis);
            }
        } catch (Exception e) {
            log.error("Failed to save analysis report", e);
        }
    }

    @Override
    public Map<String, Object> getLastAnalysis(Long userId) {
        com.learnsphere.entity.UserAnalysis analysis = userAnalysisMapper.selectOne(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<com.learnsphere.entity.UserAnalysis>()
                        .eq(com.learnsphere.entity.UserAnalysis::getUserId, userId)
                        .orderByDesc(com.learnsphere.entity.UserAnalysis::getId)
                        .last("LIMIT 1"));

        if (analysis != null) {
            return JSONUtil.parseObj(analysis.getReportJson());
        }
        return null;
    }

    private Map<String, Object> generateMockAnalysis() {
        Map<String, Object> result = new HashMap<>();
        result.put("overall", 65.0);
        result.put("growth", 1.5);
        result.put("gap", -15);
        result.put("predict", 480);

        List<Map<String, Object>> abilities = new ArrayList<>();
        abilities.add(createAbilityItem("词汇 (Vocab)", 60, 80, "#6366f1"));
        abilities.add(createAbilityItem("语法 (Grammar)", 55, 75, "#8b5cf6"));
        abilities.add(createAbilityItem("听力 (Listening)", 85, 90, "#10b981"));
        abilities.add(createAbilityItem("阅读 (Reading)", 75, 85, "#f59e0b"));
        abilities.add(createAbilityItem("写作 (Writing)", 50, 70, "#ef4444"));
        abilities.add(createAbilityItem("口语 (Speaking)", 45, 65, "#ec4899"));
        result.put("abilities", abilities);

        List<Map<String, Object>> weakPoints = new ArrayList<>();
        weakPoints.add(createWeakPointItem("写作逻辑", 50, "加强连接词的使用，多阅读高分范文。", "#ef4444"));
        weakPoints.add(createWeakPointItem("虚拟语气", 55, "专项练习 If 条件句和 Wish 从句。", "#8b5cf6"));
        result.put("weakPoints", weakPoints);

        List<Map<String, Object>> recommendations = new ArrayList<>();
        recommendations.add(createRecommendation("发现薄弱点", "词汇 · accomplish", "专项强化", "/vocabulary"));
        recommendations.add(createRecommendation("语法专项", "虚拟语气用法", "立即开始", "/grammar"));
        recommendations.add(createRecommendation("听力建议", "精听 TED 演讲", "去听听", "/listening"));
        result.put("recommendations", recommendations);

        return result;
    }

    private Map<String, Object> createRecommendation(String title, String content, String action, String path) {
        Map<String, Object> map = new HashMap<>();
        map.put("title", title);
        map.put("content", content);
        map.put("action", action);
        map.put("path", path);
        return map;
    }

    private Map<String, Object> createAbilityItem(String name, int current, int target, String color) {
        Map<String, Object> map = new HashMap<>();
        map.put("name", name);
        map.put("current", current);
        map.put("target", target);
        map.put("color", color);
        return map;
    }

    private Map<String, Object> createWeakPointItem(String title, int score, String advice, String color) {
        Map<String, Object> map = new HashMap<>();
        map.put("title", title);
        map.put("score", score);
        map.put("advice", advice);
        map.put("color", color);
        return map;
    }
}
