package com.learnsphere.mail;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * SMTP 邮件发送。未配置 spring.mail.host / username 时视为未开启，调用方据此降级。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${spring.mail.username:}")
    private String username;

    /** 发件地址，默认与 SMTP 账号相同（QQ 邮箱要求两者一致） */
    @Value("${app.mail.from:}")
    private String from;

    @Value("${app.mail.sender-name:LearnSphere AI}")
    private String senderName;

    public boolean isEnabled() {
        return mailSenderProvider.getIfAvailable() != null && StringUtils.hasText(username);
    }

    /** 异步发送 HTML 邮件，失败只记日志，不影响主流程 */
    @Async("mailExecutor")
    public void sendHtmlAsync(String to, String subject, String html) {
        try {
            sendHtml(to, subject, html);
        } catch (Exception e) {
            log.warn("邮件发送失败 to={} subject={}: {}", mask(to), subject, e.getMessage());
        }
    }

    public void sendHtml(String to, String subject, String html) throws Exception {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null || !StringUtils.hasText(username)) {
            throw new IllegalStateException("邮件服务未配置");
        }
        MimeMessage message = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(StringUtils.hasText(from) ? from : username, senderName);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        sender.send(message);
        log.info("邮件已发送 to={} subject={}", mask(to), subject);
    }

    /** 日志里只保留邮箱首字母和域名 */
    static String mask(String email) {
        if (email == null) {
            return null;
        }
        int at = email.indexOf('@');
        return at <= 1 ? "***" + email.substring(Math.max(at, 0)) : email.charAt(0) + "***" + email.substring(at);
    }
}
