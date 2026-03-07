package com.learnsphere.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.AdminOperation;
import com.learnsphere.entity.LearningRecord;
import com.learnsphere.entity.User;
import com.learnsphere.entity.VipOrder;
import com.learnsphere.mapper.VipOrderMapper;
import com.learnsphere.service.IAIGenerationService;
import com.learnsphere.service.IGrammarExerciseService;
import com.learnsphere.service.ILearningRecordService;
import com.learnsphere.service.IListeningMaterialService;
import com.learnsphere.service.IReadingArticleService;
import com.learnsphere.service.ISpeakingTopicService;
import com.learnsphere.service.IUserService;
import com.learnsphere.service.IVocabularyService;
import com.learnsphere.service.IWritingTopicService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 管理后台看板控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final IUserService userService;
    private final IVocabularyService vocabularyService;
    private final ILearningRecordService learningRecordService;
    private final IListeningMaterialService listeningMaterialService;
    private final IReadingArticleService readingArticleService;
    private final IWritingTopicService writingTopicService;
    private final IGrammarExerciseService grammarExerciseService;
    private final ISpeakingTopicService speakingTopicService;
    private final IAIGenerationService aiGenerationService;
    private final VipOrderMapper vipOrderMapper;

    /**
     * 获取系统统计数据
     */
    @GetMapping("/stats")
    public Result<?> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalUsers = userService.count();
        stats.put("totalUsers", totalUsers);

        QueryWrapper<User> todayQuery = new QueryWrapper<>();
        todayQuery.ge("create_time", LocalDateTime.now().minusHours(24));
        long todayNewUsers = userService.count(todayQuery);
        stats.put("todayNewUsers", todayNewUsers);

        return Result.success(stats);
    }

    /**
     * 获取财务统计
     */
    @GetMapping("/finance/stats")
    public Result<?> getFinanceStats() {
        Map<String, Object> stats = new HashMap<>();

        String[] keys = { "", "monthly", "quarterly", "yearly" };
        double totalRevenue = 0.0;

        for (int level = 1; level <= 3; level++) {
            QueryWrapper<VipOrder> query = new QueryWrapper<>();
            query.eq("vip_level", level).eq("status", "PAID");
            query.select("SUM(amount) as totalAmount");

            List<Map<String, Object>> resultList = vipOrderMapper.selectMaps(query);
            double amount = 0.0;

            if (resultList != null && !resultList.isEmpty()) {
                Map<String, Object> res = resultList.get(0);
                if (res != null) {
                    Object amtObj = res.get("totalAmount");
                    if (amtObj != null) {
                        amount = Double.parseDouble(amtObj.toString());
                    }
                }
            }

            stats.put(keys[level], amount);
            totalRevenue += amount;
        }

        stats.put("totalRevenue", totalRevenue);
        return Result.success(stats);
    }

    /**
     * 获取用户留存数据
     */
    @GetMapping("/retention")
    public Result<?> getRetentionData() {
        List<Map<String, Object>> retention = new ArrayList<>();
        String[] labels = { "1天", "3天", "7天", "14天", "30天" };
        int[] days = { 1, 3, 7, 14, 30 };

        try {
            for (int i = 0; i < days.length; i++) {
                double rate = calculateRetentionRate(days[i]);

                Map<String, Object> item = new HashMap<>();
                item.put("day", labels[i]);
                item.put("rate", rate);
                retention.add(item);
            }
        } catch (Exception e) {
            log.error("计算用户留存率失败", e);
            for (int i = 0; i < labels.length; i++) {
                Map<String, Object> item = new HashMap<>();
                item.put("day", labels[i]);
                item.put("rate", 0.0);
                retention.add(item);
            }
        }

        return Result.success(retention);
    }

    /**
     * 计算特定天数的用户留存率
     */
    private double calculateRetentionRate(int days) {
        LocalDateTime targetDate = LocalDateTime.now().minusDays(days);
        LocalDateTime oneDayBefore = targetDate.minusDays(1);

        QueryWrapper<User> registeredQuery = new QueryWrapper<>();
        registeredQuery.ge("create_time", oneDayBefore).lt("create_time", targetDate);
        long registeredCount = userService.count(registeredQuery);
        if (registeredCount == 0) {
            return 0.0;
        }

        QueryWrapper<User> retainedQuery = new QueryWrapper<>();
        retainedQuery.ge("create_time", oneDayBefore)
                .lt("create_time", targetDate)
                .apply("last_login_time > create_time");
        long retainedCount = userService.count(retainedQuery);

        double rate = (double) retainedCount / registeredCount * 100.0;
        return Math.round(rate * 100.0) / 100.0;
    }

    /**
     * 执行 AI 内容审核
     */
    @PostMapping("/audit")
    @AdminOperation(module = "内容审核", action = "AI内容审核")
    public Result<?> auditContent(@RequestBody Map<String, Object> params) {
        String type = (String) params.get("type");
        Long id = Long.valueOf(params.get("id").toString());
        return Result.success(aiGenerationService.auditContent(type, id));
    }

    /**
     * 获取口语高分排行
     */
    @GetMapping("/speaking-leaderboard")
    public Result<?> getSpeakingLeaderboard() {
        QueryWrapper<LearningRecord> query = new QueryWrapper<>();
        query.eq("content_type", "speaking")
                .orderByDesc("score")
                .last("LIMIT 10");

        List<LearningRecord> records = learningRecordService.list(query);
        List<Map<String, Object>> leaderboard = new ArrayList<>();
        if (records.isEmpty()) {
            return Result.success(leaderboard);
        }

        Set<Long> userIds = records.stream().map(LearningRecord::getUserId).collect(Collectors.toSet());
        Map<Long, User> userMap = new HashMap<>();
        if (!userIds.isEmpty()) {
            List<User> users = userService.listByIds(userIds);
            userMap = users.stream().collect(Collectors.toMap(User::getId, u -> u));
        }

        for (LearningRecord record : records) {
            User user = userMap.get(record.getUserId());
            Map<String, Object> entry = new HashMap<>();
            entry.put("username", user != null ? user.getUsername() : "Unknown");
            entry.put("avatar", user != null ? user.getAvatar() : "");
            entry.put("score", record.getScore());
            entry.put("time", record.getCreateTime());
            leaderboard.add(entry);
        }

        return Result.success(leaderboard);
    }

    /**
     * 获取内容分布统计
     */
    @GetMapping("/content-stats")
    public Result<?> getContentStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("vocabulary", vocabularyService.count());
        stats.put("reading", readingArticleService.count());
        stats.put("listening", listeningMaterialService.count());
        stats.put("grammar", grammarExerciseService.count());
        stats.put("writing", writingTopicService.count());
        stats.put("speaking", speakingTopicService.count());
        return Result.success(stats);
    }

    /**
     * 获取用户增长趋势（最近7或30天）
     */
    @GetMapping("/user-growth")
    public Result<?> getUserGrowth() {
        List<Map<String, Object>> growthData = new ArrayList<>();

        for (int i = 29; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            QueryWrapper<User> query = new QueryWrapper<>();
            query.ge("create_time", date.atStartOfDay());
            query.lt("create_time", date.plusDays(1).atStartOfDay());

            long count = userService.count(query);
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", date.toString());
            dayData.put("count", count);
            growthData.add(dayData);
        }

        return Result.success(growthData);
    }

    /**
     * 获取用户转化漏斗数据
     */
    @GetMapping("/user-funnel")
    public Result<?> getUserFunnel() {
        Map<String, Object> funnel = new LinkedHashMap<>();

        try {
            long registeredCount = userService.count();
            funnel.put("registered", registeredCount);

            long planUsers = 0;
            try {
                QueryWrapper<User> planUserQuery = new QueryWrapper<>();
                planUserQuery.apply("id IN (SELECT DISTINCT user_id FROM study_plan)");
                planUsers = userService.count(planUserQuery);
            } catch (Exception e) {
                log.warn("Failed to count plan users: {}", e.getMessage());
            }
            funnel.put("active_plan", planUsers);

            QueryWrapper<User> vipQuery = new QueryWrapper<>();
            vipQuery.isNotNull("vip_expire_time").gt("vip_expire_time", LocalDateTime.now());
            long vipCount = userService.count(vipQuery);
            funnel.put("vip", vipCount);
        } catch (Exception e) {
            log.error("Error generating user funnel: {}", e.getMessage());
        }

        return Result.success(funnel);
    }
}
