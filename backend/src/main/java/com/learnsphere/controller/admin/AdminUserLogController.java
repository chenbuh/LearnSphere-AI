package com.learnsphere.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.entity.UserLog;
import com.learnsphere.service.IUserLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 管理员 - 用户日志管理控制器
 */
@RestController
@RequestMapping("/api/admin/user-logs")
@RequiredArgsConstructor
public class AdminUserLogController {

    private final IUserLogService userLogService;

    /**
     * 分页查询用户日志
     */
    @GetMapping("/list")
    public Result<Page<UserLog>> getUserLogs(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String ip,
            @RequestParam(required = false) Integer status) {

        Page<UserLog> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<UserLog> wrapper = new LambdaQueryWrapper<>();

        // 用户名筛选
        if (username != null && !username.isEmpty()) {
            wrapper.like(UserLog::getUsername, username);
        }

        // 模块筛选
        if (module != null && !module.isEmpty()) {
            wrapper.eq(UserLog::getModule, module);
        }

        // 操作类型筛选
        if (action != null && !action.isEmpty()) {
            wrapper.eq(UserLog::getAction, action);
        }

        // IP筛选
        if (ip != null && !ip.isEmpty()) {
            wrapper.like(UserLog::getIp, ip);
        }

        // 状态筛选
        if (status != null) {
            wrapper.eq(UserLog::getStatus, status);
        }

        wrapper.orderByDesc(UserLog::getCreateTime);

        return Result.success(userLogService.page(pageParam, wrapper));
    }

    /**
     * 获取日志统计信息
     */
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getStatistics() {
        return Result.success(userLogService.getStatistics());
    }

    /**
     * 获取操作类型统计
     */
    @GetMapping("/stats/actions")
    public Result<?> getActionStats() {
        return Result.success(userLogService.getActionStats());
    }

    /**
     * 获取模块使用统计
     */
    @GetMapping("/stats/modules")
    public Result<?> getModuleStats() {
        return Result.success(userLogService.getModuleStats());
    }

    /**
     * 获取地区分布统计
     */
    @GetMapping("/stats/provinces")
    public Result<?> getProvinceStats() {
        return Result.success(userLogService.getProvinceStats());
    }

    /**
     * 获取设备类型统计
     */
    @GetMapping("/stats/devices")
    public Result<?> getDeviceStats() {
        return Result.success(userLogService.getDeviceStats());
    }

    /**
     * 根据ID获取日志详情
     */
    @GetMapping("/{id}")
    public Result<UserLog> getLogById(@PathVariable Long id) {
        return Result.success(userLogService.getById(id));
    }

    /**
     * 批量删除日志
     */
    @DeleteMapping("/batch")
    public Result<?> batchDelete(@RequestBody Map<String, Object> params) {
        @SuppressWarnings("unchecked")
        java.util.List<Long> ids = (java.util.List<Long>) params.get("ids");
        userLogService.removeByIds(ids);
        return Result.success("删除成功");
    }

    /**
     * 清空所有日志（谨慎操作）
     */
    @DeleteMapping("/clear")
    public Result<?> clearAll() {
        userLogService.remove(new LambdaQueryWrapper<>());
        return Result.success("清空成功");
    }
}
