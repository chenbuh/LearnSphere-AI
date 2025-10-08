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

    @Override
    public User login(LoginDTO loginDTO) {
        // 查询用户
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, loginDTO.getUsername());
        User user = this.getOne(wrapper);

        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 验证密码
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

        // 清空密码信息
        user.setPassword(null);
        return user;
    }

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
}
