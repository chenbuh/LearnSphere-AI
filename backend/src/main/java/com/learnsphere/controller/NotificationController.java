package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
import com.learnsphere.common.annotation.UserOperation;
import com.learnsphere.entity.Notification;
import com.learnsphere.service.INotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private INotificationService notificationService;

    /**
     * 获取用户的知列表
     */
    @GetMapping
    @UserOperation(module = "notification", action = "view", description = "查看通知列表", detailKeys = { "page", "size" })
    public Result<Page<Notification>> getUserNotifications(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer readStatus) {
        Long userId = StpUtil.getLoginIdAsLong();
        Page<Notification> notifications = notificationService.getUserNotifications(userId, page, size, type, readStatus);
        return Result.success(notifications);
    }

    /**
     * 获取通知数量
     */
    @GetMapping("/unread-count")
    @UserOperation(module = "notification", action = "view_unread", description = "查看未读通知数")
    public Result<Long> getUnreadCount() {
        Long userId = StpUtil.getLoginIdAsLong();
        Long count = notificationService.getUnreadCount(userId);
        return Result.success(count);
    }

    /**
     * 标记通知为已读
     */
    @PutMapping("/{id}/read")
    @UserOperation(module = "notification", action = "mark_read", description = "标记通知已读", detailKeys = { "id" })
    public Result<String> markAsRead(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        notificationService.markAsRead(userId, id);
        return Result.success("标记成功");
    }

    /**
     * 标记全部通知为已读
     */
    @PutMapping("/read-all")
    @UserOperation(module = "notification", action = "mark_read_all", description = "标记全部通知已读")
    public Result<Integer> markAllAsRead() {
        Long userId = StpUtil.getLoginIdAsLong();
        int affected = notificationService.markAllAsRead(userId);
        return Result.success(affected);
    }
}
