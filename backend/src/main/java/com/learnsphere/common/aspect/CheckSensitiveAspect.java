package com.learnsphere.common.aspect;

import cn.hutool.core.util.ReflectUtil;
import cn.hutool.core.util.StrUtil;
import com.learnsphere.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.List;

/**
 * 敏感词校验切面
 * 模拟 AI 过滤敏感内容
 */
@Slf4j
@Aspect
@Component
public class CheckSensitiveAspect {

    private final com.learnsphere.mapper.SensitiveLogMapper sensitiveLogMapper;
    private final com.learnsphere.mapper.UserMapper userMapper;

    public CheckSensitiveAspect(com.learnsphere.mapper.SensitiveLogMapper sensitiveLogMapper,
            com.learnsphere.mapper.UserMapper userMapper) {
        this.sensitiveLogMapper = sensitiveLogMapper;
        this.userMapper = userMapper;
    }

    // 模拟敏感词库
    private static final List<String> SENSITIVE_WORDS = Arrays.asList(
            "暴力", "恐怖", "违禁", "非法", "政治", "色情");

    @Before("@annotation(checkSensitive)")
    public void doBefore(JoinPoint point, com.learnsphere.common.annotation.CheckSensitive checkSensitive) {
        Object[] args = point.getArgs();
        String[] fields = checkSensitive.fields();
        String action = point.getSignature().getDeclaringType().getSimpleName() + "." + point.getSignature().getName();

        for (Object arg : args) {
            if (arg == null)
                continue;

            if (arg instanceof String) {
                checkAndLog((String) arg, checkSensitive.message(), action);
            } else {
                if (fields.length == 0) {
                    Field[] allFields = ReflectUtil.getFields(arg.getClass());
                    for (Field f : allFields) {
                        if (f.getType().equals(String.class)) {
                            Object val = ReflectUtil.getFieldValue(arg, f);
                            if (val != null)
                                checkAndLog((String) val, checkSensitive.message(), action);
                        }
                    }
                } else {
                    for (String fieldName : fields) {
                        Object val = ReflectUtil.getFieldValue(arg, fieldName);
                        if (val != null && val instanceof String) {
                            checkAndLog((String) val, checkSensitive.message(), action);
                        }
                    }
                }
            }
        }
    }

    private void checkAndLog(String content, String errorMsg, String action) {
        if (StrUtil.isBlank(content))
            return;

        for (String word : SENSITIVE_WORDS) {
            if (content.contains(word)) {
                log.warn("Detected sensitive content: {} in action: {}", word, action);

                // 记录日志
                try {
                    com.learnsphere.entity.SensitiveLog sensitiveLog = new com.learnsphere.entity.SensitiveLog();
                    if (cn.dev33.satoken.stp.StpUtil.isLogin()) {
                        Long userId = cn.dev33.satoken.stp.StpUtil.getLoginIdAsLong();
                        sensitiveLog.setUserId(userId);
                        com.learnsphere.entity.User user = userMapper.selectById(userId);
                        if (user != null)
                            sensitiveLog.setUsername(user.getUsername());
                    }
                    sensitiveLog.setContent(content.length() > 500 ? content.substring(0, 500) + "..." : content);
                    sensitiveLog.setMatchedWord(word);
                    sensitiveLog.setAction(action);
                    sensitiveLog.setCreateTime(java.time.LocalDateTime.now());
                    sensitiveLog.setMatchedWord(word);
                    sensitiveLogMapper.insert(sensitiveLog);
                } catch (Exception e) {
                    log.error("Failed to save sensitive log", e);
                }

                throw new BusinessException(403, errorMsg);
            }
        }
    }
}
