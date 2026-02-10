package com.learnsphere.dto;

import lombok.Data;
import java.util.List;

/**
 * 批量发送通知 DTO
 */
@Data
public class BatchNotifyDTO {
    private List<Long> userIds;
    private String title;
    private String content;
    private String type; // "system", "email", "both"
}
