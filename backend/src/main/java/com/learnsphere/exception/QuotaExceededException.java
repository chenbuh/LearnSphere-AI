package com.learnsphere.exception;

/**
 * 配耗尽异常
 * 用于触发降级策略
 */
public class QuotaExceededException extends RuntimeException {
    public QuotaExceededException(String message) {
        super(message);
    }
}
