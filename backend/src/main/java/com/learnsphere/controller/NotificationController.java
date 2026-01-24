package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.learnsphere.common.Result;
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
     * 获取用户的通知列表
     */
    @GetMapping
    public Result<Page<Notification>> getUserNotifications(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = StpUtil.getLoginIdAsLong();
        Page<Notification> notifications = notificationService.getUserNotifications(userId, page, size);
        return Result.success(notifications);
    }

    /**
     * 获取未读通知数量
     */
    @GetMapping("/unread-count")
    public Result<Long> getUnreadCount() {
        Long userId = StpUtil.getLoginIdAsLong();
        Long count = notificationService.getUnreadCount(userId);
        return Result.success(count);
    }

    /**
     * 标记通知为已读
     */
    @PutMapping("/{id}/read")
    public Result<String> markAsRead(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        notificationService.markAsRead(userId, id);
        return Result.success("标记成功");
    }
}
