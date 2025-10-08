# 📘 LearnSphere AI - 后端开发文档

> Spring Boot 3.0.5 + MyBatis-Plus + MySQL + Redis + Sa-Token

## 📑 目录

- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [核心配置](#核心配置)
- [数据库设计](#数据库设计)
- [核心功能实现](#核心功能实现)
- [Sa-Token认证](#sa-token认证)
- [Redis缓存](#redis缓存)
- [开发规范](#开发规范)

---

## 技术栈

### 核心依赖

```xml
<!-- Spring Boot 3.0.5 -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.0.5</version>
</parent>

<dependencies>
    <!-- Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- MyBatis-Plus -->
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-boot-starter</artifactId>
        <version>3.5.3.1</version>
    </dependency>
    
    <!-- MySQL -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <version>8.0.33</version>
    </dependency>
    
    <!-- Redis -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    
    <!-- Sa-Token -->
    <dependency>
        <groupId>cn.dev33</groupId>
        <artifactId>sa-token-spring-boot3-starter</artifactId>
        <version>1.37.0</version>
    </dependency>
    
    <!-- Sa-Token Redis集成 -->
    <dependency>
        <groupId>cn.dev33</groupId>
        <artifactId>sa-token-redis-jackson</artifactId>
        <version>1.37.0</version>
    </dependency>
    
    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    
    <!-- Hutool工具类 -->
    <dependency>
        <groupId>cn.hutool</groupId>
        <artifactId>hutool-all</artifactId>
        <version>5.8.25</version>
    </dependency>
</dependencies>
```

---

## 项目结构

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── learnsphere/
│   │   │           ├── LearnSphereApplication.java  # 启动类
│   │   │           ├── config/                      # 配置类
│   │   │           │   ├── MybatisPlusConfig.java
│   │   │           │   ├── RedisConfig.java
│   │   │           │   ├── SaTokenConfig.java
│   │   │           │   └── CorsConfig.java
│   │   │           ├── controller/                  # 控制器
│   │   │           │   ├── AuthController.java
│   │   │           │   ├── UserController.java
│   │   │           │   ├── VocabularyController.java
│   │   │           │   ├── GrammarController.java
│   │   │           │   └── LearningController.java
│   │   │           ├── service/                     # 服务层
│   │   │           │   ├── IUserService.java
│   │   │           │   ├── IVocabularyService.java
│   │   │           │   ├── IGrammarService.java
│   │   │           │   └── impl/
│   │   │           │       ├── UserServiceImpl.java
│   │   │           │       ├── VocabularyServiceImpl.java
│   │   │           │       └── GrammarServiceImpl.java
│   │   │           ├── mapper/                      # 数据访问层
│   │   │           │   ├── UserMapper.java
│   │   │           │   ├── VocabularyMapper.java
│   │   │           │   ├── GrammarMapper.java
│   │   │           │   └── LearningRecordMapper.java
│   │   │           ├── entity/                      # 实体类
│   │   │           │   ├── User.java
│   │   │           │   ├── Vocabulary.java
│   │   │           │   ├── Grammar.java
│   │   │           │   └── LearningRecord.java
│   │   │           ├── dto/                         # 数据传输对象
│   │   │           │   ├── LoginDTO.java
│   │   │           │   ├── RegisterDTO.java
│   │   │           │   └── UserDTO.java
│   │   │           ├── vo/                          # 视图对象
│   │   │           │   ├── UserVO.java
│   │   │           │   └── VocabularyVO.java
│   │   │           ├── common/                      # 公共类
│   │   │           │   ├── Result.java              # 统一返回结果
│   │   │           │   ├── ResultCode.java          # 返回码枚举
│   │   │           │   └── PageResult.java          # 分页结果
│   │   │           ├── exception/                   # 异常处理
│   │   │           │   ├── BusinessException.java
│   │   │           │   └── GlobalExceptionHandler.java
│   │   │           └── utils/                       # 工具类
│   │   │               ├── JwtUtil.java
│   │   │               ├── RedisUtil.java
│   │   │               └── PasswordUtil.java
│   │   └── resources/
│   │       ├── application.yml                      # 主配置文件
│   │       ├── application-dev.yml                  # 开发环境配置
│   │       ├── application-prod.yml                 # 生产环境配置
│   │       └── mapper/                              # MyBatis XML
│   │           ├── UserMapper.xml
│   │           ├── VocabularyMapper.xml
│   │           └── GrammarMapper.xml
│   └── test/                                        # 测试代码
├── pom.xml                                          # Maven配置
└── README.md
```

---

## 核心配置

### application.yml

```yaml
server:
  port: 8080
  servlet:
    context-path: /

spring:
  application:
    name: learnsphere-ai
  
  profiles:
    active: dev
  
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/learnsphere_ai?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=false
    username: root
    password: chen20040209
    hikari:
      minimum-idle: 5
      maximum-pool-size: 20
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
  
  redis:
    host: localhost
    port: 6379
    password: 
    database: 0
    timeout: 5000
    lettuce:
      pool:
        max-active: 8
        max-wait: -1
        max-idle: 8
        min-idle: 0

# MyBatis-Plus配置
mybatis-plus:
  mapper-locations: classpath*:/mapper/**/*.xml
  type-aliases-package: com.learnsphere.entity
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
  global-config:
    db-config:
      id-type: auto
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0

# Sa-Token配置
sa-token:
  # token名称
  token-name: satoken
  # token有效期（单位：秒）默认30天，-1代表永不过期
  timeout: 2592000
  # token临时有效期（指定时间内无操作就视为token过期）单位：秒
  active-timeout: -1
  # 是否允许同一账号并发登录（为true时允许一起登录，为false时新登录挤掉旧登录）
  is-concurrent: true
  # 在多人登录同一账号时，是否共用一个token（为true时所有登录共用一个token，为false时每次登录新建一个token）
  is-share: true
  # token风格
  token-style: uuid
  # 是否输出操作日志
  is-log: false

# 日志配置
logging:
  level:
    com.learnsphere: debug
    com.baomidou.mybatisplus: debug
  pattern:
    console: '%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{50} - %msg%n'
```

### MybatisPlusConfig.java

```java
package com.learnsphere.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MyBatis-Plus配置类
 */
@Configuration
public class MybatisPlusConfig {
    
    /**
     * 分页插件
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}
```

### SaTokenConfig.java

```java
package com.learnsphere.config;

import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.stp.StpUtil;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Sa-Token配置类
 */
@Configuration
public class SaTokenConfig implements WebMvcConfigurer {
    
    /**
     * 注册Sa-Token拦截器
     */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 注册Sa-Token拦截器，校验规则为StpUtil.checkLogin()登录校验
        registry.addInterceptor(new SaInterceptor(handle -> StpUtil.checkLogin()))
                .addPathPatterns("/**")
                .excludePathPatterns(
                    "/api/auth/login",
                    "/api/auth/register",
                    "/api/auth/captcha",
                    "/doc.html",
                    "/swagger-ui/**",
                    "/swagger-resources/**",
                    "/v3/api-docs/**"
                );
    }
}
```

### CorsConfig.java

```java
package com.learnsphere.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * 跨域配置
 */
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        // 允许所有域名跨域
        config.addAllowedOriginPattern("*");
        // 允许所有请求头
        config.addAllowedHeader("*");
        // 允许所有请求方法
        config.addAllowedMethod("*");
        // 允许携带凭证
        config.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

---

## 数据库设计

### 用户表 (user)

```sql
CREATE TABLE `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `email` VARCHAR(100) COMMENT '邮箱',
  `nickname` VARCHAR(50) COMMENT '昵称',
  `avatar` VARCHAR(255) COMMENT '头像URL',
  `phone` VARCHAR(20) COMMENT '手机号',
  `exam_type` VARCHAR(20) COMMENT '考试类型',
  `target_score` INT COMMENT '目标分数',
  `current_level` VARCHAR(20) COMMENT '当前水平',
  `status` TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-正常',
  `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

### 词汇表 (vocabulary)

```sql
CREATE TABLE `vocabulary` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '词汇ID',
  `word` VARCHAR(100) NOT NULL COMMENT '单词',
  `phonetic` VARCHAR(100) COMMENT '音标',
  `definition` TEXT COMMENT '释义',
  `translation` VARCHAR(500) COMMENT '中文翻译',
  `example` TEXT COMMENT '例句',
  `example_translation` TEXT COMMENT '例句翻译',
  `exam_type` VARCHAR(20) COMMENT '考试类型',
  `difficulty` TINYINT COMMENT '难度等级：1-5',
  `frequency` INT DEFAULT 0 COMMENT '词频',
  `tags` VARCHAR(255) COMMENT '标签（JSON数组）',
  `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_word` (`word`),
  KEY `idx_exam_type` (`exam_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='词汇表';
```

### 学习记录表 (learning_record)

```sql
CREATE TABLE `learning_record` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `content_id` BIGINT NOT NULL COMMENT '内容ID',
  `content_type` VARCHAR(20) NOT NULL COMMENT '内容类型：vocabulary/grammar/reading',
  `is_correct` TINYINT COMMENT '是否正确：0-错误，1-正确',
  `time_spent` INT COMMENT '耗时（秒）',
  `score` INT COMMENT '得分',
  `answer` TEXT COMMENT '用户答案',
  `correct_answer` TEXT COMMENT '正确答案',
  `mastery_level` TINYINT DEFAULT 0 COMMENT '掌握程度：0-5',
  `review_count` INT DEFAULT 0 COMMENT '复习次数',
  `last_review_time` DATETIME COMMENT '最后复习时间',
  `next_review_time` DATETIME COMMENT '下次复习时间',
  `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_content` (`content_id`, `content_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='学习记录表';
```

---

## 核心功能实现

### 统一返回结果

```java
package com.learnsphere.common;

import lombok.Data;

/**
 * 统一返回结果
 */
@Data
public class Result<T> {
    private Integer code;
    private String message;
    private T data;
    
    public static <T> Result<T> success() {
        return success(null);
    }
    
    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(200);
        result.setMessage("操作成功");
        result.setData(data);
        return result;
    }
    
    public static <T> Result<T> error(String message) {
        Result<T> result = new Result<>();
        result.setCode(500);
        result.setMessage(message);
        return result;
    }
    
    public static <T> Result<T> error(Integer code, String message) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }
}
```

### 用户实体类

```java
package com.learnsphere.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 用户实体
 */
@Data
@TableName("user")
public class User {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String username;
    
    private String password;
    
    private String email;
    
    private String nickname;
    
    private String avatar;
    
    private String phone;
    
    private String examType;
    
    private Integer targetScore;
    
    private String currentLevel;
    
    private Integer status;
    
    @TableLogic
    private Integer deleted;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
```

### 认证控制器

```java
package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.Result;
import com.learnsphere.dto.LoginDTO;
import com.learnsphere.dto.RegisterDTO;
import com.learnsphere.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 认证控制器
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final IUserService userService;
    
    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody LoginDTO loginDTO) {
        // 验证用户名密码
        User user = userService.login(loginDTO);
        
        // 登录成功，生成token
        StpUtil.login(user.getId());
        String token = StpUtil.getTokenValue();
        
        // 返回用户信息和token
        Map<String, Object> data = new HashMap<>();
        data.put("satoken", token);
        data.put("user", user);
        
        return Result.success(data);
    }
    
    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<Void> register(@RequestBody RegisterDTO registerDTO) {
        userService.register(registerDTO);
        return Result.success();
    }
    
    /**
     * 用户登出
     */
    @PostMapping("/logout")
    public Result<Void> logout() {
        StpUtil.logout();
        return Result.success();
    }
    
    /**
     * 获取当前登录用户信息
     */
    @GetMapping("/info")
    public Result<User> getUserInfo() {
        Long userId = StpUtil.getLoginIdAsLong();
        User user = userService.getById(userId);
        return Result.success(user);
    }
}
```

### 用户服务实现

```java
package com.learnsphere.service.impl;

import cn.hutool.crypto.digest.BCrypt;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.dto.LoginDTO;
import com.learnsphere.dto.RegisterDTO;
import com.learnsphere.entity.User;
import com.learnsphere.exception.BusinessException;
import com.learnsphere.mapper.UserMapper;
import com.learnsphere.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 用户服务实现
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {
    
    @Override
    public User login(LoginDTO loginDTO) {
        // 查询用户
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, loginDTO.getUsername());
        User user = this.getOne(wrapper);
        
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        
        // 验证密码
        if (!BCrypt.checkpw(loginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException("密码错误");
        }
        
        // 检查用户状态
        if (user.getStatus() == 0) {
            throw new BusinessException("账号已被禁用");
        }
        
        return user;
    }
    
    @Override
    public void register(RegisterDTO registerDTO) {
        // 检查用户名是否存在
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, registerDTO.getUsername());
        if (this.count(wrapper) > 0) {
            throw new BusinessException("用户名已存在");
        }
        
        // 检查邮箱是否存在
        wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getEmail, registerDTO.getEmail());
        if (this.count(wrapper) > 0) {
            throw new BusinessException("邮箱已被注册");
        }
        
        // 创建用户
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setPassword(BCrypt.hashpw(registerDTO.getPassword()));
        user.setEmail(registerDTO.getEmail());
        user.setNickname(registerDTO.getUsername());
        user.setStatus(1);
        
        this.save(user);
    }
}
```

---

## Sa-Token认证

### 登录认证

```java
// 登录
StpUtil.login(userId);

// 获取当前登录用户ID
Long userId = StpUtil.getLoginIdAsLong();

// 检查是否登录
StpUtil.checkLogin();

// 登出
StpUtil.logout();
```

### 权限认证

```java
// 检查权限
StpUtil.checkPermission("user:add");

// 检查角色
StpUtil.checkRole("admin");

// 获取权限列表
List<String> permissions = StpUtil.getPermissionList();
```

---

## Redis缓存

### RedisUtil工具类

```java
package com.learnsphere.utils;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

/**
 * Redis工具类
 */
@Component
@RequiredArgsConstructor
public class RedisUtil {
    
    private final RedisTemplate<String, Object> redisTemplate;
    
    /**
     * 设置缓存
     */
    public void set(String key, Object value) {
        redisTemplate.opsForValue().set(key, value);
    }
    
    /**
     * 设置缓存（带过期时间）
     */
    public void set(String key, Object value, long timeout, TimeUnit unit) {
        redisTemplate.opsForValue().set(key, value, timeout, unit);
    }
    
    /**
     * 获取缓存
     */
    public Object get(String key) {
        return redisTemplate.opsForValue().get(key);
    }
    
    /**
     * 删除缓存
     */
    public Boolean delete(String key) {
        return redisTemplate.delete(key);
    }
    
    /**
     * 判断key是否存在
     */
    public Boolean hasKey(String key) {
        return redisTemplate.hasKey(key);
    }
}
```

---

## 开发规范

### 代码规范

1. **类命名**：使用大驼峰命名法（PascalCase）
2. **方法命名**：使用小驼峰命名法（camelCase）
3. **常量命名**：使用全大写下划线分隔（UPPER_CASE）
4. **包命名**：使用小写字母，多个单词用点分隔

### 注释规范

```java
/**
 * 类功能说明
 * 
 * @author 作者名
 * @since 版本号
 */
public class UserService {
    
    /**
     * 方法功能说明
     * 
     * @param userId 用户ID
     * @return 用户信息
     */
    public User getUserById(Long userId) {
        // 实现逻辑
    }
}
```

---

**最后更新时间**: 2026-01-09
