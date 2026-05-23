package com.graduateplatform.kaoyan.repository;

import com.graduateplatform.kaoyan.entity.GraduateScoreLineFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface GraduateScoreLineFavoriteRepository extends JpaRepository<GraduateScoreLineFavorite, Long> {
    List<GraduateScoreLineFavorite> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<GraduateScoreLineFavorite> findByUserIdAndScoreLineId(Long userId, Long scoreLineId);
    boolean existsByUserIdAndScoreLineId(Long userId, Long scoreLineId);
    void deleteByUserIdAndScoreLineId(Long userId, Long scoreLineId);
}