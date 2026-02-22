package com.learnsphere.service;

/**
 * 通知服务抽象，支持站内信和邮件两种方式
 */
public interface NotificationService {
    void sendEmail(Long userId, String title, String content);

    void sendInApp(Long userId, String title, String content);
}
