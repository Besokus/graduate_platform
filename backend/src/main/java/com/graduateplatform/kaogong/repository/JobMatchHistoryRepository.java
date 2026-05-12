package com.graduateplatform.kaogong.repository;

import com.graduateplatform.kaogong.entity.JobMatchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobMatchHistoryRepository extends JpaRepository<JobMatchHistory, Long> {
    List<JobMatchHistory> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
}
