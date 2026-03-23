package com.learnsphere.aspect;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.UserOperation;
import com.learnsphere.entity.User;
import com.learnsphere.service.IUserLogService;
import com.learnsphere.service.IUserService;
import com.learnsphere.utils.ExamTypeAliasUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * 统一记录前台用户操作日志，避免各控制器手写分散的日志逻辑。
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class UserOperationLogAspect {

    private static final Map<String, String> DETAIL_LABELS = Map.ofEntries(
            Map.entry("examType", "考试类型"),
            Map.entry("difficulty", "难度"),
            Map.entry("keyword", "关键词"),
            Map.entry("topic", "主题"),
            Map.entry("type", "类型"),
            Map.entry("mode", "模式"),
            Map.entry("count", "数量"),
            Map.entry("word", "单词"),
            Map.entry("contentType", "内容类型"),
            Map.entry("isCorrect", "结果"),
            Map.entry("targetScore", "目标分"),
            Map.entry("durationDays", "计划天数"),
            Map.entry("timeSpent", "耗时"),
            Map.entry("examId", "试卷ID"),
            Map.entry("id", "记录ID"),
            Map.entry("sessionId", "会话ID"),
            Map.entry("completedCount", "完成数量"),
            Map.entry("category", "分类"),
            Map.entry("module", "模块"),
            Map.entry("limit", "数量"),
            Map.entry("page", "页码"),
            Map.entry("needsReview", "待复习"),
            Map.entry("size", "数量"),
            Map.entry("vocabularyId", "词汇ID"),
            Map.entry("favorite", "收藏"),
            Map.entry("notes", "笔记"),
            Map.entry("vipLevel", "VIP等级"),
            Map.entry("amount", "金额"));

    private final IUserLogService userLogService;
    private final IUserService userService;

    @Around("@annotation(userOperation)")
    public Object logUserOperation(ProceedingJoinPoint joinPoint, UserOperation userOperation) throws Throwable {
        HttpServletRequest request = resolveRequest(joinPoint.getArgs());
        Long userId = resolveUserId();
        if (!shouldLog(userOperation, userId, request)) {
            return joinPoint.proceed();
        }

        String username = resolveUsername(userId);
        String details = buildDetails(joinPoint, userOperation);

        try {
            Object result = joinPoint.proceed();
            if (isSuccess(result)) {
                userLogService.logSuccess(userId, username, userOperation.module(), userOperation.action(), details, request);
            } else {
                userLogService.logFail(userId, username, userOperation.module(), userOperation.action(), details,
                        extractMessage(result), request);
            }
            return result;
        } catch (Throwable ex) {
            userLogService.logFail(userId, username, userOperation.module(), userOperation.action(), details,
                    sanitizeValue(ex.getMessage()), request);
            throw ex;
        }
    }

    private boolean shouldLog(UserOperation userOperation, Long userId, HttpServletRequest request) {
        if (request == null) {
            return false;
        }
        return userId != null || userOperation.logWhenAnonymous();
    }

    private Long resolveUserId() {
        try {
            return StpUtil.isLogin() ? StpUtil.getLoginIdAsLong() : null;
        } catch (Exception ex) {
            return null;
        }
    }

    private String resolveUsername(Long userId) {
        if (userId == null) {
            return "Anonymous";
        }
        try {
            User user = userService.getById(userId);
            if (user != null && user.getUsername() != null && !user.getUsername().isBlank()) {
                return user.getUsername();
            }
        } catch (Exception ex) {
            log.warn("解析用户日志用户名失败: {}", ex.getMessage());
        }
        return String.valueOf(userId);
    }

    private HttpServletRequest resolveRequest(Object[] args) {
        for (Object arg : args) {
            if (arg instanceof HttpServletRequest request) {
                return request;
            }
        }

        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes == null ? null : attributes.getRequest();
    }

    private boolean isSuccess(Object result) {
        if (!(result instanceof Result<?> wrapper)) {
            return true;
        }
        return wrapper.getCode() != null && wrapper.getCode() == 200;
    }

    private String extractMessage(Object result) {
        if (result instanceof Result<?> wrapper) {
            return sanitizeValue(wrapper.getMessage());
        }
        return "请求失败";
    }

    private String buildDetails(ProceedingJoinPoint joinPoint, UserOperation userOperation) {
        List<String> parts = new ArrayList<>();
        if (!userOperation.description().isBlank()) {
            parts.add(userOperation.description().trim());
        }

        Map<String, Object> parameterMap = buildParameterMap(joinPoint);
        for (String detailKey : userOperation.detailKeys()) {
            Object resolvedValue = resolveDetailValue(parameterMap, detailKey);
            String formattedValue = formatValue(lastSegment(detailKey), resolvedValue);
            if (formattedValue == null || formattedValue.isBlank()) {
                continue;
            }
            parts.add(formatLabel(detailKey) + ": " + formattedValue);
        }

        if (parts.isEmpty()) {
            parts.add(userOperation.action());
        }

        return String.join(" | ", parts);
    }

    private Map<String, Object> buildParameterMap(ProceedingJoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] parameterNames = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();
        Map<String, Object> parameters = new LinkedHashMap<>();

        if (parameterNames == null) {
            return parameters;
        }

        for (int index = 0; index < parameterNames.length && index < args.length; index++) {
            parameters.put(parameterNames[index], args[index]);
        }
        return parameters;
    }

    private Object resolveDetailValue(Map<String, Object> parameterMap, String expression) {
        if (expression == null || expression.isBlank()) {
            return null;
        }

        String[] segments = expression.split("\\.");
        Object current = parameterMap.get(segments[0]);
        for (int index = 1; index < segments.length; index++) {
            current = readValue(current, segments[index]);
        }
        return current;
    }

    private Object readValue(Object source, String key) {
        if (source == null) {
            return null;
        }
        if (source instanceof Map<?, ?> map) {
            return map.get(key);
        }
        if (source instanceof Collection<?> collection && "size".equals(key)) {
            return collection.size();
        }
        if (source.getClass().isArray() && "size".equals(key)) {
            return java.lang.reflect.Array.getLength(source);
        }

        BeanWrapperImpl beanWrapper = new BeanWrapperImpl(source);
        return beanWrapper.isReadableProperty(key) ? beanWrapper.getPropertyValue(key) : null;
    }

    private String formatLabel(String detailKey) {
        return DETAIL_LABELS.getOrDefault(lastSegment(detailKey), lastSegment(detailKey));
    }

    private String lastSegment(String expression) {
        int lastDot = expression.lastIndexOf('.');
        return lastDot >= 0 ? expression.substring(lastDot + 1) : expression;
    }

    private String formatValue(String key, Object value) {
        if (value == null) {
            return null;
        }

        if ("examType".equals(key)) {
            return ExamTypeAliasUtils.getExamDisplayName(String.valueOf(value));
        }

        if ("isCorrect".equals(key)) {
            if (value instanceof Boolean boolValue) {
                return boolValue ? "正确" : "错误";
            }
            String normalized = String.valueOf(value).trim();
            return ("1".equals(normalized) || "true".equalsIgnoreCase(normalized)) ? "正确" : "错误";
        }

        if (value instanceof Boolean boolValue) {
            return boolValue ? "是" : "否";
        }

        if (value instanceof Collection<?> collection) {
            return collection.size() + " 项";
        }

        if (value.getClass().isArray()) {
            return java.lang.reflect.Array.getLength(value) + " 项";
        }

        return sanitizeValue(String.valueOf(value));
    }

    private String sanitizeValue(String value) {
        if (value == null) {
            return null;
        }

        String sanitized = value.replaceAll("\\s+", " ").trim();
        if (sanitized.isEmpty()) {
            return null;
        }

        if (sanitized.length() > 120) {
            return sanitized.substring(0, 117) + "...";
        }

        return sanitized;
    }
}
