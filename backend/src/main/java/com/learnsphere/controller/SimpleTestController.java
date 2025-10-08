package com.learnsphere.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 最简单的测试控制器
 */
@RestController
@RequestMapping("/api/simple")
public class SimpleTestController {

    @GetMapping("/ping")
    public String ping() {
        return "pong";
    }

    @GetMapping("/hello")
    public String hello() {
        return "Hello from LearnSphere AI!";
    }

    @GetMapping("/time")
    public String currentTime() {
        return "Current time: " + System.currentTimeMillis();
    }
}