package com.learnsphere.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.learnsphere.entity.UserLog;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.Map;

/**
 * 用户日志服务接口
 */
public interface IUserLogService extends IService<UserLog> {

    /**
     * 记录用户操作日志
     *
     * @param userId   用户ID
     * @param username 用户名
     * @param module   操作模块
     * @param action   操作类型
     * @param details  操作详情
     * @param request  HTTP请求对象（用于获取IP等信息）
     * @param status   操作状态 (0:失败, 1:成功)
     */
    void log(Long userId, String username, String module, String action, String details, HttpServletRequest request,
            Integer status);

    /**
     * 记录用户操作日志（成功状态）
     */
    void logSuccess(Long userId, String username, String module, String action, String details,
            HttpServletRequest request);

    /**
     * 记录用户操作日志（失败状态）
     */
    void logFail(Long userId, String username, String module, String action, String details, String errorMsg,
            HttpServletRequest request);

    /**
     * 获取操作统计
     */
    Map<String, Object> getStatistics();

    /**
     * 获取操作类型分布
     */
    List<Map<String, Object>> getActionStats();

    /**
     * 获取模块使用分布
     */
    List<Map<String, Object>> getModuleStats();

    /**
     * 获取地区分布
     */
    List<Map<String, Object>> getProvinceStats();

    /**
     * 获取设备类型分布
     */
    List<Map<String, Object>> getDeviceStats();
}
