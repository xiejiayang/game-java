package com.dujiangyan.game.repository;

import com.dujiangyan.game.entity.LevelConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LevelConfigRepository extends JpaRepository<LevelConfigEntity, String> {

    List<LevelConfigEntity> findAllByOrderBySortOrderAsc();
}
