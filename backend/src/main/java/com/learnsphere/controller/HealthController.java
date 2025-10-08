package com.learnsphere.controller;

import com.learnsphere.common.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 健康检查控制器
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    /**
     * 健康检查
     */
    @GetMapping("/check")
    public Result<Map<String, Object>> healthCheck() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "UP");
        data.put("timestamp", LocalDateTime.now());
        data.put("message", "LearnSphere AI 后端服务运行正常");
        return Result.success(data);
    }

    /**
     * 版本信息
     */
    @GetMapping("/version")
    public Result<Map<String, Object>> version() {
        Map<String, Object> data = new HashMap<>();
        data.put("name", "LearnSphere AI Backend");
        data.put("version", "1.0.0");
        data.put("description", "智能英语学习平台后端服务");
        data.put("author", "LearnSphere Team");
        return Result.success(data);
    }
}