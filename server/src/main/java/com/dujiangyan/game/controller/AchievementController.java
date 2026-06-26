package com.dujiangyan.game.controller;

import com.dujiangyan.game.dto.ApiResponse;
import com.dujiangyan.game.service.AchievementService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 成就/排行榜 API 预留
 * 来源：ARCHITECTURE §8.3
 */
@RestController
@RequestMapping("/api/v1")
public class AchievementController {

    private final AchievementService achievementService;

    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @GetMapping("/users/{userId}/achievements")
    public ApiResponse<List<Object>> getAchievements(@PathVariable String userId) {
        return ApiResponse.ok(achievementService.getAchievements(userId));
    }
}
