package com.learnsphere.service.impl;

import com.learnsphere.util.ExamTypeSupport;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AI 调用失败时的本地降级数据生成器。
 *
 * <p>从 {@link AIGenerationServiceImpl}（原 3367 行）中抽出的第四块职责。
 * 这些方法在模型不可用、额度耗尽或返回内容无法解析时提供可用的兜底数据，
 * 保证前端页面不因 AI 故障而空白。
 *
 * <p>全部为纯数据构造，不依赖数据库、Redis 或任何外部服务，因此可以
 * 独立测试。抽取后原类的职责进一步收敛为「提示词组装 + 结果解析」。
 *
 * <p>注意：这些数据是<b>占位性质</b>的示例内容，不是真实 AI 生成结果。
 * 调用方在拿到降级数据时通常会同时标记 {@code mock=true} 或记录告警，
 * 以便区分真实产出与兜底产出。
 *
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Slf4j
@Service
public class AiFallbackContentGenerator {
    // ==================== Mock 数据生成方法 ====================

    public Map<String, Object> generateMockReading(String difficulty) {
        Map<String, Object> result = new HashMap<>();
        result.put("title", "Sample Reading: The Benefits of Learning");
        result.put("passage", "Learning is a lifelong process that enriches our minds and opens new opportunities...");
        result.put("questions", List.of(
                Map.of("text", "What is the main idea?", "options", List.of("A", "B", "C", "D"), "correct", 0,
                        "explanation", "主旨在第一句")));
        return result;
    }

    public Map<String, Object> generateMockWriting(String examType, String difficulty) {
        Map<String, Object> result = new HashMap<>();
        String normalizedExamType = ExamTypeSupport.normalizeOrDefault(examType, "cet4");
        String examLabel = ExamTypeSupport.getDisplayLabel(normalizedExamType);
        String effectiveDifficulty = (difficulty == null || difficulty.isBlank()) ? "medium" : difficulty;
        if ("primary".equals(normalizedExamType)) {
            result.put("title", "My School Day");
            result.put("prompt",
                    "Write a short composition about your school day. You can talk about your classes, your friends, and one activity you like best.");
            result.put("tips", List.of("Use simple present tense", "Mention at least 2 school activities", "Add one feeling sentence"));
            result.put("minWords", "hard".equalsIgnoreCase(effectiveDifficulty) ? 100 : 60);
        } else if ("middle".equals(normalizedExamType)) {
            result.put("title", "A Helpful School Activity");
            result.put("prompt",
                    "Write about a school activity that helped you grow. Describe what happened, what you learned, and why it was meaningful.");
            result.put("tips", List.of("Explain the activity clearly", "Describe one lesson you learned", "Use a clear beginning, middle, and ending"));
            result.put("minWords", "hard".equalsIgnoreCase(effectiveDifficulty) ? 140 : 100);
        } else if ("high".equals(normalizedExamType)) {
            result.put("title", "Balancing Study and Health");
            result.put("prompt",
                    "Write an English composition on how high school students can balance study pressure and physical or mental health. Give practical suggestions and your own view.");
            result.put("tips", List.of("State the problem first", "Give 2-3 practical suggestions", "Use linking words to organize ideas", "Finish with a clear conclusion"));
            result.put("minWords", "hard".equalsIgnoreCase(effectiveDifficulty) ? 180 : 130);
        } else if ("easy".equalsIgnoreCase(effectiveDifficulty)) {
            result.put("title", examLabel + " Writing Practice");
            result.put("prompt",
                    "Write a short essay about why reading is important for students. Use simple examples from school or daily life.");
            result.put("tips",
                    List.of("State your opinion clearly", "Give 2 simple reasons", "Use one personal example"));
            result.put("minWords", 120);
        } else if ("hard".equalsIgnoreCase(effectiveDifficulty)) {
            result.put("title", examLabel + " Advanced Writing Practice");
            result.put("prompt",
                    "Write an essay discussing why deep reading still matters in the digital age. Compare deep reading with fragmented online reading and give your own view.");
            result.put("tips", List.of("Define deep reading first", "Use comparison structure", "Include one counterargument",
                    "End with a clear conclusion"));
            result.put("minWords", 180);
        } else {
            result.put("title", examLabel + " Writing Practice");
            result.put("prompt",
                    "Write an essay about why reading is important in the digital age. You should discuss the benefits of deep reading vs. surface reading.");
            result.put("tips", List.of("Start with a hook", "Use transition words", "Provide personal examples"));
            result.put("minWords", 150);
        }
        result.put("timeLimit", 30);
        result.put("difficulty", effectiveDifficulty);
        return result;
    }

    public Map<String, Object> generateMockListening(String difficulty, Integer count) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> passages = new ArrayList<>();
        int actualCount = count != null ? count : 1;

        // 真实模拟库
        String[][] scripts = {
                { "Daily Routine",
                        "I usually wake up at 7 AM. First, I drink a glass of water, then I go for a quick jog in the park. By 8:30, I'm ready to start my work at the office." },
                { "Healthy Eating",
                        "Eating a balanced diet is crucial for maintaining good health. You should include plenty of vegetables, fruits, and lean proteins in your meals while avoiding excessive sugar." },
                { "Traveling to London",
                        "London is a city full of history and culture. When you visit, don't miss the British Museum and the Tower Bridge. The public transport system, known as the Tube, is very efficient." },
                { "Job Interview",
                        "During a job interview, it's important to demonstrate your problem-solving skills and your ability to work in a team. Always research the company beforehand." },
                { "Environmental Protection",
                        "Climate change is a global challenge. We can help by reducing our plastic use, recycling more, and choosing sustainable transportation options." }
        };

        for (int i = 0; i < actualCount; i++) {
            int templateIdx = i % scripts.length;
            String title = scripts[templateIdx][0];
            String script = scripts[templateIdx][1];

            passages.add(Map.of(
                    "audioScript", script,
                    "questions", List.of(
                            Map.of(
                                    "text", "What is the main topic of this passage?",
                                    "options", List.of(title, "Random Objects", "Space Exploration", "Cooking Recipe"),
                                    "correct", 0,
                                    "explanation", "The passage clearly discusses " + title.toLowerCase() + "."),
                            Map.of(
                                    "text", "Which of the following is mentioned in the text?",
                                    "options",
                                    List.of("A specific detail from the text", "A completely unrelated thing",
                                            "A fictional character", "A math problem"),
                                    "correct", 0,
                                    "explanation", "This detail was mentioned in the audio script.")),
                    "title", title));
        }

        result.put("passages", passages);
        return result;
    }

    public Map<String, Object> generateMockGrammar(String topic, String difficulty) {
        Map<String, Object> result = new HashMap<>();
        result.put("topic", topic);
        result.put("questions", List.of(
                Map.of("text", "Choose the correct tense: I ___ to school yesterday.",
                        "options", List.of("go", "went", "goes", "going"),
                        "correct", 1,
                        "explanation", "过去时态用 went")));
        return result;
    }

    public Map<String, Object> generateMockSpeaking(String type) {
        List<Map<String, Object>> topics = List.of(
                Map.of("topic", "An eco-friendly habit you started", "description",
                        "Describe a habit you have adopted to help protect the environment. You should say: what it is, when you started it, why you think it's important, and how it has changed your daily life.",
                        "keywords", List.of("environment", "sustainability", "habit"), "hints",
                        List.of("Use transition words", "Describe personal feelings", "Explain long-term benefits"),
                        "timeLimit", 120),
                Map.of("topic", "A tradition in your family", "description",
                        "Describe a tradition that your family follows. You should say: what the tradition is, how often you do it, why it is special to you, and how it brings your family together.",
                        "keywords", List.of("family", "heritage", "custom"), "hints",
                        List.of("Use past and present tenses", "Share a specific memory", "Discuss its importance"),
                        "timeLimit", 120),
                Map.of("topic", "An interesting neighbor or colleague", "description",
                        "Describe a person you know at work or in your neighborhood who is interesting. You should say: who they are, how you met them, what makes them unique, and why you enjoy interacting with them.",
                        "keywords", List.of("personality", "story", "connection"), "hints",
                        List.of("Describe their appearance and behavior", "Use descriptive adjectives",
                                "Relate an anecdote"),
                        "timeLimit", 120),
                Map.of("topic", "A time you tried a new food", "description",
                        "Describe a time you tried a food for the first time. You should say: what it was, where you had it, whether you liked it, and why you decided to try it.",
                        "keywords", List.of("cuisine", "experience", "flavor"), "hints",
                        List.of("Use sensory words (smell, taste, texture)", "Describe the atmosphere",
                                "Compare it to other foods"),
                        "timeLimit", 120),
                Map.of("topic", "A piece of local news that interested you", "description",
                        "Talk about a piece of news from your city or town that you found interesting. You should say: what the news was, how you heard about it, why you found it interesting, and how it affected local people.",
                        "keywords", List.of("news", "community", "impact"), "hints",
                        List.of("Explain the background", "Discuss different opinions", "State your own view"),
                        "timeLimit", 120),
                Map.of("topic", "A goal you achieved recently", "description",
                        "Describe a goal you set for yourself and recently accomplished. You should say: what the goal was, how long it took, what challenges you faced, and how you felt when you achieved it.",
                        "keywords", List.of("achievement", "perseverance", "milestone"), "hints",
                        List.of("Detail the steps taken", "Express emotions clearly", "Reflect on lessons learned"),
                        "timeLimit", 120),
                Map.of("topic", "A historical building in your town", "description",
                        "Describe a building in your town that has historical significance. You should say: where it is, what it looks like, its historical background, and why it is important to the community.",
                        "keywords", List.of("architecture", "history", "landmark"), "hints",
                        List.of("Use descriptive language for the structure", "Relate historical facts",
                                "Explain its symbolic value"),
                        "timeLimit", 120),
                Map.of("topic", "A person who is good at their job", "description",
                        "Describe someone you know who is very professional and skilled in their work. You should say: who they are, what their job is, why you think they are good at it, and what you can learn from them.",
                        "keywords", List.of("talent", "career", "inspiration"), "hints",
                        List.of("List specific skills", "Give examples of their work", "Show admiration"),
                        "timeLimit", 120));
        return new HashMap<>(topics.get(new java.util.Random().nextInt(topics.size())));
    }

    public Map<String, Object> generateMockEvaluation() {
        Map<String, Object> result = new HashMap<>();
        result.put("score", 75);
        result.put("feedback", List.of(
                Map.of("type", "general", "text", "Overall good work. Keep practicing!"),
                Map.of("type", "grammar", "text", "Some minor grammar errors detected."),
                Map.of("type", "vocab", "text", "Good range of vocabulary used.")));
        result.put("suggestions", List.of("Practice more complex sentences", "Use more varied transitions"));
        return result;
    }

    public Map<String, Object> generateMockSpeakingEvaluation() {
        Map<String, Object> result = new HashMap<>();
        result.put("score", 78);
        result.put("pronunciation", 76);
        result.put("fluency", 79);
        result.put("grammar", 77);
        result.put("vocabulary", 80);
        result.put("relevance", 78);
        result.put("feedback", "你的回答基本围绕题目展开，表达意图清晰，整体完成度不错。接下来可以进一步补充细节，并减少停顿，让回答更自然、更贴题。");
        result.put("suggestions", List.of(
                "开头先直接回应题目核心要求，再补充具体例子。",
                "使用 because, for example, in addition 等连接表达增强连贯性。",
                "复述答案时重点检查时态和常见搭配，提升语法与词汇准确度。"));
        return result;
    }

}
