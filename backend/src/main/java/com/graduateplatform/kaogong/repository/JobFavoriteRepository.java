package com.graduateplatform.kaogong.repository;

import com.graduateplatform.kaogong.entity.JobFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface JobFavoriteRepository extends JpaRepository<JobFavorite, Long> {
    List<JobFavorite> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<JobFavorite> findByUserIdAndPostId(Long userId, Long postId);
    boolean existsByUserIdAndPostId(Long userId, Long postId);
    void deleteByUserIdAndPostId(Long userId, Long postId);
}
