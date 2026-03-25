package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.UserLog;
import com.learnsphere.mapper.UserLogMapper;
import com.learnsphere.service.IUserLogService;
import com.learnsphere.service.async.UserLogAsyncWriter;
import com.learnsphere.utils.IpUtils;
import com.learnsphere.utils.UserAgentUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 用户日志服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserLogServiceImpl extends ServiceImpl<UserLogMapper, UserLog> implements IUserLogService {

    private final UserLogMapper userLogMapper;
    private final UserLogAsyncWriter userLogAsyncWriter;

    @Override
    public void log(Long userId, String username, String module, String action, String details,
            HttpServletRequest request, Integer status) {
        try {
            UserLog userLog = new UserLog();
            userLog.setUserId(userId);
            userLog.setUsername(username);
            userLog.setModule(module);
            userLog.setAction(action);
            userLog.setDetails(details);
            userLog.setStatus(status);

            // 获取IP地址
            String ip = IpUtils.getIpAddress(request);
            userLog.setIp(ip);

            // 获取User-Agent信息
            UserAgentUtils.UserAgentInfo uaInfo = UserAgentUtils.getUserAgentInfo(request);
            userLog.setBrowser(uaInfo.getBrowser());
            userLog.setOs(uaInfo.getOs());
            userLog.setDeviceType(uaInfo.getDeviceType());

            // 获取请求信息
            userLog.setRequestUrl(request.getRequestURI());
            userLog.setRequestMethod(request.getMethod());

            // Save asynchronously via dedicated writer bean, avoid same-class @Async
            // self-invocation.
            userLogAsyncWriter.save(userLog);
        } catch (Exception e) {
            log.error("保存用户日志失败: {}", e.getMessage(), e);
        }
    }

    @Override
    public void logSuccess(Long userId, String username, String module, String action, String details,
            HttpServletRequest request) {
        log(userId, username, module, action, details, request, 1);
    }

    @Override
    public void logFail(Long userId, String username, String module, String action, String details, String errorMsg,
            HttpServletRequest request) {
        try {
            UserLog userLog = new UserLog();
            userLog.setUserId(userId);
            userLog.setUsername(username);
            userLog.setModule(module);
            userLog.setAction(action);
            userLog.setDetails(details);
            userLog.setStatus(0);
            userLog.setErrorMsg(errorMsg);

            // 获取IP地址
            String ip = IpUtils.getIpAddress(request);
            userLog.setIp(ip);

            // 获取User-Agent信息
            UserAgentUtils.UserAgentInfo uaInfo = UserAgentUtils.getUserAgentInfo(request);
            userLog.setBrowser(uaInfo.getBrowser());
            userLog.setOs(uaInfo.getOs());
            userLog.setDeviceType(uaInfo.getDeviceType());

            // 获取请求信息
            userLog.setRequestUrl(request.getRequestURI());
            userLog.setRequestMethod(request.getMethod());

            // Save asynchronously via dedicated writer bean, avoid same-class @Async
            // self-invocation.
            userLogAsyncWriter.save(userLog);
        } catch (Exception e) {
            log.error("保存用户失败日志失败: {}", e.getMessage(), e);
        }
    }

    @Override
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLogs", this.count());
        stats.put("actionStats", getActionStats());
        stats.put("moduleStats", getModuleStats());
        stats.put("provinceStats", getProvinceStats());
        stats.put("deviceStats", getDeviceStats());
        return stats;
    }

    @Override
    public List<Map<String, Object>> getActionStats() {
        return userLogMapper.getActionStats();
    }

    @Override
    public List<Map<String, Object>> getModuleStats() {
        return userLogMapper.getModuleStats();
    }

    @Override
    public List<Map<String, Object>> getProvinceStats() {
        return userLogMapper.getProvinceStats();
    }

    @Override
    public List<Map<String, Object>> getDeviceStats() {
        return userLogMapper.getDeviceStats();
    }

    @Override
    public void hydrateLocation(UserLog userLog) {
        if (userLog == null || userLog.getIp() == null || userLog.getIp().isBlank() || !needsLocationHydration(userLog)) {
            return;
        }

        IpUtils.IpLocation location = IpUtils.getIpLocation(userLog.getIp());
        if (!hasUsefulLocation(location)) {
            return;
        }

        boolean changed = applyLocation(userLog, location);
        if (!changed || userLog.getId() == null) {
            return;
        }

        UserLog updateEntity = new UserLog();
        updateEntity.setId(userLog.getId());
        updateEntity.setIpCountry(userLog.getIpCountry());
        updateEntity.setIpProvince(userLog.getIpProvince());
        updateEntity.setIpCity(userLog.getIpCity());
        this.updateById(updateEntity);
    }

    @Override
    public void hydrateLocations(List<UserLog> userLogs) {
        if (userLogs == null || userLogs.isEmpty()) {
            return;
        }

        userLogs.parallelStream().forEach(this::hydrateLocation);
    }

    private boolean needsLocationHydration(UserLog userLog) {
        return isBlankOrUnknown(userLog.getIpCountry())
                || isBlankOrUnknown(userLog.getIpProvince())
                || isBlankOrUnknown(userLog.getIpCity());
    }

    private boolean hasUsefulLocation(IpUtils.IpLocation location) {
        return !isBlankOrUnknown(location.getCountry())
                || !isBlankOrUnknown(location.getProvince())
                || !isBlankOrUnknown(location.getCity());
    }

    private boolean applyLocation(UserLog userLog, IpUtils.IpLocation location) {
        boolean changed = false;

        if (!equalsNullable(userLog.getIpCountry(), location.getCountry())) {
            userLog.setIpCountry(location.getCountry());
            changed = true;
        }
        if (!equalsNullable(userLog.getIpProvince(), location.getProvince())) {
            userLog.setIpProvince(location.getProvince());
            changed = true;
        }
        if (!equalsNullable(userLog.getIpCity(), location.getCity())) {
            userLog.setIpCity(location.getCity());
            changed = true;
        }

        return changed;
    }

    private boolean equalsNullable(String left, String right) {
        return (left == null && right == null) || (left != null && left.equals(right));
    }

    private boolean isBlankOrUnknown(String value) {
        return value == null || value.isBlank() || "未知".equals(value);
    }
}
