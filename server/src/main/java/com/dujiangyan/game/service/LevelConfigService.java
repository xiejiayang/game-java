package com.dujiangyan.game.service;

import com.dujiangyan.game.dto.ApiResponse;
import com.dujiangyan.game.dto.LevelConfigDTO;
import com.dujiangyan.game.entity.LevelConfigEntity;
import com.dujiangyan.game.repository.LevelConfigRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 关卡配置服务
 * 来源：ARCHITECTURE §8.1
 */
@Service
public class LevelConfigService {

    private final LevelConfigRepository repository;
    private final ObjectMapper objectMapper;

    public LevelConfigService(LevelConfigRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public List<LevelConfigDTO> getAllLevels() {
        return repository.findAllByOrderBySortOrderAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Optional<LevelConfigDTO> getLevelById(String levelId) {
        return repository.findById(levelId).map(this::toDto);
    }

    private LevelConfigDTO toDto(LevelConfigEntity entity) {
        Object config = null;
        try {
            config = objectMapper.readValue(entity.getConfigJson(), Object.class);
        } catch (Exception e) {
            config = entity.getConfigJson();
        }
        return new LevelConfigDTO(entity.getId(), entity.getName(), entity.getDescription(), config);
    }
}
