package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.entity.Notification;
import com.learnsphere.entity.User;
import com.learnsphere.entity.UserNotification;
import com.learnsphere.mapper.NotificationMapper;
import com.learnsphere.mapper.UserMapper;
import com.learnsphere.mapper.UserNotificationMapper;
import com.learnsphere.service.INotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl extends ServiceImpl<NotificationMapper, Notification>
        implements INotificationService {

    @Autowired
    private UserNotificationMapper userNotificationMapper;

    @Autowired
    private UserMapper userMapper;

    @Override
    @Transactional
    public void sendNotification(Notification notification) {
        // 保存通知
        notification.setCreateTime(LocalDateTime.now());
        notification.setIsPublished(1);
        save(notification);

        // 获取目标用户列表
        List<Long> targetUserIds = getTargetUserIds(notification);

        // 为每个目标用户创建通知记录
        List<UserNotification> userNotifications = targetUserIds.stream()
                .map(userId -> {
                    UserNotification un = new UserNotification();
                    un.setUserId(userId);
                    un.setNotificationId(notification.getId());
                    un.setIsRead(0);
                    un.setCreateTime(LocalDateTime.now());
                    return un;
                })
                .collect(Collectors.toList());

        // 批量插入
        if (!userNotifications.isEmpty()) {
            userNotifications.forEach(userNotificationMapper::insert);
        }
    }

    private List<Long> getTargetUserIds(Notification notification) {
        String targetType = notification.getTargetType();

        if ("all".equals(targetType)) {
            // 所有用户
            return userMapper.selectList(new LambdaQueryWrapper<User>()
                    .eq(User::getStatus, 1))
                    .stream()
                    .map(User::getId)
                    .collect(Collectors.toList());
        } else if ("vip".equals(targetType)) {
            // VIP用户: 过期时间在当前时间之后
            return userMapper.selectList(new LambdaQueryWrapper<User>()
                    .eq(User::getStatus, 1)
                    .gt(User::getVipExpireTime, LocalDateTime.now()))
                    .stream()
                    .map(User::getId)
                    .collect(Collectors.toList());
        } else if ("specific".equals(targetType)) {
            // 指定用户
            String targetUserIdsStr = notification.getTargetUserIds();
            if (targetUserIdsStr != null && !targetUserIdsStr.trim().isEmpty()) {
                return Arrays.stream(targetUserIdsStr.split(","))
                        .map(String::trim)
                        .map(Long::parseLong)
                        .collect(Collectors.toList());
            }
        }

        return new ArrayList<>();
    }

    @Override
    public Page<Notification> getUserNotifications(Long userId, int page, int size) {
        // 查询用户的通知ID列表
        List<Long> notificationIds = userNotificationMapper.selectList(
                new LambdaQueryWrapper<UserNotification>()
                        .eq(UserNotification::getUserId, userId))
                .stream().map(UserNotification::getNotificationId).collect(Collectors.toList());

        if (notificationIds.isEmpty()) {
            return new Page<>(page, size);
        }

        // 查询通知详情
        Page<Notification> pageRequest = new Page<>(page, size);
        return page(pageRequest, new LambdaQueryWrapper<Notification>()
                .in(Notification::getId, notificationIds)
                .eq(Notification::getIsPublished, 1)
                .and(wrapper -> wrapper
                        .isNull(Notification::getExpireTime)
                        .or()
                        .gt(Notification::getExpireTime, LocalDateTime.now()))
                .orderByDesc(Notification::getCreateTime));
    }

    @Override
    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        UserNotification userNotification = userNotificationMapper.selectOne(
                new LambdaQueryWrapper<UserNotification>()
                        .eq(UserNotification::getUserId, userId)
                        .eq(UserNotification::getNotificationId, notificationId));

        if (userNotification != null && userNotification.getIsRead() == 0) {
            userNotification.setIsRead(1);
            userNotification.setReadTime(LocalDateTime.now());
            userNotificationMapper.updateById(userNotification);
        }
    }

    @Override
    public Long getUnreadCount(Long userId) {
        return userNotificationMapper.selectCount(
                new LambdaQueryWrapper<UserNotification>()
                        .eq(UserNotification::getUserId, userId)
                        .eq(UserNotification::getIsRead, 0));
    }

    @Override
    @Transactional
    public void batchDelete(List<Long> ids) {
        // 删除通知
        removeByIds(ids);

        // 删除关联的用户通知记录
        userNotificationMapper.delete(
                new LambdaQueryWrapper<UserNotification>()
                        .in(UserNotification::getNotificationId, ids));
    }
}
