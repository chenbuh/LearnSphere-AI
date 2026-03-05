package com.learnsphere.service.async;

import com.learnsphere.entity.UserLog;
import com.learnsphere.mapper.UserLogMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Isolated async writer for user operation logs.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserLogAsyncWriter {

    private final UserLogMapper userLogMapper;

    @Async("userLogExecutor")
    public void save(UserLog userLog) {
        try {
            userLogMapper.insert(userLog);
        } catch (Exception e) {
            log.error("Failed to persist user log asynchronously. userId={}, module={}, action={}",
                    userLog.getUserId(), userLog.getModule(), userLog.getAction(), e);
        }
    }
}
