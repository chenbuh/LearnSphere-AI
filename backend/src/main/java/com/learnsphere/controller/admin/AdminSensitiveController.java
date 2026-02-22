package com.learnsphere.controller.admin;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.entity.SensitiveLog;
import com.learnsphere.entity.SensitiveWord;
import com.learnsphere.mapper.SensitiveLogMapper;
import com.learnsphere.mapper.SensitiveWordMapper;
import com.learnsphere.service.IContentManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 后台敏感内容审计控制器
 */
@RestController
@RequestMapping("/api/admin/sensitive")
@RequiredArgsConstructor
@SaCheckRole("admin")
public class AdminSensitiveController {

    private final SensitiveLogMapper sensitiveLogMapper;
    private final SensitiveWordMapper sensitiveWordMapper;
    private final IContentManagementService contentManagementService;

    /**
     * 分页查询审核日志
     */
    @GetMapping("/list")
    public Result<Page<SensitiveLog>> getList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {

        Page<SensitiveLog> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<SensitiveLog> wrapper = new LambdaQueryWrapper<>();

        if (cn.hutool.core.util.StrUtil.isNotBlank(keyword)) {
            wrapper.like(SensitiveLog::getUsername, keyword)
                    .or()
                    .like(SensitiveLog::getContent, keyword)
                    .or()
                    .like(SensitiveLog::getMatchedWord, keyword);
        }

        wrapper.orderByDesc(SensitiveLog::getCreateTime);

        return Result.success(sensitiveLogMapper.selectPage(pageParam, wrapper));
    }

    /**
     * 删除审核日志
     */
    @DeleteMapping("/{id}")
    @com.learnsphere.common.annotation.AdminOperation(module = "内容审计", action = "删除审计记录")
    public Result<Void> delete(@PathVariable Long id) {
        sensitiveLogMapper.deleteById(id);
        return Result.success();
    }

    /**
     * 批量删除审核日志
     */
    @PostMapping("/batch-delete")
    @com.learnsphere.common.annotation.AdminOperation(module = "内容审计", action = "批量删除审计记录")
    public Result<Void> batchDelete(@RequestBody java.util.List<Long> ids) {
        sensitiveLogMapper.deleteBatchIds(ids);
        return Result.success();
    }

    /**
     * 获取审计拦截统计数据 (今日、趋势、词频)
     */
    @GetMapping("/stats")
    public Result<Map<String, Object>> getStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = now.with(LocalTime.MIN);
        LocalDateTime last24hStart = now.minusHours(24);

        long todayCount = sensitiveLogMapper.selectCount(
                new LambdaQueryWrapper<SensitiveLog>().ge(SensitiveLog::getCreateTime, todayStart));

        List<SensitiveLog> recentLogs = sensitiveLogMapper.selectList(
                new LambdaQueryWrapper<SensitiveLog>().ge(SensitiveLog::getCreateTime, now.minusDays(7)));

        Map<String, Long> wordCountMap = recentLogs.stream()
                .filter(log -> cn.hutool.core.util.StrUtil.isNotBlank(log.getMatchedWord()))
                .collect(Collectors.groupingBy(SensitiveLog::getMatchedWord, Collectors.counting()));

        List<Map<String, Object>> topWords = wordCountMap.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", e.getKey());
                    map.put("value", e.getValue());
                    return map;
                })
                .collect(Collectors.toList());

        List<SensitiveLog> last24hLogs = sensitiveLogMapper.selectList(
                new LambdaQueryWrapper<SensitiveLog>().ge(SensitiveLog::getCreateTime, last24hStart));

        List<String> hoursList = new ArrayList<>();
        List<Long> countsList = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:00");

        for (int i = 24; i >= 0; i -= 2) {
            LocalDateTime intervalEnd = now.minusHours(i);
            LocalDateTime intervalStart = intervalEnd.minusHours(2);
            hoursList.add(intervalEnd.format(formatter));

            long count = last24hLogs.stream()
                    .filter(log -> log.getCreateTime() != null
                            && log.getCreateTime().compareTo(intervalStart) >= 0
                            && log.getCreateTime().compareTo(intervalEnd) <= 0)
                    .count();
            countsList.add(count);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("todayCount", todayCount);
        res.put("topWords", topWords);
        res.put("trendTimes", hoursList);
        res.put("trendCounts", countsList);

        return Result.success(res);
    }

    /**
     * 分页查询敏感词库
     */
    @GetMapping("/words")
    public Result<Page<SensitiveWord>> getWords(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        Page<SensitiveWord> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<SensitiveWord> wrapper = new LambdaQueryWrapper<>();
        if (cn.hutool.core.util.StrUtil.isNotBlank(keyword)) {
            wrapper.like(SensitiveWord::getWord, keyword);
        }
        return Result.success(sensitiveWordMapper.selectPage(pageParam, wrapper));
    }

    /**
     * 添加敏感词
     */
    @PostMapping("/words")
    @com.learnsphere.common.annotation.AdminOperation(module = "内容审计", action = "添加敏感词")
    public Result<Void> addWord(@RequestBody SensitiveWord word) {
        try {
            sensitiveWordMapper.insert(word);
            return Result.success();
        } catch (org.springframework.dao.DuplicateKeyException e) {
            return Result.error(400, "敏感词已存在");
        }
    }

    /**
     * 删除敏感词
     */
    @DeleteMapping("/words/{id}")
    @com.learnsphere.common.annotation.AdminOperation(module = "内容审计", action = "删除敏感词")
    public Result<Void> deleteWord(@PathVariable Long id) {
        sensitiveWordMapper.deleteById(id);
        return Result.success();
    }

    /**
     * 重载敏感词库到内存
     */
    @PostMapping("/words/reload")
    @com.learnsphere.common.annotation.AdminOperation(module = "内容审计", action = "重载敏感词库")
    public Result<Void> reloadWords() {
        contentManagementService.reloadSensitiveWords();
        return Result.success();
    }
}
