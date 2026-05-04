package com.graduateplatform.repository;

import com.graduateplatform.entity.Attempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AttemptRepository extends JpaRepository<Attempt, Long> {
    List<Attempt> findByUserId(Long userId);
    Page<Attempt> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    long countByUserId(Long userId);

    @Query("SELECT a FROM Attempt a " +
           "WHERE a.user.id = :userId " +
           "AND (:correct IS NULL OR a.correct = :correct) " +
           "AND (:keyword IS NULL OR a.question.stem LIKE %:keyword%) " +
           "AND (:fromTime IS NULL OR a.createdAt >= :fromTime) " +
           "AND (:toTime IS NULL OR a.createdAt <= :toTime)")
    Page<Attempt> findByUserWithFilters(
        @Param("userId") Long userId,
        @Param("correct") Boolean correct,
        @Param("keyword") String keyword,
        @Param("fromTime") LocalDateTime fromTime,
        @Param("toTime") LocalDateTime toTime,
        Pageable pageable
    );
}
