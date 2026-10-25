package com.learnsphere.service.impl;

import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.learnsphere.entity.LearningRecord;
import com.learnsphere.entity.User;
import com.learnsphere.entity.UserAnalysis;
import com.learnsphere.mapper.LearningRecordMapper;
import com.learnsphere.mapper.UserAnalysisMapper;
import com.learnsphere.service.ILearningRecordService;
import com.learnsphere.service.IUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

/**
 * 学习分析服务。
 *
 * <p>从 {@link AIGenerationServiceImpl}（原 3367 行）中抽出的第二大职责块：
 * 学习分析报告的生成、缓存判断、质量校验与兜底。
 *
 * <p>原本 {@code generateLearningAnalysis} 单个方法就有 857 行跨度，内含
 * 数据汇总、能力分布、薄弱点诊断、AI 点评生成、文本规范化、兜底拼接等
 * 十余个环节，全部耦合在一个类里难以单独维护和测试。
 *
 * <p>为保持行为完全不变，本类通过两个函数式接口复用原类的两处能力：
 * <ul>
 *   <li>{@link AbilityProvider} —— 能力分布与薄弱点计算（依赖原类中较深的
 *       工具方法链，暂不迁移）</li>
 *   <li>{@link LlmInvoker} —— 大模型调用（原类核心基础设施，被 20 处复用）</li>
 * </ul>
 *
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Slf4j
@Service
public class LearningAnalysisService {

    /** 学习分析报告版本，版本不一致时触发重新生成 */
    private static final int LEARNING_ANALYSIS_REPORT_VERSION = 2;

    /** 报告数据来源标记 */
    private static final String LEARNING_ANALYSIS_SOURCE = "real-learning-records";

    /** 环比统计窗口天数（近 7 天 vs 前 7 天） */
    private static final int LEARNING_ANALYSIS_COMPARISON_DAYS = 7;

    /**
     * 能力分布与薄弱点计算的能力提供者。
     *
     * <p>这两个计算依赖原类中的 getAbilityValue / calculateTypeAccuracy /
     * getScoreOrDefault 等方法链，这些方法同时被推荐模块复用，因此暂不迁移，
     * 通过本接口回调。
     */
    public interface AbilityProvider {
        List<Map<String, Object>> generateAbilities(Map<String, Object> statistics);

        List<Map<String, Object>> generateWeakPoints(Map<String, Object> statistics);
    }

    /**
     * 大模型调用入口。
     */
    @FunctionalInterface
    public interface LlmInvoker {
        String call(String systemPrompt, String userPrompt, String actionType);
    }

    @Autowired
    private UserAnalysisMapper userAnalysisMapper;

    @Autowired
    private LearningRecordMapper learningRecordMapper;

    @Autowired
    private ILearningRecordService learningRecordService;

    @Autowired
    private IUserService userService;

    @Autowired
    private com.learnsphere.service.AIProviderConfigService providerConfig;

    /**
     * 读取 {@code ANALYSIS_GEN_SYSTEM}。
     *
     * <p>这段系统提示词原本硬编码在 {@link #generateAIAnalysis} 里，
     * 数据库中的同名键因此长期是「写了但没人读」的孤立配置 ——
     * 运营在后台把它改掉，学生的点评风格不会有任何变化。
     * 改为读库后，文案调整无需重新发布。
     */
    @Autowired
    private com.learnsphere.service.ISystemPromptService systemPromptService;

    private AbilityProvider abilityProvider;

    private LlmInvoker llmInvoker;

    /**
     * 由 {@link AIGenerationServiceImpl} 在初始化时注入回调。
     */
    public void setCollaborators(AbilityProvider abilityProvider, LlmInvoker llmInvoker) {
        this.abilityProvider = abilityProvider;
        this.llmInvoker = llmInvoker;
    }

    /**
     * 获取用户最近一次学习分析报告。
     *
     * <p>若已有报告且未过期、且确为真实数据版本，直接返回缓存；
     * 否则重新统计并生成。解析失败时降级为重新生成，不向前端抛错。
     */
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
                Map<String, Object> report = JSONUtil.toBean(analysis.getReportJson(), Map.class);
                if (!shouldRefreshLearningAnalysis(userId, analysis, report)) {
                    return report;
                }
                log.info("检测到学习分析报告已过期或非真实数据版，自动重新生成: userId={}", userId);
            } catch (Exception e) {
                log.error("解析分析报告 JSON 失败", e);
            }
        }

        Map<String, Object> statistics = learningRecordService.getUserStatistics(userId);
        return generateLearningAnalysis(userId, statistics);
    }

    /**
     * 生成学习分析报告。
     */
    public Map<String, Object> generateLearningAnalysis(Long userId, Map<String, Object> statistics) {
        log.info("生成学习分析: userId={}", userId);

        // 用局部变量承接，避免给方法参数重新赋值（便于追踪入参原始值）
        Map<String, Object> stats = statistics == null ? new HashMap<>() : statistics;

        Map<String, Object> result = new HashMap<>();

        // 从嵌套的统计数据中提取信息
        @SuppressWarnings("unchecked")
        Map<String, Object> overall = (Map<String, Object>) stats.get("overall");

        Integer totalRecords = 0;
        Integer correctCount = 0;
        Double overallAccuracy = 0.0;

        if (overall != null) {
            Object totalObj = overall.get("totalCount");
            if (totalObj instanceof Number) {
                totalRecords = ((Number) totalObj).intValue();
            }
            Object correctObj = overall.get("correctCount");
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

        LocalDate today = LocalDate.now();
        LocalDateTime currentStart = today.minusDays(LEARNING_ANALYSIS_COMPARISON_DAYS - 1L).atStartOfDay();
        LocalDateTime previousStart = currentStart.minusDays(LEARNING_ANALYSIS_COMPARISON_DAYS);
        LocalDateTime currentEnd = today.plusDays(1L).atStartOfDay();

        Map<String, Object> recentPeriodStats = getPeriodLearningStats(userId, currentStart, currentEnd);
        Map<String, Object> previousPeriodStats = getPeriodLearningStats(userId, previousStart, currentStart);
        double overallAccuracyPercent = AnalysisMathUtils.roundToOneDecimal(overallAccuracy * 100);

        // 计算各项指标
        int overallScore = Math.max(0, Math.min(100, (int) Math.round(overallAccuracy * 100))); // 综合能力值 0-100
        int growth = AnalysisMathUtils.calculateGrowth(recentPeriodStats, previousPeriodStats); // 近 7 天对比前 7 天正确率变化
        int gap = Math.max(0, 100 - overallScore); // 距目标差距
        int predict = AnalysisMathUtils.calculatePredictScore(overallScore); // 预测分值

        result.put("overall", overallScore);
        result.put("growth", growth);
        result.put("gap", gap);
        result.put("predict", predict);

        // 生成能力分布
        List<Map<String, Object>> abilities = abilityProvider.generateAbilities(stats);
        result.put("abilities", abilities);

        // 生成薄弱点诊断
        List<Map<String, Object>> weakPoints = abilityProvider.generateWeakPoints(stats);
        result.put("weakPoints", weakPoints);

        Map<String, Object> dataSummary = buildLearningAnalysisDataSummary(
                totalRecords,
                correctCount,
                overallAccuracyPercent,
                stats,
                recentPeriodStats,
                previousPeriodStats);
        String dataStatus = resolveLearningAnalysisDataStatus(totalRecords);

        // 基于真实数据拼装诊断结论，不使用随机值或臆测内容
        String learnerName = resolveLearnerDisplayName(userId);
        String aiAnalysis = buildDataDrivenLearningAnalysis(learnerName, overallScore, growth, predict, abilities,
                weakPoints, dataSummary, dataStatus);
        result.put("aiAnalysis", aiAnalysis);

        result.put("reportVersion", LEARNING_ANALYSIS_REPORT_VERSION);
        result.put("dataGrounded", true);
        result.put("dataStatus", dataStatus);
        result.put("generatedFrom", LEARNING_ANALYSIS_SOURCE);
        result.put("dataSummary", dataSummary);
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

    public boolean shouldRefreshLearningAnalysis(Long userId, UserAnalysis analysis, Map<String, Object> report) {
        if (!isRealDataLearningAnalysis(report)) {
            return true;
        }
        if (analysis == null || analysis.getCreateTime() == null || userId == null) {
            return false;
        }
        try {
            LearningRecord latestRecord = learningRecordService.getOne(new LambdaQueryWrapper<LearningRecord>()
                    .eq(LearningRecord::getUserId, userId)
                    .eq(LearningRecord::getDeleted, 0)
                    .orderByDesc(LearningRecord::getCreateTime)
                    .last("LIMIT 1"));
            return latestRecord != null
                    && latestRecord.getCreateTime() != null
                    && latestRecord.getCreateTime().isAfter(analysis.getCreateTime());
        } catch (Exception e) {
            log.warn("检查学习分析是否需要刷新失败，沿用已有报告: userId={}", userId, e);
            return false;
        }
    }

    public boolean isRealDataLearningAnalysis(Map<String, Object> report) {
        if (report == null || report.isEmpty()) {
            return false;
        }
        if (!Boolean.TRUE.equals(report.get("dataGrounded"))) {
            return false;
        }
        if (AnalysisMathUtils.safeInt(report.get("reportVersion")) < LEARNING_ANALYSIS_REPORT_VERSION) {
            return false;
        }
        Object source = report.get("generatedFrom");
        return source != null && LEARNING_ANALYSIS_SOURCE.equals(String.valueOf(source));
    }

    public Map<String, Object> getPeriodLearningStats(Long userId, LocalDateTime startTime, LocalDateTime endTime) {
        if (userId == null || startTime == null || endTime == null) {
            return new HashMap<>();
        }
        Map<String, Object> periodStats = learningRecordMapper.getPeriodStatistics(userId, startTime, endTime);
        return periodStats == null ? new HashMap<>() : new HashMap<>(periodStats);
    }

    public Map<String, Object> buildLearningAnalysisDataSummary(int totalRecords, int correctCount,
            double overallAccuracyPercent,
            Map<String, Object> statistics,
            Map<String, Object> recentPeriodStats,
            Map<String, Object> previousPeriodStats) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalRecords", totalRecords);
        summary.put("correctCount", correctCount);
        summary.put("overallAccuracy", overallAccuracyPercent);
        summary.put("sampleAdequate", totalRecords >= 5);
        summary.put("consecutiveDays", AnalysisMathUtils.safeInt(statistics == null ? null : statistics.get("consecutiveDays")));
        summary.put("recent7DaysRecords", AnalysisMathUtils.safeInt(recentPeriodStats.get("totalCount")));
        summary.put("recent7DaysCorrectCount", AnalysisMathUtils.safeInt(recentPeriodStats.get("correctCount")));
        summary.put("recent7DaysAccuracy", AnalysisMathUtils.calculateAccuracyPercent(recentPeriodStats));
        summary.put("recent7DaysTimeSpent", AnalysisMathUtils.safeLong(recentPeriodStats.get("totalTimeSpent")));
        summary.put("recent7DaysActiveDays", AnalysisMathUtils.safeInt(recentPeriodStats.get("activeDays")));
        summary.put("previous7DaysRecords", AnalysisMathUtils.safeInt(previousPeriodStats.get("totalCount")));
        summary.put("previous7DaysCorrectCount", AnalysisMathUtils.safeInt(previousPeriodStats.get("correctCount")));
        summary.put("previous7DaysAccuracy", AnalysisMathUtils.calculateAccuracyPercent(previousPeriodStats));
        summary.put("previous7DaysTimeSpent", AnalysisMathUtils.safeLong(previousPeriodStats.get("totalTimeSpent")));
        summary.put("previous7DaysActiveDays", AnalysisMathUtils.safeInt(previousPeriodStats.get("activeDays")));
        summary.put("comparisonReady",
                AnalysisMathUtils.safeInt(recentPeriodStats.get("totalCount")) > 0 && AnalysisMathUtils.safeInt(previousPeriodStats.get("totalCount")) > 0);
        summary.put("comparisonWindowDays", LEARNING_ANALYSIS_COMPARISON_DAYS);
        summary.put("generatedFrom", LEARNING_ANALYSIS_SOURCE);
        return summary;
    }

    public String resolveLearningAnalysisDataStatus(int totalRecords) {
        if (totalRecords <= 0) {
            return "empty";
        }
        if (totalRecords < 5) {
            return "limited";
        }
        return "ready";
    }

    public String buildDataDrivenLearningAnalysis(String learnerName, int overallScore, int growth, int predict,
            List<Map<String, Object>> abilities,
            List<Map<String, Object>> weakPoints,
            Map<String, Object> dataSummary,
            String dataStatus) {
        String learnerAddress = toLearnerAddress(learnerName);
        int totalRecords = AnalysisMathUtils.safeInt(dataSummary.get("totalRecords"));
        int correctCount = AnalysisMathUtils.safeInt(dataSummary.get("correctCount"));
        double overallAccuracy = AnalysisMathUtils.safeDouble(dataSummary.get("overallAccuracy"));
        int consecutiveDays = AnalysisMathUtils.safeInt(dataSummary.get("consecutiveDays"));
        int recentRecords = AnalysisMathUtils.safeInt(dataSummary.get("recent7DaysRecords"));
        double recentAccuracy = AnalysisMathUtils.safeDouble(dataSummary.get("recent7DaysAccuracy"));
        int recentActiveDays = AnalysisMathUtils.safeInt(dataSummary.get("recent7DaysActiveDays"));
        int previousRecords = AnalysisMathUtils.safeInt(dataSummary.get("previous7DaysRecords"));
        double previousAccuracy = AnalysisMathUtils.safeDouble(dataSummary.get("previous7DaysAccuracy"));
        int previousActiveDays = AnalysisMathUtils.safeInt(dataSummary.get("previous7DaysActiveDays"));

        if ("empty".equals(dataStatus)) {
            return learnerAddress
                    + "，当前还没有可用于分析的真实学习记录，所以这里不会生成任何推测性结论。你先完成几次词汇、阅读、听力或写作练习，系统再根据真实答题结果计算综合能力、近 7 天走势和薄弱项。建议至少累计 5 条记录，并尽量覆盖 2 个以上模块，这样后续诊断会更稳定、更有参考价值。";
        }

        Map<String, Object> strongestAbility = getStrongestAbility(abilities);
        Map<String, Object> weakestAbility = getWeakestAbility(abilities);
        Map<String, Object> primaryWeakPoint = weakPoints == null || weakPoints.isEmpty() ? null : weakPoints.get(0);

        StringBuilder analysis = new StringBuilder(720);
        analysis.append(learnerAddress).append("，这份结果完全基于你已经产生的真实学习记录。");
        analysis.append(String.format(Locale.ROOT,
                "系统这次一共读取了 %d 条练习记录，其中答对 %d 条，整体正确率 %.1f%%，综合能力值折算为 %d 分。",
                totalRecords, correctCount, overallAccuracy, overallScore));

        if (consecutiveDays > 0) {
            analysis.append(String.format(Locale.ROOT, "你目前已经连续学习 %d 天，说明学习节奏是存在的。", consecutiveDays));
        }

        if (previousRecords > 0 && recentRecords > 0) {
            analysis.append(String.format(Locale.ROOT,
                    "近 %d 天完成了 %d 次训练，活跃了 %d 天，正确率 %.1f%%；再往前 %d 天是 %d 次训练、%d 个活跃日、正确率 %.1f%%。",
                    LEARNING_ANALYSIS_COMPARISON_DAYS, recentRecords, recentActiveDays, recentAccuracy,
                    LEARNING_ANALYSIS_COMPARISON_DAYS, previousRecords, previousActiveDays, previousAccuracy));
            if (growth > 0) {
                analysis.append(String.format(Locale.ROOT, "也就是说，你最近一周的正确率比前一周上升了 %d 个百分点，走势在变好。", growth));
            } else if (growth < 0) {
                analysis.append(String.format(Locale.ROOT, "也就是说，你最近一周的正确率比前一周回落了 %d 个百分点，节奏需要重新稳住。", Math.abs(growth)));
            } else {
                analysis.append("两周对比基本持平，当前更需要通过专项补强来拉开差距。");
            }
        } else if (recentRecords > 0) {
            analysis.append(String.format(Locale.ROOT,
                    "近 %d 天已经形成 %d 条新样本，活跃了 %d 天，当前正确率 %.1f%%，但更早一周的样本还不够，所以现在更适合把这组数据当作新的比较基线。",
                    LEARNING_ANALYSIS_COMPARISON_DAYS, recentRecords, recentActiveDays, recentAccuracy));
        } else {
            analysis.append(String.format(Locale.ROOT,
                    "最近 %d 天还没有新增练习记录，所以这份诊断主要反映你的累计历史表现，短期走势暂时不做判断。",
                    LEARNING_ANALYSIS_COMPARISON_DAYS));
        }

        if (strongestAbility != null) {
            analysis.append(String.format(Locale.ROOT, "从模块表现看，当前最稳的是%s，现阶段值 %d，说明这项能力已经具备一定稳定性。",
                    String.valueOf(strongestAbility.getOrDefault("name", "优势项")),
                    AnalysisMathUtils.safeInt(strongestAbility.get("current"))));
        }

        if (primaryWeakPoint != null) {
            analysis.append(String.format(Locale.ROOT,
                    "最需要优先补的是%s，目前相关正确率只有 %d%%，系统已经记录到 %d 次该类练习，所以这不是偶然波动，而是可以确认的补强点。",
                    String.valueOf(primaryWeakPoint.getOrDefault("title", "薄弱项")),
                    AnalysisMathUtils.safeInt(primaryWeakPoint.get("score")),
                    AnalysisMathUtils.safeInt(primaryWeakPoint.get("practiceCount"))));
            analysis.append(String.valueOf(primaryWeakPoint.getOrDefault("advice", "接下来建议集中做同题型专项训练，并把错因复盘写下来。")));
        } else if (weakestAbility != null) {
            analysis.append(String.format(Locale.ROOT,
                    "目前没有出现明显低于 60%% 的模块，但%s仍然是当前最低项，建议先把它补到阶段目标附近。",
                    String.valueOf(weakestAbility.getOrDefault("name", "最低项"))));
        } else {
            analysis.append("当前样本仍偏少，建议继续扩充练习范围，让系统尽快识别出真正的优势项和短板。");
        }

        if ("limited".equals(dataStatus)) {
            analysis.append("不过要提醒你，现阶段样本量还偏少，页面给出的结论更适合作为早期观察，不建议据此做过度推断。");
        }

        if (predict > 0) {
            analysis.append(String.format(Locale.ROOT,
                    "按照当前训练表现换算，预测分值大约在 %d 分附近。这个值不是承诺分数，而是你最近真实练习质量的一个映射。", predict));
        }

        analysis.append("接下来最有效的动作不是一味加量，而是围绕当前短板做连续几天的定向训练，再看下一次真实数据有没有回升。");
        return analysis.toString();
    }

    public Map<String, Object> getStrongestAbility(List<Map<String, Object>> abilities) {
        if (abilities == null || abilities.isEmpty()) {
            return null;
        }
        return abilities.stream()
                .filter(Objects::nonNull)
                .max(Comparator.comparingInt(item -> AnalysisMathUtils.safeInt(item.get("current"))))
                .orElse(null);
    }

    public Map<String, Object> getWeakestAbility(List<Map<String, Object>> abilities) {
        if (abilities == null || abilities.isEmpty()) {
            return null;
        }
        return abilities.stream()
                .filter(Objects::nonNull)
                .min(Comparator.comparingInt(item -> AnalysisMathUtils.safeInt(item.get("current"))))
                .orElse(null);
    }


    /**
     * 调用大模型生成个性化学习分析点评
     */
    public String generateAIAnalysis(String learnerName, int overallScore, int growth, int predict,
            List<Map<String, Object>> abilities,
            List<Map<String, Object>> weakPoints,
            Map<String, Object> statistics) {
        final int minChars = 850;
        final int maxChars = 1000;
        if (!providerConfig.hasApiKey()) {
            return buildLearningAnalysisFallback(learnerName, overallScore, growth, predict, weakPoints, maxChars);
        }
        try {
            String systemPrompt = systemPromptService.getPromptTemplate(
                    "ANALYSIS_GEN_SYSTEM",
                    "你是一位专业、温暖、有人情味的英语学习导师，请基于用户学习数据生成“AI 导师专属点评”。\n" +
                            "输出要求：\n" +
                            "1. 使用简体中文纯文本，不要 Markdown，不要标题编号，不要代码块。\n" +
                            "2. 总字数控制在 850-1000 字之间，目标约 900-980 字。\n" +
                            "3. 语气像真人老师一对一沟通，允许自然口语表达，避免“系统公告式”模板文风。\n" +
                            "4. 先肯定进步与亮点，强化成就感；再给出 2-3 个关键改进建议（要具体、可执行、可量化）。\n" +
                            "5. 提供未来 7 天可落地计划，让用户今天就能开始执行。\n" +
                            "6. 结尾做高情绪价值收束：让用户感到被理解、被认可、被鼓励。\n" +
                            "7. 禁止打击式表达、否定人格、制造焦虑；避免机械连接词堆砌（如首先/其次/最后反复出现）。",
                    "学习分析生成-系统提示词");
            StringBuilder prompt = new StringBuilder(640);
            prompt.append("请根据以下学习数据生成点评：\n\n");
            prompt.append(String.format(Locale.ROOT, "称呼：%s\n", toLearnerAddress(learnerName)));
            prompt.append("核心指标：\n");
            prompt.append(String.format(Locale.ROOT, "- 综合能力：%d/100\n", overallScore));
            prompt.append(String.format(Locale.ROOT, "- 较上周提升：+%d%%\n", growth));
            prompt.append(String.format(Locale.ROOT, "- 预测 CET 分数：%d/710\n", predict));

            prompt.append("\n能力分布：\n");
            if (abilities == null || abilities.isEmpty()) {
                prompt.append("- 暂无能力分布数据\n");
            } else {
                for (Map<String, Object> ability : abilities) {
                    String name = String.valueOf(ability.getOrDefault("name", "能力项"));
                    int current = AnalysisMathUtils.safeInt(ability.get("current"));
                    int target = AnalysisMathUtils.safeInt(ability.get("target"));
                    prompt.append(String.format(Locale.ROOT, "- %s：当前 %d%%，目标 %d%%\n", name, current, target));
                }
            }

            prompt.append("\n薄弱点：\n");
            if (weakPoints == null || weakPoints.isEmpty()) {
                prompt.append("- 暂未识别明显薄弱点，请继续保持稳定训练\n");
            } else {
                for (Map<String, Object> wp : weakPoints) {
                    String title = String.valueOf(wp.getOrDefault("title", "薄弱项"));
                    int score = AnalysisMathUtils.safeInt(wp.get("score"));
                    prompt.append(String.format(Locale.ROOT, "- %s：%d 分\n", title, score));
                }
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> overallStats = statistics == null ? null
                    : (Map<String, Object>) statistics.get("overall");
            if (overallStats != null) {
                int totalCount = AnalysisMathUtils.safeInt(overallStats.get("totalCount"));
                if (totalCount > 0) {
                    prompt.append(String.format(Locale.ROOT, "\n训练规模：\n- 累计练习：%d 次\n", totalCount));
                }
            }

            prompt.append("""
                    \n写作要求：
                    - 全文分 4-5 段，不要用标题，每段 2-4 句。
                    - 第一段写“成绩与亮点”，必须具体到数据，且不少于 180 字，让人感到真诚。
                    - 中间段落写“问题诊断 + 可执行建议”，至少给出 3 个动作。
                    - 倒数第二段写 7 天落地计划，包含每日重点任务。
                    - 最后一段高情绪价值收尾，让用户感到被认可、被鼓励、且方向清晰。
                    - 总字数严格控制在 850-1000 字。
                    """);
            String analysis = llmInvoker.call(systemPrompt, prompt.toString(), "GENERATE_ANALYSIS");
            String polished = ensureLearningAnalysisQuality(analysis, learnerName, minChars, maxChars, overallScore,
                    growth, predict,
                    abilities, weakPoints);
            if (polished.isBlank()) {
                return buildLearningAnalysisFallback(learnerName, overallScore, growth, predict, weakPoints, maxChars);
            }
            return polished;
        } catch (Exception e) {
            log.error("AI 学习分析生成失败", e);
            return buildLearningAnalysisFallback(learnerName, overallScore, growth, predict, weakPoints, maxChars);
        }
    }

    public String normalizeLearningAnalysis(String text, int maxChars) {
        if (text == null) {
            return "";
        }
        String normalized = text
                .replace("```", "")
                .replace("\r\n", "\n")
                .replace("\r", "\n")
                .replaceAll("(?m)^\\s*[-*#]+\\s*", "")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();
        if (normalized.length() <= maxChars) {
            return normalized;
        }

        int cutIndex = maxChars;
        int nearestPeriod = normalized.lastIndexOf('。', maxChars);
        int nearestExclamation = normalized.lastIndexOf('！', maxChars);
        int nearestQuestion = normalized.lastIndexOf('？', maxChars);
        int sentenceEnd = Math.max(Math.max(nearestPeriod, nearestExclamation), nearestQuestion);
        if (sentenceEnd >= maxChars - 120) {
            cutIndex = sentenceEnd + 1;
        }

        String trimmed = normalized.substring(0, cutIndex).trim();
        if (!trimmed.endsWith("。") && !trimmed.endsWith("！") && !trimmed.endsWith("？")) {
            trimmed += "。";
        }
        return trimmed;
    }

    public String ensureLearningAnalysisQuality(String text, String learnerName, int minChars, int maxChars,
            int overallScore, int growth, int predict,
            List<Map<String, Object>> abilities,
            List<Map<String, Object>> weakPoints) {
        String normalized = normalizeLearningAnalysis(humanizeLearningAnalysisTone(text, learnerName), maxChars);
        if (normalized.isBlank()) {
            return "";
        }
        if (normalized.length() >= minChars) {
            return normalized;
        }
        String supplement = buildLearningAnalysisSupplement(learnerName, overallScore, growth, predict, abilities,
                weakPoints);
        String enriched = normalizeLearningAnalysis(
                humanizeLearningAnalysisTone(normalized + "\n\n" + supplement, learnerName), maxChars);
        if (!enriched.isBlank()) {
            return enriched;
        }
        return normalized;
    }

    public String buildLearningAnalysisSupplement(String learnerName, int overallScore, int growth, int predict,
            List<Map<String, Object>> abilities,
            List<Map<String, Object>> weakPoints) {
        String learnerAddress = toLearnerAddress(learnerName);
        String topAbilityName = "关键能力";
        int topAbilityScore = 0;
        if (abilities != null) {
            for (Map<String, Object> ability : abilities) {
                if (ability == null) {
                    continue;
                }
                int current = AnalysisMathUtils.safeInt(ability.get("current"));
                if (current > topAbilityScore) {
                    topAbilityScore = current;
                    topAbilityName = String.valueOf(ability.getOrDefault("name", "关键能力"));
                }
            }
        }

        String weakTitle = null;
        if (weakPoints != null && !weakPoints.isEmpty()) {
            weakTitle = String.valueOf(weakPoints.get(0).getOrDefault("title", "薄弱项"));
        }

        StringBuilder supplement = new StringBuilder(720);
        supplement.append(learnerAddress).append("，从你的数据表现来看，你已经不是“零散学习”，而是在形成稳定的学习系统。");
        supplement.append(String.format(Locale.ROOT,
                "综合能力 %d 分、周环比 +%d%%、预测分数 %d 分，这三组数字放在一起，说明你的进步并非偶然，而是来自持续行动与正确方法的叠加。",
                overallScore, growth, predict));
        if (topAbilityScore > 0) {
            supplement.append(String.format(Locale.ROOT,
                    "尤其是 %s 达到 %d%%，这代表你已经建立了可复用的优势能力，这一点非常难得。", topAbilityName, topAbilityScore));
        }

        if (weakTitle != null && !weakTitle.isBlank()) {
            supplement.append(String.format(Locale.ROOT,
                    "下一阶段建议你把「%s」当作主要突破口，把“能做对”升级为“稳定做对”。", weakTitle));
        } else {
            supplement.append("下一阶段建议你把“稳定输出”作为核心目标，把当前优势转化为长期战斗力。");
        }

        supplement.append("你可以采用“三段式闭环”：先用 10 分钟做知识回顾，再用 20-25 分钟做高质量训练，最后用 15 分钟做复盘。");
        supplement.append("复盘时重点写清楚“为什么错、如何改、下次怎么防错”，只要坚持这个动作，你的成长速度会明显提高。");
        supplement.append("未来 7 天建议这样执行：第 1-2 天先把高频错点集中梳理；第 3-4 天做定时训练提升稳定性；第 5-6 天做模拟场景训练；第 7 天做整周复盘并更新下周计划。");
        supplement.append("每一天不需要追求完美，但必须完成核心动作，因为真正拉开差距的，是连续执行而不是偶尔爆发。");
        supplement.append("最后请记住，你现在已经站在正确的轨道上：你有数据支撑的进步、有可执行的方法、有正在增强的自我驱动力。");
        supplement.append("继续按照这个节奏前进，你会越来越清晰地看到自己的实力被兑现，成绩提升只是时间问题。");
        return supplement.toString();
    }

    public String buildLearningAnalysisFallback(String learnerName, int overallScore, int growth, int predict,
            List<Map<String, Object>> weakPoints,
            int maxChars) {
        String learnerAddress = toLearnerAddress(learnerName);
        final int minChars = 850;
        StringBuilder fallback = new StringBuilder(1400);
        fallback.append(learnerAddress).append("，先给你一个明确结论：你正在进步，而且是有质量的进步。");
        fallback.append(String.format(Locale.ROOT,
                "当前综合能力达到 %d 分，较上周提升 +%d%%，预测成绩约 %d 分。", overallScore, growth, predict));
        fallback.append("这些数字意味着你不是靠运气前进，而是在用稳定行动换取真实成长。");

        if (overallScore >= 80) {
            fallback.append("你已经进入高竞争力区间，方法和执行力都很在线，距离更高目标并不遥远。");
        } else if (overallScore >= 60) {
            fallback.append("你正处于稳定爬坡期，这个阶段最可贵的是持续投入，而你已经做到了最关键的一步。");
        } else {
            fallback.append("基础正在被一点点夯实，现在的每一次练习都在为后续跃升打底，这种积累非常有价值。");
        }

        if (weakPoints != null && !weakPoints.isEmpty()) {
            Map<String, Object> first = weakPoints.get(0);
            String title = String.valueOf(first.getOrDefault("title", "薄弱项"));
            fallback.append(String.format(Locale.ROOT, "接下来建议你优先突破「%s」。", title));
            fallback.append("每天安排 35-45 分钟专项训练：先用 10 分钟做知识回顾，再用 20 分钟完成针对性练习，最后 10-15 分钟复盘错因。");
            fallback.append("复盘时只回答三个问题：我错在什么、正确路径是什么、下次如何避免。");
        } else {
            fallback.append("建议继续保持均衡训练节奏，重点做“做题-复盘-再练”闭环，把优势能力稳定固化。");
        }

        fallback.append("未来 7 天可以这样安排：第 1 天梳理错题模式，第 2 天专项补强薄弱点，第 3 天做限时训练提速，第 4 天做高质量精练提升准确率，");
        fallback.append("第 5 天进行一次模拟测验检验稳定性，第 6 天针对失分点做二次强化，第 7 天做整周复盘并制定下周目标。");
        fallback.append("你不需要一天变得很厉害，但你需要每天都比昨天更清楚、更稳定一点点。");
        fallback.append("请相信，真正值得骄傲的不是某次超常发挥，而是你已经建立了“能长期坚持、能持续优化”的学习能力。");
        fallback.append("你已经拥有了继续提升的全部关键条件：愿意投入、能够复盘、敢于调整。");
        fallback.append("只要把这份节奏守住，你会在接下来的几周里看到更明显的成绩兑现。");
        fallback.append("这不是安慰，而是基于你当前数据给出的判断。继续向前，你会越来越强。");

        String[] extraEmotionBlocks = new String[] {
                "再补充一句很重要的话：你现在的努力并没有被浪费，它们正在沉淀成反应速度、理解深度和表达稳定性，这些能力一旦成型，会在考试和实际应用里反复给你加分。",
                "当你偶尔状态不佳时，不要否定自己。真正成熟的学习者并不是从不波动，而是波动后依然能回到计划。你已经在做这件事了，这就是你未来可持续进步的底层优势。",
                "你完全可以对自己更有信心一点：你不是从零开始的人，你是已经在正确路上的人。接下来你要做的不是怀疑自己，而是持续执行、耐心累积，然后让结果替你发声。"
        };
        int idx = 0;
        while (fallback.length() < minChars && idx < extraEmotionBlocks.length) {
            fallback.append(extraEmotionBlocks[idx++]);
        }

        return normalizeLearningAnalysis(fallback.toString(), maxChars);
    }

    public String humanizeLearningAnalysisTone(String text, String learnerName) {
        if (text == null) {
            return "";
        }
        String learnerAddress = toLearnerAddress(learnerName);
        String content = text.trim();
        if (!content.startsWith(learnerAddress) && !content.startsWith("你")) {
            content = learnerAddress + "，" + content;
        }
        return content
                .replace("首先，", "先说最关键的一点，")
                .replace("其次，", "再看一个非常重要的点，")
                .replace("最后，", "最后我想和你强调，");
    }

    public String resolveLearnerDisplayName(Long userId) {
        if (userId == null) {
            return "";
        }
        try {
            User user = userService.getById(userId);
            if (user == null) {
                return "";
            }
            String nickname = user.getNickname();
            if (nickname != null && !nickname.isBlank()) {
                return nickname.trim();
            }
            String username = user.getUsername();
            return username == null ? "" : username.trim();
        } catch (Exception e) {
            log.warn("解析学习者昵称失败: userId={}", userId, e);
            return "";
        }
    }

    public String toLearnerAddress(String learnerName) {
        if (learnerName == null || learnerName.isBlank()) {
            return "你";
        }
        String name = learnerName.trim();
        if (name.length() > 12) {
            name = name.substring(0, 12);
        }
        if (name.endsWith("同学") || name.endsWith("同學")) {
            return name;
        }
        return name + "同学";
    }

}
