package com.learnsphere.exception;

/**
 * 配额耗尽异常
 * 用于触发降级策略
 */
public class QuotaExceededException extends RuntimeException {
    public QuotaExceededException(String message) {
        super(message);
    }
}
