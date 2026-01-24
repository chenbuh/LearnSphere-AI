package com.learnsphere.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.learnsphere.dto.LoginDTO;
import com.learnsphere.dto.RegisterDTO;
import com.learnsphere.entity.User;

/**
 * 用户服务接口
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
public interface IUserService extends IService<User> {

    /**
     * 用户登录
     */
    User login(LoginDTO loginDTO);

    /**
     * 用户注册
     */
    void register(RegisterDTO registerDTO);

    /**
     * 修改密码
     * 
     * @param userId      用户ID
     * @param oldPassword 旧密码
     * @param newPassword 新密码
     */
    void changePassword(Long userId, String oldPassword, String newPassword);

    /**
     * 重置密码
     */
    void resetPassword(String username, String email, String newPassword);
}
