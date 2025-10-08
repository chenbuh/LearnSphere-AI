package com.learnsphere.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.entity.*;
import com.learnsphere.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * 管理后台控制器
 * 
 * @author LearnSphere Team
 */
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

    /**
     * 获取系统统计数据
     */
    @GetMapping("/stats")
    public Result<?> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();

        // 总用户数
        long totalUsers = userService.count();
        stats.put("totalUsers", totalUsers);

        // 活跃用户数（最近7天有学习记录）
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        QueryWrapper<LearningRecord> activeQuery = new QueryWrapper<>();
        activeQuery.ge("create_time", sevenDaysAgo);
        activeQuery.select("DISTINCT user_id");
        long activeUsers = learningRecordService.count(activeQuery);
        stats.put("activeUsers", activeUsers);

        // 词汇总数
        long totalVocabulary = vocabularyService.count();
        stats.put("totalVocabulary", totalVocabulary);

        // 学习记录总数
        long totalRecords = learningRecordService.count();
        stats.put("totalRecords", totalRecords);

        // 今日新增用户
        QueryWrapper<User> todayUserQuery = new QueryWrapper<>();
        todayUserQuery.ge("create_time", LocalDate.now().atStartOfDay());
        long todayNewUsers = userService.count(todayUserQuery);
        stats.put("todayNewUsers", todayNewUsers);

        // 今日学习次数
        QueryWrapper<LearningRecord> todayRecordQuery = new QueryWrapper<>();
        todayRecordQuery.ge("create_time", LocalDate.now().atStartOfDay());
        long todayLearning = learningRecordService.count(todayRecordQuery);
        stats.put("todayLearning", todayLearning);

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
     * 获取用户列表（分页）
     */
    @GetMapping("/users")
    public Result<?> getUserList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword) {

        Page<User> pageParam = new Page<>(page, size);
        QueryWrapper<User> query = new QueryWrapper<>();

        if (keyword != null && !keyword.trim().isEmpty()) {
            query.and(wrapper -> wrapper
                    .like("username", keyword)
                    .or().like("email", keyword)
                    .or().like("nickname", keyword));
        }

        query.orderByDesc("create_time");
        Page<User> result = userService.page(pageParam, query);

        return Result.success(result);
    }

    /**
     * 更新用户状态（启用/禁用）
     */
    @PutMapping("/users/{id}/status")
    public Result<?> updateUserStatus(@PathVariable Long id, @RequestParam Integer status) {
        User user = userService.getById(id);
        if (user == null) {
            return Result.error("用户不存在");
        }

        user.setStatus(status);
        userService.updateById(user);

        return Result.success("状态更新成功");
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/users/{id}")
    public Result<?> deleteUser(@PathVariable Long id) {
        userService.removeById(id);
        return Result.success("删除成功");
    }

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
    @PostMapping("/vocabulary")
    public Result<?> addVocabulary(@RequestBody Vocabulary vocabulary) {
        vocabulary.setCreateTime(LocalDateTime.now());
        vocabulary.setUpdateTime(LocalDateTime.now());
        vocabularyService.save(vocabulary);
        return Result.success("添加成功");
    }

    /**
     * 更新词汇
     */
    @PutMapping("/vocabulary/{id}")
    public Result<?> updateVocabulary(@PathVariable Long id, @RequestBody Vocabulary vocabulary) {
        vocabulary.setId(id);
        vocabulary.setUpdateTime(LocalDateTime.now());
        vocabularyService.updateById(vocabulary);
        return Result.success("更新成功");
    }

    /**
     * 删除词汇
     */
    @DeleteMapping("/vocabulary/{id}")
    public Result<?> deleteVocabulary(@PathVariable Long id) {
        vocabularyService.removeById(id);
        return Result.success("删除成功");
    }

    /**
     * 批量导入词汇
     */
    @PostMapping("/vocabulary/batch")
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
    @PostMapping("/reading")
    public Result<?> addReading(@RequestBody ReadingArticle article) {
        article.setCreateTime(LocalDateTime.now());
        readingArticleService.save(article);
        return Result.success("添加成功");
    }

    /**
     * 更新阅读文章
     */
    @PutMapping("/reading/{id}")
    public Result<?> updateReading(@PathVariable Long id, @RequestBody ReadingArticle article) {
        article.setId(id);
        readingArticleService.updateById(article);
        return Result.success("更新成功");
    }

    /**
     * 删除阅读文章
     */
    @DeleteMapping("/reading/{id}")
    public Result<?> deleteReading(@PathVariable Long id) {
        readingArticleService.removeById(id);
        return Result.success("删除成功");
    }

    /**
     * 添加听力材料
     */
    @PostMapping("/listening")
    public Result<?> addListening(@RequestBody ListeningMaterial material) {
        material.setCreateTime(LocalDateTime.now());
        listeningMaterialService.save(material);
        return Result.success("添加成功");
    }

    /**
     * 更新听力材料
     */
    @PutMapping("/listening/{id}")
    public Result<?> updateListening(@PathVariable Long id, @RequestBody ListeningMaterial material) {
        material.setId(id);
        listeningMaterialService.updateById(material);
        return Result.success("更新成功");
    }

    /**
     * 删除听力材料
     */
    @DeleteMapping("/listening/{id}")
    public Result<?> deleteListening(@PathVariable Long id) {
        listeningMaterialService.removeById(id);
        return Result.success("删除成功");
    }
}
