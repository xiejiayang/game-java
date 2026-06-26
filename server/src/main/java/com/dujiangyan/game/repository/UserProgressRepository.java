package com.dujiangyan.game.repository;

import com.dujiangyan.game.entity.UserProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgressEntity, Long> {

    Optional<UserProgressEntity> findByUserId(String userId);
}
