package com.dujiangyan.game.dto;

/**
 * 关卡配置 DTO
 * 来源：ARCHITECTURE §3.2, §5.2.1
 */
public class LevelConfigDTO {

    private String id;
    private String name;
    private String description;
    private Object config;

    public LevelConfigDTO() {
    }

    public LevelConfigDTO(String id, String name, String description, Object config) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.config = config;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Object getConfig() {
        return config;
    }

    public void setConfig(Object config) {
        this.config = config;
    }
}
