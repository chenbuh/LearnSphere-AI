package com.learnsphere;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

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
        ConfigurableApplicationContext context = SpringApplication.run(LearnSphereApplication.class, args);
        System.out.println("\n========================================");
        System.out.println("   LearnSphere AI 后端服务启动成功！  ");
        System.out.println("   访问地址: http://localhost:" + context.getEnvironment().getProperty("local.server.port")
                + "     ");
        System.out.println("========================================\n");
    }
}
