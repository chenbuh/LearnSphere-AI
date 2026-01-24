package com.learnsphere.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.learnsphere.dto.LoginDTO;
import com.learnsphere.dto.RegisterDTO;
import com.learnsphere.entity.User;
import com.learnsphere.exception.BusinessException;
import com.learnsphere.mapper.UserMapper;
import com.learnsphere.service.IUserService;
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
        // 查询用户
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, loginDTO.getUsername());
        User user = this.getOne(wrapper);

        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 验证密码 (Salted hash check)
        if (!PasswordUtil.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new BusinessException("密码错误");
        }

        // 检查用户状态
        if (user.getStatus() == 0) {
            throw new BusinessException("账号已被禁用");
        }

        // 更新最后登录时间（用于留存率统计）
        user.setLastLoginTime(LocalDateTime.now());
        this.updateById(user);

        // 清空密码信息，防止泄露
        user.setPassword(null);
        return user;
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

        // 检查邮箱是否存在
        if (registerDTO.getEmail() != null) {
            wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(User::getEmail, registerDTO.getEmail());
            if (this.count(wrapper) > 0) {
                throw new BusinessException("邮箱已被注册");
            }
        }

        // 创建用户
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        // 使用密码工具类加密密码，自动生成盐
        user.setPassword(PasswordUtil.encode(registerDTO.getPassword()));
        user.setEmail(registerDTO.getEmail());
        user.setNickname(registerDTO.getNickname() != null ? registerDTO.getNickname() : registerDTO.getUsername());
        user.setStatus(1);

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

        // 加密新密码并更新
        user.setPassword(PasswordUtil.encode(newPassword));
        this.updateById(user);
    }

    @Override
    public void resetPassword(String username, String email, String newPassword) {
        // 通过用户名和邮箱查询用户 (安全双重校验)
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, username).eq(User::getEmail, email);
        User user = this.getOne(wrapper);

        if (user == null) {
            throw new BusinessException("用户信息校验失败，请检查用户名或注册邮箱是否正确");
        }

        // 模拟验证码校验通过，执行重置
        user.setPassword(PasswordUtil.encode(newPassword));
        this.updateById(user);
    }
}
