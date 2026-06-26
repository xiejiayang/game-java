package com.dujiangyan.game.dto;

import java.time.Instant;

/**
 * 用户进度 DTO
 * 来源：ARCHITECTURE §3.2, §5.2.2
 */
public class UserProgressDTO {

    private String userId;
    private Object save;
    private String version;
    private Instant updatedAt;

    public UserProgressDTO() {
    }

    public UserProgressDTO(String userId, Object save, String version, Instant updatedAt) {
        this.userId = userId;
        this.save = save;
        this.version = version;
        this.updatedAt = updatedAt;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Object getSave() {
        return save;
    }

    public void setSave(Object save) {
        this.save = save;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
