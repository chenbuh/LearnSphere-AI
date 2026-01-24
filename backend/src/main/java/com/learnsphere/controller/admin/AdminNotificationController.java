package com.learnsphere.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.AdminOperation;
import com.learnsphere.entity.Notification;
import com.learnsphere.service.INotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/notifications")
public class AdminNotificationController {

    @Autowired
    private INotificationService notificationService;

    /**
     * 获取通知列表
     */
    @GetMapping
    public Result<Page<Notification>> getNotificationList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String type) {
        Page<Notification> pageRequest = new Page<>(page, size);
        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();

        if (type != null && !type.isEmpty()) {
            wrapper.eq(Notification::getType, type);
        }

        wrapper.orderByDesc(Notification::getCreateTime);

        Page<Notification> result = notificationService.page(pageRequest, wrapper);
        return Result.success(result);
    }

    /**
     * 创建并发送通知
     */
    @PostMapping
    @AdminOperation(module = "通知管理", action = "发送系统通知")
    public Result<String> sendNotification(@RequestBody Notification notification) {
        notificationService.sendNotification(notification);
        return Result.success("通知发送成功");
    }

    /**
     * 获取通知详情
     */
    @GetMapping("/{id}")
    public Result<Notification> getNotification(@PathVariable Long id) {
        Notification notification = notificationService.getById(id);
        return Result.success(notification);
    }

    /**
     * 删除通知
     */
    @DeleteMapping("/{id}")
    @AdminOperation(module = "通知管理", action = "删除系统通知")
    public Result<String> deleteNotification(@PathVariable Long id) {
        notificationService.removeById(id);
        return Result.success("删除成功");
    }

    /**
     * 批量删除通知
     */
    @PostMapping("/batch-delete")
    @AdminOperation(module = "通知管理", action = "批量删除系统通知")
    public Result<String> batchDelete(@RequestBody List<Long> ids) {
        notificationService.batchDelete(ids);
        return Result.success("批量删除成功");
    }
}
