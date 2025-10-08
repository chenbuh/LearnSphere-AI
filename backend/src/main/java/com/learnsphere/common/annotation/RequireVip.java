package com.learnsphere.common.annotation;

import java.lang.annotation.*;

/**
 * VIP 权限校验注解
 * 标记在需要 VIP 才能访问的方法上
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequireVip {

    /**
     * 是否检查每日配额
     */
    boolean checkQuota() default true;

    /**
     * 所需的最低 VIP 等级
     * 0-普通用户，1-月度会员，2-季度会员，3-年度会员
     */
    int minLevel() default 1;

    /**
     * 消耗的配额数量
     */
    int quotaCost() default 1;

    /**
     * 功能描述（用于错误提示）
     */
    String feature() default "AI 生成";
}
