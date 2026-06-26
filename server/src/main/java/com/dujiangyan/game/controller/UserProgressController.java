package com.dujiangyan.game.controller;

import com.dujiangyan.game.dto.ApiResponse;
import com.dujiangyan.game.dto.UserProgressDTO;
import com.dujiangyan.game.service.UserProgressService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 用户进度 API
 * 来源：ARCHITECTURE §5.2.2, §8.2
 */
@RestController
@RequestMapping("/api/v1")
public class UserProgressController {

    private final UserProgressService userProgressService;

    public UserProgressController(UserProgressService userProgressService) {
        this.userProgressService = userProgressService;
    }

    @GetMapping("/users/{userId}/progress")
    public ApiResponse<UserProgressDTO> getProgress(@PathVariable String userId) {
        return userProgressService.getProgress(userId)
                .map(ApiResponse::ok)
                .orElse(ApiResponse.error(404, "Progress not found"));
    }

    @PostMapping("/users/{userId}/progress")
    public ApiResponse<UserProgressDTO> saveProgress(@PathVariable String userId, @RequestBody Object save) {
        return ApiResponse.ok(userProgressService.saveProgress(userId, save));
    }
}
