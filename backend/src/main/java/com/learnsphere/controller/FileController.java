package com.learnsphere.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.learnsphere.common.Result;
import com.learnsphere.entity.User;
import com.learnsphere.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * 文件上传控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/file")
@RequiredArgsConstructor
public class FileController {

    private static final int MAX_AVATAR_DIMENSION = 4096;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif");
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".gif");

    private final UserMapper userMapper;

    /**
     * 上传头像
     */
    @PostMapping("/upload/avatar")
    public Result<String> uploadAvatar(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("文件不能为空");
        }

        String contentType = normalizeContentType(file.getContentType());
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            return Result.error("仅支持 JPG、PNG、GIF 图片上传");
        }

        try {
            BufferedImage avatarImage = readAvatarImage(file);
            if (avatarImage == null) {
                return Result.error("文件内容校验失败，请上传有效图片");
            }
            if (avatarImage.getWidth() <= 0 || avatarImage.getHeight() <= 0
                    || avatarImage.getWidth() > MAX_AVATAR_DIMENSION
                    || avatarImage.getHeight() > MAX_AVATAR_DIMENSION) {
                return Result.error("图片尺寸超出限制");
            }

            // 确保目录存在
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads" + File.separator + "avatars";
            File dir = new File(uploadDir);
            if (!dir.exists() && !dir.mkdirs()) {
                return Result.error("创建上传目录失败");
            }

            // 先校验扩展名，再统一转码为安全的 PNG 输出
            String originalFilename = file.getOriginalFilename();
            String extension = ".jpg";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase(Locale.ROOT);
            }
            if (!ALLOWED_EXTENSIONS.contains(extension)) {
                return Result.error("文件扩展名不受支持");
            }
            String fileName = UUID.randomUUID() + ".png";

            // 保存为服务端重编码后的 PNG，避免直接公开原始上传内容
            File dest = new File(uploadDir + File.separator + fileName);
            if (!ImageIO.write(avatarImage, "png", dest)) {
                log.error("头像上传失败，PNG 编码器不可用");
                return Result.error("图片处理失败");
            }

            // 构建访问 URL
            String avatarUrl = "/uploads/avatars/" + fileName;

            // 更新用户信息
            Long userId = StpUtil.getLoginIdAsLong();
            User user = userMapper.selectById(userId);
            if (user != null) {
                user.setAvatar(avatarUrl);
                userMapper.updateById(user);
            }

            return Result.success(avatarUrl);
        } catch (IOException e) {
            log.error("头像上传失败", e);
            return Result.error("上传异常: " + e.getMessage());
        }
    }

    private String normalizeContentType(String contentType) {
        return contentType == null ? "" : contentType.toLowerCase(Locale.ROOT).trim();
    }

    private BufferedImage readAvatarImage(MultipartFile file) {
        try {
            return ImageIO.read(file.getInputStream());
        } catch (IOException e) {
            log.warn("图片内容校验失败", e);
            return null;
        }
    }
}
