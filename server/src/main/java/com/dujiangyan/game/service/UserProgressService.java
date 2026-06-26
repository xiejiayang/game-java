package com.dujiangyan.game.service;

import com.dujiangyan.game.dto.UserProgressDTO;
import com.dujiangyan.game.entity.UserProgressEntity;
import com.dujiangyan.game.repository.UserProgressRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

/**
 * 用户进度服务
 * 来源：ARCHITECTURE §5.2.2, §8.2
 */
@Service
public class UserProgressService {

    private final UserProgressRepository repository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public UserProgressService(UserProgressRepository repository,
                               StringRedisTemplate redisTemplate,
                               ObjectMapper objectMapper) {
        this.repository = repository;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public Optional<UserProgressDTO> getProgress(String userId) {
        String cacheKey = buildCacheKey(userId);
        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return Optional.ofNullable(parseCachedDto(cached));
        }

        Optional<UserProgressDTO> result = repository.findByUserId(userId).map(this::toDto);
        result.ifPresent(dto -> redisTemplate.opsForValue().set(cacheKey, toJson(dto), 5, TimeUnit.MINUTES));
        return result;
    }

    public UserProgressDTO saveProgress(String userId, Object save) {
        String saveJson = toJson(save);
        String version = extractVersion(save);

        UserProgressEntity entity = repository.findByUserId(userId)
                .orElse(new UserProgressEntity());

        entity.setUserId(userId);
        entity.setSaveJson(saveJson);
        entity.setVersion(version);
        entity.setUpdatedAt(Instant.now());

        UserProgressEntity saved = repository.save(entity);
        UserProgressDTO dto = toDto(saved);

        redisTemplate.opsForValue().set(buildCacheKey(userId), toJson(dto), 5, TimeUnit.MINUTES);
        return dto;
    }

    private UserProgressDTO toDto(UserProgressEntity entity) {
        Object save = parseSaveJson(entity.getSaveJson());
        return new UserProgressDTO(entity.getUserId(), save, entity.getVersion(), entity.getUpdatedAt());
    }

    private String buildCacheKey(String userId) {
        return "user:progress:" + userId;
    }

    private String extractVersion(Object save) {
        if (save instanceof java.util.Map) {
            Object version = ((java.util.Map<?, ?>) save).get("version");
            return version != null ? version.toString() : "0.1.0";
        }
        return "0.1.0";
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }

    private UserProgressDTO parseCachedDto(String json) {
        try {
            return objectMapper.readValue(json, UserProgressDTO.class);
        } catch (Exception e) {
            return null;
        }
    }

    private Object parseSaveJson(String json) {
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (Exception e) {
            return json;
        }
    }
}
