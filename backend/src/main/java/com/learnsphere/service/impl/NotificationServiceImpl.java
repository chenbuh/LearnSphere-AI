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
import com.learnsphere.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl extends ServiceImpl<NotificationMapper, Notification>
        implements INotificationService, NotificationService {

    @Autowired
    private UserNotificationMapper userNotificationMapper;

    @Autowired
    private UserMapper userMapper;

    @Override
    @Transactional
    public void sendNotification(Notification notification) {
        notification.setCreateTime(LocalDateTime.now());
        notification.setIsPublished(1);
        save(notification);

        List<Long> targetUserIds = getTargetUserIds(notification);
        List<UserNotification> userNotifications = targetUserIds.stream()
                .map(userId -> {
                    UserNotification userNotification = new UserNotification();
                    userNotification.setUserId(userId);
                    userNotification.setNotificationId(notification.getId());
                    userNotification.setIsRead(0);
                    userNotification.setCreateTime(LocalDateTime.now());
                    return userNotification;
                })
                .collect(Collectors.toList());

        if (!userNotifications.isEmpty()) {
            userNotifications.forEach(userNotificationMapper::insert);
        }
    }

    private List<Long> getTargetUserIds(Notification notification) {
        String targetType = notification.getTargetType();

        if ("all".equals(targetType) || "all_future".equals(targetType)) {
            return userMapper.selectList(new LambdaQueryWrapper<User>()
                            .eq(User::getStatus, 1))
                    .stream()
                    .map(User::getId)
                    .collect(Collectors.toList());
        }

        if ("vip".equals(targetType) || "vip_future".equals(targetType)) {
            return userMapper.selectList(new LambdaQueryWrapper<User>()
                            .eq(User::getStatus, 1)
                            .gt(User::getVipExpireTime, LocalDateTime.now()))
                    .stream()
                    .map(User::getId)
                    .collect(Collectors.toList());
        }

        if ("specific".equals(targetType)) {
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
    public Page<Notification> getUserNotifications(Long userId, int page, int size, String type, Integer readStatus) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.max(size, 1);
        String normalizedType = normalizeType(type);
        Integer normalizedReadStatus = normalizeReadStatus(readStatus);

        List<Notification> visibleNotifications = list(buildVisibleNotificationWrapper(userId, normalizedType));
        annotateReadState(userId, visibleNotifications);

        List<Notification> filteredNotifications = filterByReadStatus(visibleNotifications, normalizedReadStatus);
        long total = filteredNotifications.size();

        Page<Notification> result = new Page<>(safePage, safeSize, total);
        if (filteredNotifications.isEmpty()) {
            result.setRecords(new ArrayList<>());
            return result;
        }

        int fromIndex = (safePage - 1) * safeSize;
        if (fromIndex >= filteredNotifications.size()) {
            result.setRecords(new ArrayList<>());
            return result;
        }

        int toIndex = Math.min(fromIndex + safeSize, filteredNotifications.size());
        result.setRecords(new ArrayList<>(filteredNotifications.subList(fromIndex, toIndex)));
        return result;
    }

    @Override
    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        UserNotification userNotification = userNotificationMapper.selectOne(
                new LambdaQueryWrapper<UserNotification>()
                        .eq(UserNotification::getUserId, userId)
                        .eq(UserNotification::getNotificationId, notificationId));

        if (userNotification != null) {
            Integer isRead = userNotification.getIsRead();
            if (isRead == null || isRead == 0) {
                userNotification.setIsRead(1);
                userNotification.setReadTime(LocalDateTime.now());
                userNotificationMapper.updateById(userNotification);
            }
            return;
        }

        if (isNotificationVisibleToUser(userId, notificationId)) {
            UserNotification readRecord = new UserNotification();
            readRecord.setUserId(userId);
            readRecord.setNotificationId(notificationId);
            readRecord.setIsRead(1);
            readRecord.setReadTime(LocalDateTime.now());
            readRecord.setCreateTime(LocalDateTime.now());
            userNotificationMapper.insert(readRecord);
        }
    }

    @Override
    @Transactional
    public int markAllAsRead(Long userId) {
        List<Long> visibleNotificationIds = listVisibleNotificationIds(userId);
        if (visibleNotificationIds.isEmpty()) {
            return 0;
        }

        Map<Long, UserNotification> userNotificationMap = getUserNotificationMap(userId, visibleNotificationIds);
        LocalDateTime now = LocalDateTime.now();
        int affected = 0;

        for (Long notificationId : visibleNotificationIds) {
            UserNotification userNotification = userNotificationMap.get(notificationId);
            if (userNotification == null) {
                UserNotification readRecord = new UserNotification();
                readRecord.setUserId(userId);
                readRecord.setNotificationId(notificationId);
                readRecord.setIsRead(1);
                readRecord.setReadTime(now);
                readRecord.setCreateTime(now);
                userNotificationMapper.insert(readRecord);
                affected++;
                continue;
            }

            if (userNotification.getIsRead() == null || userNotification.getIsRead() == 0) {
                userNotification.setIsRead(1);
                userNotification.setReadTime(now);
                userNotificationMapper.updateById(userNotification);
                affected++;
            }
        }

        return affected;
    }

    @Override
    public Long getUnreadCount(Long userId) {
        List<Long> visibleNotificationIds = listVisibleNotificationIds(userId);
        if (visibleNotificationIds.isEmpty()) {
            return 0L;
        }

        long readCount = userNotificationMapper.selectCount(
                new LambdaQueryWrapper<UserNotification>()
                        .eq(UserNotification::getUserId, userId)
                        .eq(UserNotification::getIsRead, 1)
                        .in(UserNotification::getNotificationId, visibleNotificationIds));

        return Math.max(0L, visibleNotificationIds.size() - readCount);
    }

    @Override
    @Transactional
    public void batchDelete(List<Long> ids) {
        removeByIds(ids);

        userNotificationMapper.delete(
                new LambdaQueryWrapper<UserNotification>()
                        .in(UserNotification::getNotificationId, ids));
    }

    @Override
    @Transactional
    public void sendEmail(Long userId, String title, String content) {
        log.info("发送邮件通知给用户{}, 标题: {}", userId, title);
    }

    @Override
    @Transactional
    public void sendInApp(Long userId, String title, String content) {
        log.info("发送站内信给用户{}, 标题: {}", userId, title);

        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setContent(content);
        notification.setTargetType("specific");
        notification.setTargetUserIds(String.valueOf(userId));
        notification.setCreateTime(LocalDateTime.now());
        notification.setIsPublished(1);
        save(notification);

        UserNotification userNotification = new UserNotification();
        userNotification.setUserId(userId);
        userNotification.setNotificationId(notification.getId());
        userNotification.setIsRead(0);
        userNotification.setCreateTime(LocalDateTime.now());
        userNotificationMapper.insert(userNotification);
    }

    private LambdaQueryWrapper<Notification> buildVisibleNotificationWrapper(Long userId, String type) {
        LocalDateTime now = LocalDateTime.now();
        boolean activeVip = isActiveVip(userId, now);
        List<Long> relatedNotificationIds = userNotificationMapper.selectList(
                new LambdaQueryWrapper<UserNotification>()
                        .eq(UserNotification::getUserId, userId))
                .stream()
                .map(UserNotification::getNotificationId)
                .collect(Collectors.toList());

        LambdaQueryWrapper<Notification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Notification::getIsPublished, 1)
                .and(condition -> condition
                        .isNull(Notification::getExpireTime)
                        .or()
                        .gt(Notification::getExpireTime, now))
                .and(condition -> {
                    boolean hasAnyCondition = false;
                    if (!relatedNotificationIds.isEmpty()) {
                        condition.nested(staticCondition -> staticCondition
                                .in(Notification::getId, relatedNotificationIds)
                                .notIn(Notification::getTargetType, "all_future", "vip_future"));
                        hasAnyCondition = true;
                    }
                    if (hasAnyCondition) {
                        condition.or();
                    }
                    condition.eq(Notification::getTargetType, "all_future");

                    if (activeVip) {
                        condition.or().eq(Notification::getTargetType, "vip_future");
                    }
                });

        if (type != null && !type.isBlank()) {
            wrapper.eq(Notification::getType, type);
        }

        wrapper.orderByDesc(Notification::getCreateTime);
        return wrapper;
    }

    private List<Long> listVisibleNotificationIds(Long userId) {
        List<Notification> visibleNotifications = list(buildVisibleNotificationWrapper(userId, null)
                .select(Notification::getId));

        Set<Long> visibleIds = new HashSet<>();
        for (Notification notification : visibleNotifications) {
            if (notification.getId() != null) {
                visibleIds.add(notification.getId());
            }
        }

        return new ArrayList<>(visibleIds);
    }

    private void annotateReadState(Long userId, List<Notification> notifications) {
        if (notifications == null || notifications.isEmpty()) {
            return;
        }

        List<Long> notificationIds = notifications.stream()
                .map(Notification::getId)
                .filter(id -> id != null)
                .collect(Collectors.toList());

        if (notificationIds.isEmpty()) {
            return;
        }

        Map<Long, UserNotification> userNotificationMap = getUserNotificationMap(userId, notificationIds);
        notifications.forEach(notification -> applyReadState(notification, userNotificationMap.get(notification.getId())));
    }

    private Map<Long, UserNotification> getUserNotificationMap(Long userId, List<Long> notificationIds) {
        if (notificationIds == null || notificationIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return userNotificationMapper.selectList(
                new LambdaQueryWrapper<UserNotification>()
                        .eq(UserNotification::getUserId, userId)
                        .in(UserNotification::getNotificationId, notificationIds))
                .stream()
                .collect(Collectors.toMap(
                        UserNotification::getNotificationId,
                        Function.identity(),
                        (left, right) -> right));
    }

    private void applyReadState(Notification notification, UserNotification userNotification) {
        if (notification == null) {
            return;
        }

        if (userNotification != null) {
            notification.setIsRead(userNotification.getIsRead());
            notification.setReadTime(userNotification.getReadTime());
            return;
        }

        notification.setIsRead(0);
        notification.setReadTime(null);
    }

    private List<Notification> filterByReadStatus(List<Notification> notifications, Integer readStatus) {
        if (notifications == null || notifications.isEmpty() || readStatus == null) {
            return notifications == null ? new ArrayList<>() : notifications;
        }

        return notifications.stream()
                .filter(notification -> readStatus.equals(notification.getIsRead()))
                .collect(Collectors.toList());
    }

    private String normalizeType(String type) {
        if (type == null) {
            return null;
        }

        String normalized = type.trim();
        if (normalized.isEmpty() || "all".equalsIgnoreCase(normalized)) {
            return null;
        }

        return normalized;
    }

    private Integer normalizeReadStatus(Integer readStatus) {
        if (readStatus == null) {
            return null;
        }

        return (readStatus == 0 || readStatus == 1) ? readStatus : null;
    }

    private boolean isNotificationVisibleToUser(Long userId, Long notificationId) {
        Notification notification = getById(notificationId);
        if (notification == null || notification.getIsPublished() == null || notification.getIsPublished() != 1) {
            return false;
        }

        LocalDateTime expireTime = notification.getExpireTime();
        LocalDateTime now = LocalDateTime.now();
        if (expireTime != null && !expireTime.isAfter(now)) {
            return false;
        }

        String targetType = notification.getTargetType();
        if ("all_future".equals(targetType)) {
            return true;
        }

        if ("vip_future".equals(targetType)) {
            return isActiveVip(userId, now);
        }

        return userNotificationMapper.selectCount(
                new LambdaQueryWrapper<UserNotification>()
                        .eq(UserNotification::getUserId, userId)
                        .eq(UserNotification::getNotificationId, notificationId)) > 0;
    }

    private boolean isActiveVip(Long userId, LocalDateTime now) {
        User user = userMapper.selectById(userId);
        return user != null
                && user.getStatus() != null
                && user.getStatus() == 1
                && user.getVipExpireTime() != null
                && user.getVipExpireTime().isAfter(now);
    }
}
