package com.learnsphere.task;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.learnsphere.entity.User;
import com.learnsphere.service.IUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * VIP 到期自动清理任务
 * 定期扫描数据库中已过期且未重置的 VIP 用户，恢复其基础额度
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class VipCleanupTask {

    private final IUserService userService;

    /**
     * 每分钟执行一次，清理过期的 VIP
     */
    @Scheduled(cron = "0 * * * * ?")
    public void cleanupExpiredVips() {
        LocalDateTime now = LocalDateTime.now();

        // 查找 VIP 已过期但 level 仍大于 0 的用户
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.le(User::getVipExpireTime, now)
                .gt(User::getVipLevel, 0);

        List<User> expiredUsers = userService.list(wrapper);
        if (expiredUsers.isEmpty()) {
            return;
        }

        int count = 0;
        for (User user : expiredUsers) {
            user.setVipLevel(0);
            user.setDailyAiQuota(5); // 恢复基础 AI 额度
            user.setDailyTutorQuota(200); // 恢复基础助教额度
            userService.updateById(user);
            count++;
            log.info("用户 [{}] VIP 已到期，已自动清除 VIP 状态并恢复基础配额",
                    user.getUsername() != null ? user.getUsername() : user.getId());
        }

        log.info("本次共清理 {} 个已过期的 VIP 用户", count);
    }
}
