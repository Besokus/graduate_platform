package com.graduateplatform.community.repository;

import com.graduateplatform.community.entity.PostReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostReportRepository extends JpaRepository<PostReport, Long> {
    boolean existsByPostIdAndReporterId(Long postId, Long reporterId);
    long countByPostIdAndStatus(Long postId, String status);
    Page<PostReport> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    Page<PostReport> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByStatus(String status);
}
