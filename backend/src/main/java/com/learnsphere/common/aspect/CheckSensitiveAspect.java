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
    private final org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    public CheckSensitiveAspect(com.learnsphere.mapper.SensitiveLogMapper sensitiveLogMapper,
            com.learnsphere.mapper.UserMapper userMapper,
            org.springframework.data.redis.core.StringRedisTemplate redisTemplate) {
        this.sensitiveLogMapper = sensitiveLogMapper;
        this.userMapper = userMapper;
        this.redisTemplate = redisTemplate;
    }

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

        String matchedWord = com.learnsphere.utils.SensitiveWordUtil.getFirstMatchedWord(content, 1);
        if (matchedWord != null) {
            log.warn("Detected sensitive content: {} in action: {}", matchedWord, action);

            Long userId = null;
            if (cn.dev33.satoken.stp.StpUtil.isLogin()) {
                userId = cn.dev33.satoken.stp.StpUtil.getLoginIdAsLong();
            }

            // 智能风险分析：统计违规频次
            if (userId != null) {
                String key = "security:violation:" + userId;
                Long violations = redisTemplate.opsForValue().increment(key);
                java.time.Duration timeout = java.time.Duration.ofDays(1);
                redisTemplate.expire(key, timeout);

                if (violations != null && violations >= 10) {
                    log.error("用户 {} 违规次数过多 ({})，自动锁定部分功能", userId, violations);

                    com.learnsphere.entity.User user = userMapper.selectById(userId);
                    if (user != null && user.getMfaEnabled() != null && user.getMfaEnabled() == 1) {
                        throw new com.learnsphere.exception.BusinessException(403,
                                "账户安全等级受限，请前往 [安全中心] 使用 MFA 验证码自助解除限制");
                    }
                    throw new com.learnsphere.exception.BusinessException(403, "账户安全等级受限，请联系管理员解锁");
                }
            }

            // 记录日志
            try {
                com.learnsphere.entity.SensitiveLog sensitiveLog = new com.learnsphere.entity.SensitiveLog();
                if (userId != null) {
                    sensitiveLog.setUserId(userId);
                    com.learnsphere.entity.User user = userMapper.selectById(userId);
                    if (user != null)
                        sensitiveLog.setUsername(user.getUsername());
                }
                // 使用智能脱敏记录
                sensitiveLog.setContent(com.learnsphere.utils.DataMaskUtil.maskSensitiveInfo(
                        content.length() > 500 ? content.substring(0, 500) + "..." : content));
                sensitiveLog.setMatchedWord(matchedWord);
                sensitiveLog.setAction(action);
                sensitiveLog.setCreateTime(java.time.LocalDateTime.now());
                sensitiveLogMapper.insert(sensitiveLog);
            } catch (Exception e) {
                log.error("Failed to save sensitive log", e);
            }

            throw new BusinessException(403, errorMsg);
        }
    }
}
