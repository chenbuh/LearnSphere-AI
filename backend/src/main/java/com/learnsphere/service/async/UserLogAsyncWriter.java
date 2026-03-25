package com.learnsphere.service.async;

import com.learnsphere.entity.UserLog;
import com.learnsphere.mapper.UserLogMapper;
import com.learnsphere.utils.IpUtils;
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
            hydrateLocation(userLog);
            userLogMapper.insert(userLog);
        } catch (Exception e) {
            log.error("Failed to persist user log asynchronously. userId={}, module={}, action={}",
                    userLog.getUserId(), userLog.getModule(), userLog.getAction(), e);
        }
    }

    private void hydrateLocation(UserLog userLog) {
        if (userLog == null || userLog.getIp() == null || userLog.getIp().isBlank()) {
            return;
        }

        IpUtils.IpLocation location = IpUtils.getIpLocation(userLog.getIp());
        userLog.setIpCountry(location.getCountry());
        userLog.setIpProvince(location.getProvince());
        userLog.setIpCity(location.getCity());
    }
}
