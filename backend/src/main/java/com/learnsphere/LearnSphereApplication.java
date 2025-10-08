package com.learnsphere;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * LearnSphere AI 应用启动类
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@SpringBootApplication
@MapperScan("com.learnsphere.mapper")
public class LearnSphereApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(LearnSphereApplication.class, args);
        System.out.println("\n========================================");
        System.out.println("   LearnSphere AI 后端服务启动成功！   ");
        System.out.println("   访问地址: http://localhost:8080     ");
        System.out.println("========================================\n");
    }
}
