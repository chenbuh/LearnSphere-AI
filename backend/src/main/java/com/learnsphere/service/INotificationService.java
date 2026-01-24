package com.learnsphere.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.learnsphere.entity.Notification;

import java.util.List;

public interface INotificationService extends IService<Notification> {

    /**
     * 发送通知（群发）
     */
    void sendNotification(Notification notification);

    /**
     * 获取用户的通知列表
     */
    Page<Notification> getUserNotifications(Long userId, int page, int size);

    /**
     * 标记通知为已读
     */
    void markAsRead(Long userId, Long notificationId);

    /**
     * 获取用户未读通知数量
     */
    Long getUnreadCount(Long userId);

    /**
     * 批量删除通知
     */
    void batchDelete(List<Long> ids);
}
