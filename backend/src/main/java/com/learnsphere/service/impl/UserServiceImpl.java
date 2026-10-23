package com.learnsphere.service.impl;

import lombok.extern.slf4j.Slf4j;
import com.learnsphere.mapper.SensitiveWordMapper;
import com.learnsphere.service.NotificationService;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.dto.LoginDTO;
import com.learnsphere.dto.RegisterDTO;
import com.learnsphere.entity.User;
import com.learnsphere.exception.BusinessException;
import com.learnsphere.mail.EmailCodeService;
import com.learnsphere.mapper.UserMapper;
import com.learnsphere.service.IUserService;
import com.learnsphere.utils.PasswordPolicy;
import com.learnsphere.utils.PasswordUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * 用户服务实现
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {

    /**
     * 用户不存在时用于恒定耗时校验的占位哈希。
     * 它是一个合法的 BCrypt 串，但对应的原文无人知晓，因此永远匹配失败。
     */
    private static final String DUMMY_BCRYPT_HASH =
            "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

    private final com.learnsphere.service.ILearningRecordService learningRecordService;
    private final com.learnsphere.service.IAIGenerationLogService aiGenerationLogService;
    private final com.learnsphere.service.ICheckinService checkinService;
    private final org.springframework.data.redis.core.StringRedisTemplate redisTemplate;
    // 新增依赖
    private final SensitiveWordMapper sensitiveWordMapper;
    private final NotificationService notificationService;
    private final com.learnsphere.mail.MailService mailService;
    private final EmailCodeService emailCodeService;
    // 已在上方声明，删除重复声明

    /**
     * 用户登录处理
     * 1. 验证用户是否存在
     * 2. 使用 PasswordUtil 校验加盐密码
     * 3. 检查账号是否被禁用
     * 4. 记录最后登录时间（用于计算 DAU/留存）
     * 5. 返回脱敏后的用户信息
     *
     * @param loginDTO 登录数据传输对象
     * @return User 登录成功的用户对象（不含密码）
     */
    @Override
    public User login(LoginDTO loginDTO) {
        String username = loginDTO.getUsername();
        String failKey = "login_fail_count:" + username;

        // 1. 检查失败次数
        String countStr = redisTemplate.opsForValue().get(failKey);
        int failCount = countStr == null ? 0 : Integer.parseInt(countStr);

        // 2. 如果失败次数 >= 3，要求验证码
        if (failCount >= 3) {
            if (cn.hutool.core.util.StrUtil.isBlank(loginDTO.getCaptchaCode())
                    || cn.hutool.core.util.StrUtil.isBlank(loginDTO.getCaptchaKey())) {
                throw new BusinessException("请输入验证码");
            }

            String captchaKey = "login_captcha:" + loginDTO.getCaptchaKey();
            String cachedCode = redisTemplate.opsForValue().get(captchaKey);
            if (cachedCode == null) {
                throw new BusinessException("验证码已过期");
            }
            if (!cachedCode.equalsIgnoreCase(loginDTO.getCaptchaCode())) {
                throw new BusinessException("验证码错误");
            }
            // 验证通过，删除验证码
            redisTemplate.delete(captchaKey);
        }

        // 查询用户
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, username);
        User user = this.getOne(wrapper);

        // 用户不存在时也跑一次 BCrypt，避免通过响应时间差异枚举账号；
        // 提示文案与密码错误保持一致，避免通过文案直接探测账号是否存在。
        if (user == null) {
            // 固定的无效哈希：与真实密码校验耗时一致，但永远不会匹配成功
            PasswordUtil.matches(loginDTO.getPassword(), DUMMY_BCRYPT_HASH);
            recordLoginFailure(failKey, failCount);
            throw new BusinessException("用户名或密码错误");
        }

        // 验证密码 (Salted hash check)
        if (!PasswordUtil.matches(loginDTO.getPassword(), user.getPassword())) {
            recordLoginFailure(failKey, failCount);
            throw new BusinessException("用户名或密码错误");
        }

        // 检查用户状态
        if (user.getStatus() == 0) {
            throw new BusinessException("账号已被禁用");
        }

        // 登录成功，重置失败次数
        redisTemplate.delete(failKey);

        // 更新最后登录时间（用于留存率统计）
        user.setLastLoginTime(LocalDateTime.now());
        this.updateById(user);

        // 清空密码信息，防止泄露
        user.setPassword(null);
        user.setSalt(null);
        user.setMfaSecret(null);
        return user;
    }

    /**
     * 记录一次登录失败。
     *
     * <p>提示统一为“用户名或密码错误”后，不再暴露剩余尝试次数，
     * 因为次数本身会让攻击者确认账号存在。计数仍然保留，用于触发验证码。
     */
    private void recordLoginFailure(String failKey, int failCount) {
        int next = failCount + 1;
        redisTemplate.opsForValue().set(failKey, String.valueOf(next), 1,
                java.util.concurrent.TimeUnit.HOURS);
    }

    /**
     * 用户注册
     * 包含唯一性校验（用户名/邮箱）和密码加密存储。
     *
     * @param registerDTO 注册数据对象
     */
    @Override
    public void register(RegisterDTO registerDTO) {
        // 检查用户名是否存在
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, registerDTO.getUsername());
        if (this.count(wrapper) > 0) {
            throw new BusinessException("用户名已存在");
        }

        // 邮箱必填且唯一，开启邮件服务时需校验邮箱验证码
        String email = EmailCodeService.normalize(registerDTO.getEmail());
        if (!EmailCodeService.isValidEmail(email)) {
            throw new BusinessException("请输入有效的邮箱地址");
        }
        if (isEmailRegistered(email)) {
            throw new BusinessException("邮箱已被注册");
        }
        if (mailService.isEnabled()) {
            emailCodeService.verify(EmailCodeService.SCENE_REGISTER, email, registerDTO.getEmailCode());
        }
        registerDTO.setEmail(email);

        // 密码强度校验（BCrypt 挡不住弱密码被直接猜中）
        String passwordError = PasswordPolicy.validate(registerDTO.getPassword());
        if (passwordError != null) {
            throw new BusinessException(passwordError);
        }

        // 创建用户
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        // 使用密码工具类加密密码，自动生成盐
        user.setPassword(PasswordUtil.encode(registerDTO.getPassword()));
        user.setEmail(registerDTO.getEmail());
        user.setNickname(registerDTO.getNickname() != null ? registerDTO.getNickname() : registerDTO.getUsername());
        user.setStatus(1);
        user.setDeleted(0);

        this.save(user);
    }

    @Override
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        // 获取用户信息
        User user = this.getById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 验证旧密码
        if (!PasswordUtil.matches(oldPassword, user.getPassword())) {
            throw new BusinessException("原密码错误");
        }

        String passwordError = PasswordPolicy.validate(newPassword);
        if (passwordError != null) {
            throw new BusinessException(passwordError);
        }
        if (PasswordUtil.matches(newPassword, user.getPassword())) {
            throw new BusinessException("新密码不能与原密码相同");
        }

        // 加密新密码并更新
        user.setPassword(PasswordUtil.encode(newPassword));
        this.updateById(user);
    }

    @Override
    public void resetPassword(String email, String code, String newPassword) {
        String normalized = EmailCodeService.normalize(email);
        // 先校验验证码：邮箱未注册时根本不会生成验证码，提示与验证码错误一致，不暴露注册情况
        emailCodeService.verify(EmailCodeService.SCENE_RESET, normalized, code);
        User user = findByEmail(normalized);
        if (user == null) {
            throw new BusinessException("验证码已过期或未发送，请重新获取");
        }
        String passwordError = PasswordPolicy.validate(newPassword);
        if (passwordError != null) {
            throw new BusinessException(passwordError);
        }
        user.setPassword(PasswordUtil.encode(newPassword));
        this.updateById(user);
        // 重置密码后踢下线所有已登录会话
        cn.dev33.satoken.stp.StpUtil.logout(user.getId());
    }

    @Override
    public boolean isEmailRegistered(String email) {
        return findByEmail(email) != null;
    }

    @Override
    public void bindEmail(Long userId, String email, String code) {
        String normalized = EmailCodeService.normalize(email);
        if (!EmailCodeService.isValidEmail(normalized)) {
            throw new BusinessException("请输入有效的邮箱地址");
        }
        User owner = findByEmail(normalized);
        if (owner != null && !owner.getId().equals(userId)) {
            throw new BusinessException("该邮箱已被其他账号绑定");
        }
        emailCodeService.verify(EmailCodeService.SCENE_BIND + ":" + userId, normalized, code);
        this.update(null, new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<User>()
                .eq(User::getId, userId)
                .set(User::getEmail, normalized));
    }

    /** 邮箱大小写不敏感匹配（历史数据可能未统一小写） */
    private User findByEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }
        return this.getOne(new LambdaQueryWrapper<User>()
                .apply("LOWER(email) = {0}", email)
                .last("LIMIT 1"), false);
    }

    /**
     * 获取用户完整档案
     * 包含学习轨迹、AI使用画像、活跃度分析、价值分层
     */
    @Override
    public com.learnsphere.dto.UserProfileDTO getUserCompleteProfile(Long userId) {
        User user = this.getById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        com.learnsphere.dto.UserProfileDTO profile = new com.learnsphere.dto.UserProfileDTO();

        // 基础用户信息
        com.learnsphere.dto.UserProfileDTO.UserBasicInfo basicInfo = new com.learnsphere.dto.UserProfileDTO.UserBasicInfo();
        basicInfo.setId(user.getId());
        basicInfo.setUsername(user.getUsername());
        basicInfo.setNickname(user.getNickname());
        basicInfo.setEmail(user.getEmail());
        basicInfo.setAvatar(user.getAvatar());
        basicInfo.setCreateTime(user.getCreateTime() != null ? user.getCreateTime().toString() : null);
        basicInfo.setUpdateTime(user.getUpdateTime() != null ? user.getUpdateTime().toString() : null);
        basicInfo.setLastLoginTime(user.getLastLoginTime() != null ? user.getLastLoginTime().toString() : null);
        profile.setUser(basicInfo);

        // VIP 信息
        boolean isVip = user.getVipExpireTime() != null && user.getVipExpireTime().isAfter(LocalDateTime.now());
        profile.setVip(isVip);
        profile.setVipExpireTime(user.getVipExpireTime() != null ? user.getVipExpireTime().toString() : null);

        // 基础统计（使用真实数据）
        com.learnsphere.dto.UserProfileDTO.Statistics stats = new com.learnsphere.dto.UserProfileDTO.Statistics();
        long learningCount = learningRecordService.count(
                new LambdaQueryWrapper<com.learnsphere.entity.LearningRecord>()
                        .eq(com.learnsphere.entity.LearningRecord::getUserId, userId));
        stats.setTotalWordsLearned((int) learningCount);

        long aiUsageCount = aiGenerationLogService.count(
                new LambdaQueryWrapper<com.learnsphere.entity.AIGenerationLog>()
                        .eq(com.learnsphere.entity.AIGenerationLog::getUserId, userId));
        stats.setTotalAiUsage((int) aiUsageCount);

        // Check-in data (Handle potential null service or errors)
        Integer consecutiveDays = 0;
        if (checkinService != null) {
            try {
                consecutiveDays = checkinService.getConsecutiveDays(userId);
                if (consecutiveDays == null)
                    consecutiveDays = 0;
            } catch (Exception e) {
                log.warn("Failed to get checkin days for user " + userId + ". " + e.toString());
            }
        }
        stats.setTotalCheckins(consecutiveDays);
        stats.setStudyStreak(consecutiveDays);
        profile.setStatistics(stats);

        // 学习轨迹 - 最近10条学习记录
        com.learnsphere.dto.UserProfileDTO.LearningTrack learningTrack = new com.learnsphere.dto.UserProfileDTO.LearningTrack();
        java.util.List<com.learnsphere.entity.LearningRecord> recentRecords = learningRecordService.list(
                new LambdaQueryWrapper<com.learnsphere.entity.LearningRecord>()
                        .eq(com.learnsphere.entity.LearningRecord::getUserId, userId)
                        .orderByDesc(com.learnsphere.entity.LearningRecord::getCreateTime)
                        .last("LIMIT 10"));

        java.util.List<com.learnsphere.dto.UserProfileDTO.RecentActivity> activities = new java.util.ArrayList<>();
        if (recentRecords != null) {
            for (com.learnsphere.entity.LearningRecord record : recentRecords) {
                com.learnsphere.dto.UserProfileDTO.RecentActivity activity = new com.learnsphere.dto.UserProfileDTO.RecentActivity();
                activity.setType(record.getContentType());
                activity.setTitle((record.getContentType() != null ? record.getContentType() : "Unknown") + " #"
                        + record.getContentId());
                activity.setTime(record.getCreateTime() != null ? record.getCreateTime().toString() : "");
                activity.setScore(record.getScore());
                activities.add(activity);
            }
        }
        learningTrack.setRecentActivities(activities);

        // 学科偏好分布
        java.util.Map<String, Integer> subjectPreference = new java.util.HashMap<>();
        if (recentRecords != null && !recentRecords.isEmpty()) {
            java.util.Map<String, Long> typeCount = recentRecords.stream()
                    .filter(r -> r.getContentType() != null)
                    .collect(java.util.stream.Collectors.groupingBy(
                            com.learnsphere.entity.LearningRecord::getContentType,
                            java.util.stream.Collectors.counting()));
            typeCount.forEach((type, count) -> subjectPreference.put(type, count.intValue()));
        }
        learningTrack.setSubjectPreference(subjectPreference);
        profile.setLearningTrack(learningTrack);

        // 价值分层分析
        com.learnsphere.dto.UserProfileDTO.ValueSegmentation valueSegmentation = new com.learnsphere.dto.UserProfileDTO.ValueSegmentation();
        java.util.List<String> reasons = new java.util.ArrayList<>();

        long daysActive = 0;
        if (recentRecords != null) {
            daysActive = recentRecords.stream()
                    .filter(r -> r.getCreateTime() != null
                            && r.getCreateTime().isAfter(LocalDateTime.now().minusDays(7)))
                    .count();
        }

        String segment = "普通学员";
        int engagementScore = 50;
        int churnRisk = 50;

        if (daysActive >= 5 && aiUsageCount > 50 && !isVip) {
            segment = "高潜力用户";
            engagementScore = 85;
            churnRisk = 15;
            reasons.add("近7天活跃≥5天");
            reasons.add("AI使用频繁");
            reasons.add("未购买VIP");
        } else if (daysActive >= 3 && consecutiveDays >= 3) {
            segment = "活跃用户";
            engagementScore = 70;
            churnRisk = 25;
            reasons.add("近7天活跃≥3天");
            reasons.add("连续签到≥3天");
        } else if (user.getLastLoginTime() != null &&
                user.getLastLoginTime().isBefore(LocalDateTime.now().minusDays(30))) {
            segment = "流失风险";
            engagementScore = 20;
            churnRisk = 85;
            reasons.add("30天未登录");
        }

        valueSegmentation.setSegment(segment);
        valueSegmentation.setLtv((int) (aiUsageCount * 2 + learningCount));
        valueSegmentation.setEngagementScore(engagementScore);
        valueSegmentation.setChurnRisk(churnRisk);
        valueSegmentation.setReasons(reasons);
        profile.setValueSegmentation(valueSegmentation);

        profile.setUserTag(segment);
        profile.setRiskLevel(churnRisk > 70 ? "HIGH" : churnRisk > 40 ? "MEDIUM" : "LOW");

        // 技能评分
        java.util.Map<String, Integer> skillScores = new java.util.HashMap<>();
        String[] types = { "vocabulary", "grammar", "reading", "listening", "speaking", "writing" };
        for (String type : types) {
            java.util.List<com.learnsphere.entity.LearningRecord> typeRecords = learningRecordService.list(
                    new LambdaQueryWrapper<com.learnsphere.entity.LearningRecord>()
                            .eq(com.learnsphere.entity.LearningRecord::getUserId, userId)
                            .eq(com.learnsphere.entity.LearningRecord::getContentType, type));

            Double avgScore = 0.0;
            if (typeRecords != null && !typeRecords.isEmpty()) {
                avgScore = typeRecords.stream()
                        .filter(r -> r.getScore() != null)
                        .mapToInt(com.learnsphere.entity.LearningRecord::getScore)
                        .average()
                        .orElse(0.0);
            }
            skillScores.put(type, avgScore.intValue());
        }
        profile.setSkillScores(skillScores);

        // 使用趋势
        java.util.List<com.learnsphere.dto.UserProfileDTO.TrendData> usageTrend = new java.util.ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDate date = java.time.LocalDate.now().minusDays(i);
            long dayActivity = learningRecordService.count(
                    new LambdaQueryWrapper<com.learnsphere.entity.LearningRecord>()
                            .eq(com.learnsphere.entity.LearningRecord::getUserId, userId)
                            .ge(com.learnsphere.entity.LearningRecord::getCreateTime, date.atStartOfDay())
                            .lt(com.learnsphere.entity.LearningRecord::getCreateTime, date.plusDays(1).atStartOfDay()));
            com.learnsphere.dto.UserProfileDTO.TrendData trend = new com.learnsphere.dto.UserProfileDTO.TrendData();
            trend.setDate(date.toString());
            trend.setValue((int) dayActivity);
            usageTrend.add(trend);
        }
        profile.setUsageTrend(usageTrend);

        return profile;
    }

    /**
     * 批量发送通知
     */
    @Override
    public void batchNotifyUsers(com.learnsphere.dto.BatchNotifyDTO dto) {
        if (dto.getUserIds() == null || dto.getUserIds().isEmpty()) {
            throw new BusinessException("用户列表不能为空");
        }

        // 实现批量站内信或邮件通知（示例使用 JavaMailSender）
        if (notificationService == null) {
            // 若未注入具体实现，记录警告
            log.warn("NotificationService not configured, batchNotifyUsers will be a no‑op");
            return;
        }
        for (Long userId : dto.getUserIds()) {
            // 根据 dto.getType() 决定发送方式
            if ("email".equalsIgnoreCase(dto.getType())) {
                // 发送邮件
                notificationService.sendEmail(userId, dto.getTitle(), dto.getContent());
            } else {
                // 发送站内信
                notificationService.sendInApp(userId, dto.getTitle(), dto.getContent());
            }
        }
        // 需要注入 IUserNotificationService 或类似服务
        // 根据 dto.getType() 决定发送站内信还是邮件

        // 已在上方实现通知发送，移除冗余代码
    }

    /**
     * 批量赠送VIP
     */
    @Override
    public void batchGrantVip(com.learnsphere.dto.BatchVipDTO dto) {
        if (dto.getUserIds() == null || dto.getUserIds().isEmpty()) {
            throw new BusinessException("用户列表不能为空");
        }

        LocalDateTime expireTime = LocalDateTime.now().plusDays(dto.getDuration());
        for (Long userId : dto.getUserIds()) {
            User user = this.getById(userId);
            if (user != null) {
                user.setVipLevel(dto.getVipLevel());
                user.setVipExpireTime(expireTime);
                this.updateById(user);
                // 额度默认跟随系统设置，填写了自定义值才写入账户
                this.update(null, new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<User>()
                        .eq(User::getId, userId)
                        .set(User::getDailyAiQuota, dto.getDailyQuota())
                        .set(User::getDailyTutorQuota, null));
            }
        }
    }

    /**
     * 高级筛选用户
     */
    @Override
    public com.baomidou.mybatisplus.extension.plugins.pagination.Page<User> filterUsers(
            com.learnsphere.dto.FilterCriteriaDTO criteria, Integer page, Integer size) {

        com.baomidou.mybatisplus.extension.plugins.pagination.Page<User> pageParam = new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(
                page, size);
        LambdaQueryWrapper<User> query = new LambdaQueryWrapper<>();

        // TODO: 动态构建查询条件
        // 这里需要根据 criteria.getConditions() 动态构建查询
        // 支持 AND/OR 逻辑组合

        if (criteria != null && criteria.getConditions() != null) {
            for (com.learnsphere.dto.FilterCriteriaDTO.Condition condition : criteria.getConditions()) {
                applyCondition(query, condition);
            }
        }

        query.orderByDesc(User::getCreateTime);
        return this.page(pageParam, query);
    }

    /**
     * 应用单个筛选条件
     */
    private void applyCondition(LambdaQueryWrapper<User> query,
            com.learnsphere.dto.FilterCriteriaDTO.Condition condition) {
        String field = condition.getField();
        String operator = condition.getOperator();
        Object value = condition.getValue();

        // 根据字段和操作符动态构建查询
        if ("lastLoginTime".equals(field)) {
            if ("lessThan".equals(operator)) {
                // 例如：最近30天未登录
                if ("30days".equals(value)) {
                    LocalDateTime threshold = LocalDateTime.now().minusDays(30);
                    query.lt(User::getLastLoginTime, threshold);
                }
            }
        } else if ("points".equals(field)) {
            if ("greaterThan".equals(operator)) {
                query.gt(User::getPoints, value);
            }
        } else if ("vipStatus".equals(field)) {
            if ("equals".equals(operator)) {
                Boolean isVip = (Boolean) value;
                if (isVip) {
                    query.gt(User::getVipExpireTime, LocalDateTime.now());
                } else {
                    query.and(w -> w.isNull(User::getVipExpireTime)
                            .or().lt(User::getVipExpireTime, LocalDateTime.now()));
                }
            }
        }
        // 可以继续添加更多字段的处理逻辑
    }
}
