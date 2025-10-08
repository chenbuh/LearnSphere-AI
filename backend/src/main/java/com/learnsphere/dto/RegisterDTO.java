package com.learnsphere.dto;

import lombok.Data;

/**
 * 注册DTO
 * 
 * @author LearnSphere Team
 * @since 1.0.0
 */
@Data
public class RegisterDTO {
    private String username;
    private String password;
    private String email;
    private String nickname;
}
