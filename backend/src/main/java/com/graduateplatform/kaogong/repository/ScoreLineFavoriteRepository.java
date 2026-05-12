package com.graduateplatform.kaogong.repository;

import com.graduateplatform.kaogong.entity.ScoreLineFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ScoreLineFavoriteRepository extends JpaRepository<ScoreLineFavorite, Long> {
    List<ScoreLineFavorite> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<ScoreLineFavorite> findByUserIdAndScoreLineId(Long userId, Long scoreLineId);
    boolean existsByUserIdAndScoreLineId(Long userId, Long scoreLineId);
    void deleteByUserIdAndScoreLineId(Long userId, Long scoreLineId);
}
