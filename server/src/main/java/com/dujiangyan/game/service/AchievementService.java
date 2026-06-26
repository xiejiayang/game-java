package com.dujiangyan.game.service;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * 成就/排行榜服务预留
 * MVP 不开放具体功能。
 * 来源：PRD §3.2, ARCHITECTURE §3.2, §8.3
 */
@Service
public class AchievementService {

    public List<Object> getAchievements(String userId) {
        return Collections.emptyList();
    }
}
