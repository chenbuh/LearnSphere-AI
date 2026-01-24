package com.learnsphere.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.entity.AdminLog;
import com.learnsphere.service.IAdminLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/logs")
@RequiredArgsConstructor
public class AdminLogController {

    private final IAdminLogService adminLogService;

    @GetMapping("/operation")
    public Result<Page<AdminLog>> getOperationLogs(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword) {

        Page<AdminLog> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<AdminLog> wrapper = new LambdaQueryWrapper<>();

        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(AdminLog::getAdminUsername, keyword)
                    .or()
                    .like(AdminLog::getModule, keyword)
                    .or()
                    .like(AdminLog::getAction, keyword);
        }

        wrapper.orderByDesc(AdminLog::getCreateTime);

        return Result.success(adminLogService.page(pageParam, wrapper));
    }
}
