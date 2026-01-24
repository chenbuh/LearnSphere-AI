package com.learnsphere.common.annotation;

import java.lang.annotation.*;

/**
 * 敏感词校验注解
 * 标记在需要过滤敏感内容的方法上，支持指定校验的字段
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CheckSensitive {
    /**
     * 需要校验的参数名（如："content", "nickname"）
     * 如果为空，则尝试校验所有 String 类型的字段
     */
    String[] fields() default {};

    /**
     * 校验失败后的提示语
     */
    String message() default "核心价值观：内容包含敏感词，请合规发布";
}
