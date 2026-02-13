package com.learnsphere.controller;

import com.learnsphere.common.annotation.AdminOperation;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.entity.*;
import com.learnsphere.mapper.VipOrderMapper;
import com.learnsphere.service.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.RedisTemplate;
import java.util.concurrent.TimeUnit;

/**
 * 管理后台控制器
 * 
 * @author LearnSphere Team
 */
@Slf4j
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private IUserService userService;

    @Autowired
    private IVocabularyService vocabularyService;

    @Autowired
    private ILearningRecordService learningRecordService;

    @Autowired
    private IListeningMaterialService listeningMaterialService;

    @Autowired
    private IReadingArticleService readingArticleService;

    @Autowired
    private IWritingTopicService writingTopicService;

    @Autowired
    private IGrammarExerciseService grammarExerciseService;

    @Autowired
    private ISpeakingTopicService speakingTopicService;

    @Autowired
    private IAIGenerationService aiGenerationService;

    @Autowired
    private VipOrderMapper vipOrderMapper;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    /**
     * 获取系统统计数据
     */
    @GetMapping("/stats")
    public Result<?> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();

        // 总用户数
        long totalUsers = userService.count();
        stats.put("totalUsers", totalUsers);

        // 今日新增用户 (24小时内)
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

        // 分别统计月度 (1)、季度 (2)、年度 (3) 会员的订单总额
        String[] keys = { "", "monthly", "quarterly", "yearly" };
        double totalRevenue = 0.0;

        for (int level = 1; level <= 3; level++) {
            QueryWrapper<VipOrder> query = new QueryWrapper<>();
            query.eq("vip_level", level).eq("status", "PAID");
            query.select("SUM(amount) as totalAmount");

            // 安全地获取查询结果
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
     * 获取用户留存数据 (真实数据计算)
     */
    @GetMapping("/retention")
    public Result<?> getRetentionData() {
        List<Map<String, Object>> retention = new ArrayList<>();
        String[] labels = { "1日", "3日", "7日", "14日", "30日" };
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
            // 如果计算失败，返回空数据而不是模拟数据
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
     * 留存率 = (N天前注册且在之后有登录的用户数 / N天前注册的总用户数) * 100
     */
    private double calculateRetentionRate(int days) {
        LocalDateTime targetDate = LocalDateTime.now().minusDays(days);
        LocalDateTime oneDayBefore = targetDate.minusDays(1);

        // 查询N天前注册的用户总数 (targetDate-1天 到 targetDate 之间注册的用户)
        QueryWrapper<User> registeredQuery = new QueryWrapper<>();
        registeredQuery.ge("create_time", oneDayBefore)
                .lt("create_time", targetDate);
        long registeredCount = userService.count(registeredQuery);

        if (registeredCount == 0) {
            return 0.0;
        }

        // 查询这些用户中，在注册后有再次登录的用户数
        // (last_login_time > create_time 说明用户在注册后还登录过)
        QueryWrapper<User> retainedQuery = new QueryWrapper<>();
        retainedQuery.ge("create_time", oneDayBefore)
                .lt("create_time", targetDate)
                .apply("last_login_time > create_time");
        long retainedCount = userService.count(retainedQuery);

        // 计算留存率百分比
        double rate = (double) retainedCount / registeredCount * 100.0;

        // 保留两位小数
        return Math.round(rate * 100.0) / 100.0;
    }

    /**
     * 执行 AI 内容审查
     */
    /**
     * 执行 AI 内容审查
     */
    @PostMapping("/audit")
    @AdminOperation(module = "内容审查", action = "AI内容审查")
    public Result<?> auditContent(@RequestBody Map<String, Object> params) {
        String type = (String) params.get("type");
        Long id = Long.valueOf(params.get("id").toString());
        return Result.success(aiGenerationService.auditContent(type, id));
    }

    /**
     * 获取口语高分排行榜
     */
    @GetMapping("/speaking-leaderboard")
    public Result<?> getSpeakingLeaderboard() {
        // 查询最近 30 天的高分口语记录
        QueryWrapper<LearningRecord> query = new QueryWrapper<>();
        query.eq("content_type", "speaking")
                .orderByDesc("score")
                .last("LIMIT 10");

        List<LearningRecord> records = learningRecordService.list(query);
        List<Map<String, Object>> leaderboard = new ArrayList<>();

        if (records.isEmpty()) {
            return Result.success(leaderboard);
        }

        Set<Long> userIds = records.stream()
                .map(LearningRecord::getUserId)
                .collect(Collectors.toSet());

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
     * 获取用户增长趋势（最近30天）
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
            // 1. 总注册用户
            long registeredCount = userService.count();
            funnel.put("registered", registeredCount);

            // 2. 开启学习计划的用户 (防御性处理)
            long planUsers = 0;
            try {
                // 直接统计有学习计划的用户数，避免 IN 子查询
                // 假设：只有有效的用户才能创建学习计划，因此直接统计 study_plan 表的 distinct user_id 即可
                // 如果需要严格匹配 User 表（例如排除已注销用户），则原逻辑有意义但性能差。考虑到这是统计看板，近似值通常足够。
                // 但为了保持原有语义的不降级，我们尽量优化。
                // 优化方案：直接查询 study_plan 表
                // 修正：我们需要注入 IStudyPlanService，但这里没有。
                // 由于 AdminController 已经注入了太多 Service，不如直接用 SQL 或者保留原逻辑。
                // 考虑到 MybatisPlus 的限制，我们可以直接在 userService 层面做优化，或者维持原状但添加注释。
                // 下面尝试一个折中方案：直接返回 study_plan 的 distinct user_id 数量（这需要 StudyPlanService，但未注入）。
                // 既然无法轻易注入新 Service，我们保留原逻辑但增加 try-catch 保护，并在日志中标记。

                // 实际上，我们可以利用 learningRecordService 来代替吗？不，那是学习记录。
                // 让我们保持原逻辑但在 QueryWrapper 中不做改动，因为没有 easy fix without injecting new service.
                // 反而，我们可以检查前面的 import，发现 AdminController 其实没有 StudyPlanService。

                // 既然如此，我们可以尝试用更高效的 exists 代替 in，但在 MP 的 apply 中写 exists 比较繁琐。
                // 决定：保持代码逻辑，仅添加 null 检查或更安全的写法。
                QueryWrapper<User> planUserQuery = new QueryWrapper<>();
                planUserQuery.apply("id IN (SELECT DISTINCT user_id FROM study_plan)");
                planUsers = userService.count(planUserQuery);
            } catch (Exception e) {
                log.warn("Failed to count plan users: {}", e.getMessage());
            }
            funnel.put("active_plan", planUsers);

            // 3. VIP 用户 (有效期内)
            QueryWrapper<User> vipQuery = new QueryWrapper<>();
            vipQuery.isNotNull("vip_expire_time")
                    .gt("vip_expire_time", LocalDateTime.now());
            long vipCount = userService.count(vipQuery);
            funnel.put("vip", vipCount);
        } catch (Exception e) {
            log.error("Error generating user funnel: {}", e.getMessage());
        }

        return Result.success(funnel);
    }

    // User methods moved to AdminUserController

    /**
     * 获取词汇列表（分页）
     */
    @GetMapping("/vocabulary")
    public Result<?> getVocabularyList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String examType,
            @RequestParam(required = false) String keyword) {

        Page<Vocabulary> pageParam = new Page<>(page, size);
        QueryWrapper<Vocabulary> query = new QueryWrapper<>();

        if (examType != null && !examType.isEmpty()) {
            query.eq("exam_type", examType);
        }

        if (keyword != null && !keyword.trim().isEmpty()) {
            query.and(wrapper -> wrapper
                    .like("word", keyword)
                    .or().like("translation", keyword));
        }

        query.orderByDesc("create_time");
        Page<Vocabulary> result = vocabularyService.page(pageParam, query);

        return Result.success(result);
    }

    /**
     * 添加词汇
     */
    /**
     * 添加词汇
     */
    @PostMapping("/vocabulary")
    @AdminOperation(module = "词汇管理", action = "添加词汇")
    public Result<?> addVocabulary(@RequestBody Vocabulary vocabulary) {
        vocabulary.setCreateTime(LocalDateTime.now());
        vocabulary.setUpdateTime(LocalDateTime.now());
        vocabularyService.save(vocabulary);
        return Result.success("添加成功");
    }

    /**
     * 更新词汇
     */
    /**
     * 更新词汇
     */
    @PutMapping("/vocabulary/{id}")
    @AdminOperation(module = "词汇管理", action = "更新词汇")
    public Result<?> updateVocabulary(@PathVariable Long id, @RequestBody Vocabulary vocabulary) {
        vocabulary.setId(id);
        vocabulary.setUpdateTime(LocalDateTime.now());
        vocabularyService.updateById(vocabulary);
        return Result.success("更新成功");
    }

    /**
     * 删除词汇
     */
    /**
     * 删除词汇
     */
    @DeleteMapping("/vocabulary/{id}")
    @AdminOperation(module = "词汇管理", action = "删除词汇")
    public Result<?> deleteVocabulary(@PathVariable Long id) {
        vocabularyService.removeById(id);
        return Result.success("删除成功");
    }

    /**
     * 批量导入词汇
     */
    /**
     * 批量导入词汇
     */
    @PostMapping("/vocabulary/batch")
    @AdminOperation(module = "词汇管理", action = "批量导入词汇")
    public Result<?> batchAddVocabulary(@RequestBody List<Vocabulary> vocabularyList) {
        LocalDateTime now = LocalDateTime.now();
        for (Vocabulary vocab : vocabularyList) {
            vocab.setCreateTime(now);
            vocab.setUpdateTime(now);
        }
        vocabularyService.saveBatch(vocabularyList);
        return Result.success("批量导入成功，共导入" + vocabularyList.size() + "条");
    }

    /**
     * AI 生成词汇详情
     */
    /**
     * AI 生成词汇详情
     */
    @PostMapping("/vocabulary/{id}/generate-details")
    @AdminOperation(module = "词汇管理", action = "AI生成词汇详情")
    public Result<?> generateVocabularyDetails(@PathVariable Long id) {
        Vocabulary vocab = vocabularyService.getById(id);
        if (vocab == null) {
            return Result.error("Word not found");
        }

        String context = "Current Translation: " + vocab.getTranslation() + ", Definition: " + vocab.getDefinition();
        Map<String, Object> details = aiGenerationService.generateVocabularyDetails(vocab.getWord(), context);

        vocab.setPhonetic((String) details.getOrDefault("phonetic", vocab.getPhonetic()));
        vocab.setTranslation((String) details.getOrDefault("translation", vocab.getTranslation()));
        vocab.setDefinition((String) details.getOrDefault("definition", vocab.getDefinition()));
        vocab.setExample((String) details.getOrDefault("example", vocab.getExample()));
        vocab.setExampleTranslation((String) details.getOrDefault("exampleTranslation", vocab.getExampleTranslation()));
        vocab.setUpdateTime(LocalDateTime.now());

        vocabularyService.updateById(vocab);
        return Result.success(vocab);
    }

    /**
     * 批量 AI 生成词汇详情
     */
    /**
     * 批量 AI 生成词汇详情
     */
    @PostMapping("/vocabulary/batch-generate")
    @AdminOperation(module = "词汇管理", action = "批量AI生成词汇详情")
    public Result<?> batchGenerateVocabularyDetails(@RequestParam(defaultValue = "20") Integer limit) {
        // 修改：不再仅查找信息不全的单词，而是获取最近添加的单词进行强制 AI 修正（覆盖原有错误数据）
        QueryWrapper<Vocabulary> query = new QueryWrapper<>();
        // 优先处理最近添加的（通常是刚导入需要修正的）
        query.orderByDesc("create_time");
        query.last("LIMIT " + limit);
        List<Vocabulary> list = vocabularyService.list(query);

        int count = 0;
        for (Vocabulary vocab : list) {
            // 检查当前记录是否仍存在（因为可能作为重复项被上一轮循环删除了）
            if (vocabularyService.getById(vocab.getId()) == null) {
                continue;
            }

            try {
                // 1. 去重逻辑：删除数据库中所有拼写相同但 ID 不同的记录，确保唯一性
                QueryWrapper<Vocabulary> duplicateQuery = new QueryWrapper<>();
                duplicateQuery.eq("word", vocab.getWord());
                duplicateQuery.ne("id", vocab.getId());
                vocabularyService.remove(duplicateQuery);

                // 2. AI 生成详情
                String context = "Current Translation: " + vocab.getTranslation() + ", Definition: "
                        + vocab.getDefinition();
                Map<String, Object> details = aiGenerationService.generateVocabularyDetails(vocab.getWord(), context);

                vocab.setPhonetic((String) details.getOrDefault("phonetic", vocab.getPhonetic()));
                vocab.setTranslation((String) details.getOrDefault("translation", vocab.getTranslation()));
                vocab.setDefinition((String) details.getOrDefault("definition", vocab.getDefinition()));
                vocab.setExample((String) details.getOrDefault("example", vocab.getExample()));
                vocab.setExampleTranslation(
                        (String) details.getOrDefault("exampleTranslation", vocab.getExampleTranslation()));
                vocab.setUpdateTime(LocalDateTime.now());

                vocabularyService.updateById(vocab);
                count++;
            } catch (Exception e) {
                // 忽略单个失败
                log.error("Failed to generate details for vocabulary id: " + vocab.getId(), e);
            }
        }
        return Result.success("批量AI修正与去重完成，共处理 " + count + " 条");
    }

    /**
     * 全库去重：清理重复词汇，保留信息最完整的一条
     */
    /**
     * 全库去重：清理重复词汇，保留信息最完整的一条
     */
    @PostMapping("/vocabulary/deduplicate")
    @AdminOperation(module = "词汇管理", action = "词汇去重")
    public Result<?> deduplicateVocabulary() {
        // 1. 找出所有重复的单词 (word)
        QueryWrapper<Vocabulary> wrapper = new QueryWrapper<>();
        wrapper.select("word")
                .groupBy("word")
                .having("count(*) > 1");

        List<Object> duplicateWords = vocabularyService.listObjs(wrapper);

        if (duplicateWords.isEmpty()) {
            return Result.success("未发现重复词汇");
        }

        int deletedCount = 0;
        int processedGroups = 0;

        for (Object obj : duplicateWords) {
            String word = (String) obj;

            // 2. 获取该单词的所有记录
            List<Vocabulary> records = vocabularyService.list(new QueryWrapper<Vocabulary>().eq("word", word));
            if (records.size() <= 1)
                continue;

            // 3. 评分并排序：翻译+2分，例句+1分，定义+1分，ID越大(越新)+0.1分
            // 排序后，分数最高的排第一位（保留）
            records.sort((v1, v2) -> {
                double score1 = getVocabularyScore(v1);
                double score2 = getVocabularyScore(v2);
                return Double.compare(score2, score1); // 降序
            });

            // 4. 保留第一个，删除其余
            List<Long> deleteIds = new ArrayList<>();
            // 从索引1开始（跳过索引0，即保留项）
            for (int i = 1; i < records.size(); i++) {
                deleteIds.add(records.get(i).getId());
            }

            if (!deleteIds.isEmpty()) {
                vocabularyService.removeByIds(deleteIds);
                deletedCount += deleteIds.size();
            }
            processedGroups++;
        }

        return Result.success("去重完成，处理了 " + processedGroups + " 组重复词汇，共删除 " + deletedCount + " 条冗余记录");
    }

    private double getVocabularyScore(Vocabulary v) {
        double score = 0;
        if (v.getTranslation() != null && !v.getTranslation().isEmpty())
            score += 2;
        if (v.getExample() != null && !v.getExample().isEmpty())
            score += 1;
        if (v.getDefinition() != null && !v.getDefinition().isEmpty())
            score += 1;

        // 加上 ID 的微小权重，确保内容一样时保留最新的
        // 假设 ID 最大为 10亿，除以 100亿 得到 < 0.1 的值
        score += (v.getId() % 1000000000) / 10000000000.0;

        return score;
    }

    /**
     * 获取学习记录列表
     */
    @GetMapping("/learning-records")
    public Result<?> getLearningRecords(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String contentType) {

        Page<LearningRecord> pageParam = new Page<>(page, size);
        QueryWrapper<LearningRecord> query = new QueryWrapper<>();

        if (userId != null) {
            query.eq("user_id", userId);
        }

        if (contentType != null && !contentType.isEmpty()) {
            query.eq("content_type", contentType);
        }

        query.orderByDesc("create_time");
        Page<LearningRecord> result = learningRecordService.page(pageParam, query);

        return Result.success(result);
    }

    /**
     * 获取听力材料列表
     */
    @GetMapping("/listening")
    public Result<?> getListeningList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        Page<ListeningMaterial> pageParam = new Page<>(page, size);
        QueryWrapper<ListeningMaterial> query = new QueryWrapper<>();
        query.orderByDesc("create_time");

        Page<ListeningMaterial> result = listeningMaterialService.page(pageParam, query);
        return Result.success(result);
    }

    /**
     * 获取阅读文章列表
     */
    @GetMapping("/reading")
    public Result<?> getReadingList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        Page<ReadingArticle> pageParam = new Page<>(page, size);
        QueryWrapper<ReadingArticle> query = new QueryWrapper<>();
        query.orderByDesc("create_time");

        Page<ReadingArticle> result = readingArticleService.page(pageParam, query);
        return Result.success(result);
    }

    /**
     * 添加阅读文章
     */
    /**
     * 添加阅读文章
     */
    @PostMapping("/reading")
    @AdminOperation(module = "阅读管理", action = "添加文章")
    public Result<?> addReading(@RequestBody ReadingArticle article) {
        article.setCreateTime(LocalDateTime.now());
        readingArticleService.save(article);
        return Result.success("添加成功");
    }

    /**
     * 更新阅读文章
     */
    /**
     * 更新阅读文章
     */
    @PutMapping("/reading/{id}")
    @AdminOperation(module = "阅读管理", action = "更新文章")
    public Result<?> updateReading(@PathVariable Long id, @RequestBody ReadingArticle article) {
        article.setId(id);
        readingArticleService.updateById(article);
        return Result.success("更新成功");
    }

    /**
     * 删除阅读文章
     */
    /**
     * 删除阅读文章
     */
    @DeleteMapping("/reading/{id}")
    @AdminOperation(module = "阅读管理", action = "删除文章")
    public Result<?> deleteReading(@PathVariable Long id) {
        readingArticleService.removeById(id);
        return Result.success("删除成功");
    }

    /**
     * 添加听力材料
     */
    /**
     * 添加听力材料
     */
    @PostMapping("/listening")
    @AdminOperation(module = "听力管理", action = "添加听力")
    public Result<?> addListening(@RequestBody ListeningMaterial material) {
        material.setCreateTime(LocalDateTime.now());
        listeningMaterialService.save(material);
        return Result.success("添加成功");
    }

    /**
     * 更新听力材料
     */
    /**
     * 更新听力材料
     */
    @PutMapping("/listening/{id}")
    @AdminOperation(module = "听力管理", action = "更新听力")
    public Result<?> updateListening(@PathVariable Long id, @RequestBody ListeningMaterial material) {
        material.setId(id);
        listeningMaterialService.updateById(material);
        return Result.success("更新成功");
    }

    /**
     * 删除听力材料
     */
    /**
     * 删除听力材料
     */
    @DeleteMapping("/listening/{id}")
    @AdminOperation(module = "听力管理", action = "删除听力")
    public Result<?> deleteListening(@PathVariable Long id) {
        listeningMaterialService.removeById(id);
        return Result.success("删除成功");
    }

    // ================== 写作管理 ==================

    @GetMapping("/writing")
    public Result<?> getWritingList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        Page<WritingTopic> pageParam = new Page<>(page, size);
        QueryWrapper<WritingTopic> query = new QueryWrapper<>();
        query.orderByDesc("create_time");

        Page<WritingTopic> result = writingTopicService.page(pageParam, query);
        return Result.success(result);
    }

    @PostMapping("/writing")
    @AdminOperation(module = "写作管理", action = "添加写作")
    public Result<?> addWriting(@RequestBody WritingTopic topic) {
        topic.setCreateTime(LocalDateTime.now());
        writingTopicService.save(topic);
        return Result.success("添加成功");
    }

    @PutMapping("/writing/{id}")
    @AdminOperation(module = "写作管理", action = "更新写作")
    public Result<?> updateWriting(@PathVariable Long id, @RequestBody WritingTopic topic) {
        topic.setId(id);
        writingTopicService.updateById(topic);
        return Result.success("更新成功");
    }

    @DeleteMapping("/writing/{id}")
    @AdminOperation(module = "写作管理", action = "删除写作")
    public Result<?> deleteWriting(@PathVariable Long id) {
        writingTopicService.removeById(id);
        return Result.success("删除成功");
    }

    // ================== 语法练习管理 ==================

    @GetMapping("/grammar")
    public Result<?> getGrammarList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        Page<GrammarExercise> pageParam = new Page<>(page, size);
        QueryWrapper<GrammarExercise> query = new QueryWrapper<>();
        query.orderByDesc("create_time");

        Page<GrammarExercise> result = grammarExerciseService.page(pageParam, query);
        return Result.success(result);
    }

    @PostMapping("/grammar")
    @AdminOperation(module = "语法管理", action = "添加练习")
    public Result<?> addGrammar(@RequestBody GrammarExercise exercise) {
        exercise.setCreateTime(LocalDateTime.now());
        grammarExerciseService.save(exercise);
        return Result.success("添加成功");
    }

    @PutMapping("/grammar/{id}")
    @AdminOperation(module = "语法管理", action = "更新练习")
    public Result<?> updateGrammar(@PathVariable Long id, @RequestBody GrammarExercise exercise) {
        exercise.setId(id);
        grammarExerciseService.updateById(exercise);
        return Result.success("更新成功");
    }

    @DeleteMapping("/grammar/{id}")
    @AdminOperation(module = "语法管理", action = "删除练习")
    public Result<?> deleteGrammar(@PathVariable Long id) {
        grammarExerciseService.removeById(id);
        return Result.success("删除成功");
    }

    // ================== 口语话题管理 ==================

    @GetMapping("/speaking")
    public Result<?> getSpeakingList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        Page<SpeakingTopic> pageParam = new Page<>(page, size);
        QueryWrapper<SpeakingTopic> query = new QueryWrapper<>();
        query.orderByDesc("create_time");

        Page<SpeakingTopic> result = speakingTopicService.page(pageParam, query);
        return Result.success(result);
    }

    @PostMapping("/speaking")
    @AdminOperation(module = "口语管理", action = "添加话题")
    public Result<?> addSpeaking(@RequestBody SpeakingTopic topic) {
        topic.setCreateTime(LocalDateTime.now());
        speakingTopicService.save(topic);
        return Result.success("添加成功");
    }

    @PutMapping("/speaking/{id}")
    @AdminOperation(module = "口语管理", action = "更新话题")
    public Result<?> updateSpeaking(@PathVariable Long id, @RequestBody SpeakingTopic topic) {
        topic.setId(id);
        speakingTopicService.updateById(topic);
        return Result.success("更新成功");
    }

    @DeleteMapping("/speaking/{id}")
    @AdminOperation(module = "口语管理", action = "删除话题")
    public Result<?> deleteSpeaking(@PathVariable Long id) {
        speakingTopicService.removeById(id);
        return Result.success("删除成功");
    }

    /**
     * 获取 Redis 所有键
     */
    @GetMapping("/redis/keys")
    public Result<?> getRedisKeys(@RequestParam(required = false, defaultValue = "*") String pattern) {
        String queryPattern = pattern != null ? pattern : "*";
        Set<String> keys = redisTemplate.keys(queryPattern);
        List<Map<String, Object>> result = new ArrayList<>();
        if (keys != null) {
            for (String key : keys) {
                if (key == null)
                    continue;
                Map<String, Object> item = new HashMap<>();
                item.put("key", key);
                item.put("type", redisTemplate.type(key) != null ? redisTemplate.type(key).name() : "none");
                result.add(item);
            }
        }
        return Result.success(result);
    }

    /**
     * 获取 Redis 键详情
     */
    @GetMapping("/redis/detail")
    public Result<?> getRedisDetail(@RequestParam String key) {
        if (key == null)
            return Result.error("Key cannot be null");
        Object value = redisTemplate.opsForValue().get(key);
        Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
        Map<String, Object> detail = new HashMap<>();
        detail.put("key", key);
        detail.put("value", value);
        detail.put("ttl", ttl);
        detail.put("type", redisTemplate.type(key) != null ? redisTemplate.type(key).name() : "none");
        return Result.success(detail);
    }

    /**
     * 删除 Redis 键
     */
    @DeleteMapping("/redis/key")
    public Result<?> deleteRedisKey(@RequestParam String key) {
        if (key != null) {
            redisTemplate.delete(key);
        }
        return Result.success("删除成功");
    }

    /**
     * 清理 Redis 键 (按前缀)
     */
    @DeleteMapping("/redis/clear")
    public Result<?> clearRedisKeys(@RequestParam String pattern) {
        if (pattern == null)
            return Result.error("Pattern cannot be null");
        Set<String> keys = redisTemplate.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
        return Result.success("清理成功，共删除 " + (keys != null ? keys.size() : 0) + " 个键");
    }

    /**
     * 系统全局搜索 (Command Palette 后端支持)
     */
    @GetMapping("/search")
    public Result<?> globalSearch(@RequestParam String q) {
        if (q == null || q.trim().length() < 2) {
            return Result.success(new ArrayList<>());
        }
        String keyword = q.trim();
        List<Map<String, Object>> results = new ArrayList<>();

        // 1. 搜索用户 (用户名/邮箱/手机)
        List<User> users = userService.list(new QueryWrapper<User>()
                .like("username", keyword).or().like("email", keyword)
                .last("LIMIT 5"));
        for (User u : users) {
            Map<String, Object> map = new HashMap<>();
            map.put("type", "USER");
            map.put("id", u.getId());
            map.put("title", u.getUsername());
            map.put("subtitle", u.getEmail());
            map.put("path", "/users?id=" + u.getId());
            results.add(map);
        }

        // 2. 搜索词库 (单词/翻译)
        List<Vocabulary> vocabs = vocabularyService.list(new QueryWrapper<Vocabulary>()
                .like("word", keyword).or().like("translation", keyword)
                .last("LIMIT 5"));
        for (Vocabulary v : vocabs) {
            Map<String, Object> map = new HashMap<>();
            map.put("type", "VOCABULARY");
            map.put("id", v.getId());
            map.put("title", v.getWord());
            map.put("subtitle", v.getTranslation());
            map.put("path", "/vocabulary?id=" + v.getId());
            results.add(map);
        }

        // 3. 搜索阅读文章
        List<ReadingArticle> articles = readingArticleService.list(new QueryWrapper<ReadingArticle>()
                .like("title", keyword).last("LIMIT 5"));
        for (ReadingArticle a : articles) {
            Map<String, Object> map = new HashMap<>();
            map.put("type", "READING");
            map.put("id", a.getId());
            map.put("title", a.getTitle());
            map.put("subtitle", "阅读文章");
            map.put("path", "/content?id=" + a.getId());
            results.add(map);
        }

        return Result.success(results);
    }

}
