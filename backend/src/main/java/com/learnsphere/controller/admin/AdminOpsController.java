package com.learnsphere.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.learnsphere.common.Result;
import com.learnsphere.entity.ReadingArticle;
import com.learnsphere.entity.User;
import com.learnsphere.entity.Vocabulary;
import com.learnsphere.service.IReadingArticleService;
import com.learnsphere.service.IUserService;
import com.learnsphere.service.IVocabularyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * 管理后台运维与搜索控制器
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminOpsController {

    private final RedisTemplate<String, Object> redisTemplate;
    private final IUserService userService;
    private final IVocabularyService vocabularyService;
    private final IReadingArticleService readingArticleService;

    /**
     * 获取 Redis 有键
     */
    @GetMapping("/redis/keys")
    public Result<?> getRedisKeys(@RequestParam(required = false, defaultValue = "*") String pattern) {
        String queryPattern = pattern != null ? pattern : "*";
        Set<String> keys = redisTemplate.keys(queryPattern);
        List<Map<String, Object>> result = new ArrayList<>();
        if (keys != null) {
            for (String key : keys) {
                if (key == null) {
                    continue;
                }
                Map<String, Object> item = new HashMap<>();
                item.put("key", key);
                item.put("type", redisTemplate.type(key) != null ? redisTemplate.type(key).name() : "none");
                result.add(item);
            }
        }
        return Result.success(result);
    }

    /**
     * 获取 Redis ?     */
    @GetMapping("/redis/detail")
    public Result<?> getRedisDetail(@RequestParam String key) {
        if (key == null) {
            return Result.error("Key cannot be null");
        }
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
     * 删除 Redis ?     */
    @DeleteMapping("/redis/key")
    public Result<?> deleteRedisKey(@RequestParam String key) {
        if (key != null) {
            redisTemplate.delete(key);
        }
        return Result.success("删除成功");
    }

    /**
     * 清理 Redis 缓存(按前缀)
     */
    @DeleteMapping("/redis/clear")
    public Result<?> clearRedisKeys(@RequestParam String pattern) {
        if (pattern == null) {
            return Result.error("Pattern cannot be null");
        }
        Set<String> keys = redisTemplate.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
        return Result.success("清理成功，共删除 " + (keys != null ? keys.size() : 0) + " 且");
    }

    /**
     * 系统计全局搜索 (Command Palette 后支持)
     */
    @GetMapping("/search")
    public Result<?> globalSearch(@RequestParam String q) {
        if (q == null || q.trim().length() < 2) {
            return Result.success(new ArrayList<>());
        }
        String keyword = q.trim();
        List<Map<String, Object>> results = new ArrayList<>();

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

        List<ReadingArticle> articles = readingArticleService.list(new QueryWrapper<ReadingArticle>()
                .like("title", keyword).last("LIMIT 5"));
        for (ReadingArticle a : articles) {
            Map<String, Object> map = new HashMap<>();
            map.put("type", "READING");
            map.put("id", a.getId());
            map.put("title", a.getTitle());
            map.put("subtitle", "阅文章");
            map.put("path", "/content?id=" + a.getId());
            results.add(map);
        }

        return Result.success(results);
    }
}
