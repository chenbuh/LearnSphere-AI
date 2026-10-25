package com.learnsphere.exception;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.exception.NotPermissionException;
import com.learnsphere.common.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * 全局异常处理
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public Result<?> handleBusinessException(BusinessException e) {
        log.error("业务异常: {}", e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }

    /**
     * 未登录异常
     */
    @ExceptionHandler(NotLoginException.class)
    public Result<?> handleNotLoginException(NotLoginException e) {
        log.error("未登录异常: {}", e.getMessage());
        return Result.error(401, "登录已过期或未登录，请重新登录");
    }

    /**
     * AI 配额耗尽异常
     */
    @ExceptionHandler(QuotaExceededException.class)
    public Result<?> handleQuotaExceededException(QuotaExceededException e) {
        log.warn("AI 配额耗尽: {}", e.getMessage());
        return Result.error(429, "今日 AI 使用配额已达上限，请明天再试或升级 VIP 以获取更多额度。");
    }

    /**
     * 权限异常
     */
    @ExceptionHandler(NotPermissionException.class)
    public Result<?> handleNotPermissionException(NotPermissionException e) {
        log.error("权限异常: {}", e.getMessage());
        return Result.error(403, "没有权限访问");
    }

    /**
     * 角色异常（例如普通用户访问后台接口）
     */
    @ExceptionHandler(cn.dev33.satoken.exception.NotRoleException.class)
    public Result<?> handleNotRoleException(cn.dev33.satoken.exception.NotRoleException e) {
        log.warn("角色校验失败: {}", e.getMessage());
        return Result.error(403, "没有权限访问");
    }

    /**
     * 静态资源 / 路径不存在。
     *
     * Spring 6 对未匹配的静态资源会抛 NoResourceFoundException。若它落到下面的
     * 通用 Exception 处理器，客户端会收到 HTTP 200 + code=500「系统异常」——
     * 既不语义化（浏览器和 CDN 无法按 404 处理缓存），又会把正常的资源缺失
     * 记成 error 级日志，淹没真正的故障。
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Result<?>> handleNoResourceFound(NoResourceFoundException e) {
        log.debug("资源不存在: {}", e.getResourcePath());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Result.error(404, "资源不存在"));
    }

    /**
     * 请求方法不支持。
     *
     * 例如用 GET 访问只接受 POST 的 {@code /api/ai/generate/reading}。
     * 若不单独处理，它会落到下面的通用 Exception 处理器，客户端收到
     * HTTP 200 + code=500「系统异常」——有两个问题：
     *
     * 1. 语义错误：调用方以为服务端出故障，实际是自己用错了方法，
     *    排查方向被带偏；
     * 2. 日志噪音：每次探测/写错方法都往日志写一条完整堆栈，
     *    真正的系统故障反而被淹没。
     *
     * 这里返回 405 并带上 Allow 头，调用方据此就能自我纠正。
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Result<?>> handleMethodNotSupported(HttpRequestMethodNotSupportedException e) {
        log.debug("请求方法不支持: {} 支持的方法={}", e.getMethod(), e.getSupportedHttpMethods());
        String supported = e.getSupportedHttpMethods() == null ? ""
                : e.getSupportedHttpMethods().stream()
                        .map(Object::toString)
                        .sorted()
                        .collect(java.util.stream.Collectors.joining(", "));
        ResponseEntity.BodyBuilder builder = ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED);
        if (!supported.isEmpty()) {
            builder.header(HttpHeaders.ALLOW, supported);
        }
        return builder.body(Result.error(405,
                supported.isEmpty() ? "请求方法不支持" : "请求方法不支持，可用方法：" + supported));
    }

    /**
     * 其他异常
     */
    @ExceptionHandler(Exception.class)
    public Result<?> handleException(Exception e) {
        log.error("系统异常: ", e);
        return Result.error("系统异常，请联系管理员");
    }
}
