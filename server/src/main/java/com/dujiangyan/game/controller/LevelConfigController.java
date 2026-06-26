package com.dujiangyan.game.controller;

import com.dujiangyan.game.dto.ApiResponse;
import com.dujiangyan.game.dto.LevelConfigDTO;
import com.dujiangyan.game.service.LevelConfigService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 关卡配置 API
 * 来源：ARCHITECTURE §5.2.1, §8.1
 */
@RestController
@RequestMapping("/api/v1")
public class LevelConfigController {

    private final LevelConfigService levelConfigService;

    public LevelConfigController(LevelConfigService levelConfigService) {
        this.levelConfigService = levelConfigService;
    }

    @GetMapping("/levels")
    public ApiResponse<List<LevelConfigDTO>> getLevels() {
        return ApiResponse.ok(levelConfigService.getAllLevels());
    }

    @GetMapping("/levels/{levelId}")
    public ApiResponse<LevelConfigDTO> getLevel(@PathVariable String levelId) {
        return levelConfigService.getLevelById(levelId)
                .map(ApiResponse::ok)
                .orElse(ApiResponse.error(404, "Level not found"));
    }

    @GetMapping("/blocks")
    public ApiResponse<List<LevelConfigDTO>> getBlocks() {
        // MVP 中通过关卡配置或独立 blocks.json 下发；此处复用 DTO 占位
        return ApiResponse.ok(levelConfigService.getAllLevels());
    }
}
